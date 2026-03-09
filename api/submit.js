export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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
    
    // NocoDB V2 PATCH requires an array of record objects with Id field
    // POST accepts a single object or array
    let body;
    if (method === 'PATCH') {
      // Wrap in array if not already an array
      body = Array.isArray(payload) ? payload : [payload];
    } else {
      body = payload;
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
