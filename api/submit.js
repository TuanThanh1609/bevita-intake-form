// Simple in-memory rate limiter per lambda instance
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 60; // Form has ~17 screens, each triggers auto-save

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // --- Rate Limiting ---
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 1, startTime: now });
  } else {
    const record = ipRequests.get(ip);
    if (now - record.startTime > RATE_LIMIT_WINDOW) {
      ipRequests.set(ip, { count: 1, startTime: now });
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS) {
        console.warn(`[RATE LIMIT] Blocked IP: ${ip} for exceeding ${MAX_REQUESTS} requests in submit.`);
        return res.status(429).json({ success: false, message: 'Too Many Requests, please try again later.' });
      }
    }
  }
  // ---------------------

  // Khai báo API NocoDB và Token qua biến môi trường Vercel
  const nocoDbApiUrl = 'https://nocodb.smax.in/api/v2/tables/muwldo248riapzx/records';
  const nocoDbToken = process.env.NOCODB_TOKEN;

  if (!nocoDbToken) {
    return res.status(500).json({ success: false, message: 'Server configuration error: Missing NOCODB_TOKEN' });
  }

  try {
    const payload = req.body; // Payload nhận từ Frontend

    let url = nocoDbApiUrl;
    let method = req.method; // either POST or PATCH
    let body = payload;

    // --- Deduplication Logic via fb_pid ---
    if (method === 'POST' && payload.fb_pid) {
      console.log(`🔍 Checking if fb_pid ${payload.fb_pid} exists...`);
      const checkUrl = `${nocoDbApiUrl}?where=(fb_pid,eq,${payload.fb_pid})&limit=1`;
      const checkRes = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'xc-token': nocoDbToken,
        }
      });
      
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.list && checkData.list.length > 0) {
          const existingRecord = checkData.list[0];
          console.log(`🔄 Found existing record (Id: ${existingRecord.Id}) for fb_pid: ${payload.fb_pid}. Switching POST to PATCH.`);
          method = 'PATCH';
          body.Id = existingRecord.Id; // Append the exact Id for NocoDB PATCH
        }
      } else {
        console.warn(`⚠️ Failed to check fb_pid existence. Falling back to POST. Status:`, checkRes.status);
      }
    }
    // --------------------------------------
    
    // NocoDB V2 PATCH requires an array of record objects with Id field
    // POST accepts a single object or array
    if (method === 'PATCH') {
      // Wrap in array if not already an array
      body = Array.isArray(body) ? body : [body];
    }

    console.log(`📤 ${method} to NocoDB:`, JSON.stringify(body).substring(0, 500));
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'xc-token': nocoDbToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('NocoDB Error:', response.status, errorText);
        return res.status(response.status).json({ success: false, message: 'Submission to NocoDB failed', error: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Server Submit Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
