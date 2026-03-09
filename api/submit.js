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

    // NocoDB PATCH logic
    let url = nocoDbApiUrl;
    let method = req.method; // either POST or PATCH
    
    // NocoDB API structure might require different URL for PATCH usually 
    // it's the exact same endpoint if an array of objects is passed with 'Id', 
    // however for a single record update usually it requires the ID in the URL or the body. 
    // NocoDB V2 allows bulk PATCH at the same /records endpoint.
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'xc-token': nocoDbToken,
      },
      body: JSON.stringify(payload) // Assuming NocoDB V2 bulk endpoint accepts objects/arrays
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
