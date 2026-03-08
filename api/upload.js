export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Khai báo các API Key qua biến môi trường (Environment Variables) trong Vercel
  const imgbbApiUrl = 'https://api.imgbb.com/1/upload';
  const imgbbApiKey = process.env.IMGBB_KEY; 

  if (!imgbbApiKey) {
    return res.status(500).json({ success: false, message: 'Server configuration error: Missing IMGBB_KEY' });
  }

  try {
    // Để nhận FormData từ client, Vercel cần xử lý raw body. 
    // Tuy nhiên api.imgbb.com hỗ trợ base64 dạng JSON payload.
    // Cách an toàn nhất: nhận ảnh base64 từ frontend và submit dạng FormURL Encode.
    
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: 'Missing image data' });
    }

    const formData = new URLSearchParams();
    formData.append('image', image);
    formData.append('key', imgbbApiKey);

    const result = await fetch(imgbbApiUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await result.json();

    if (data.success) {
      return res.status(200).json(data);
    } else {
      console.error('ImgBB API Error:', data);
      return res.status(500).json({ success: false, message: 'ImgBB upload failed', error: data });
    }

  } catch (error) {
    console.error('Server Upload Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}
