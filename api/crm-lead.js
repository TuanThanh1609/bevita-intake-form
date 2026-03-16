// CRM Lead Update API - Update lead status, assign consultant, add notes

const NOCO_DB_URL = process.env.NOCODB_URL || 'https://nocodb.smax.in';
const NOCO_DB_TOKEN = process.env.NOCODB_TOKEN;
const TABLE_ID = 'muwldo248riapzx';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { leadId } = req.query;

    if (!leadId) {
        return res.status(400).json({ success: false, message: 'Missing leadId' });
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const updates = req.body;

        // Build allowed update fields
        const allowedFields = [
            'trang_thai', 'tu_van_vien', 'coach', 'follow_up_status',
            'follow_up_count', 'next_follow_up', 'last_response',
            'tu_van_vien_notes', 'tuong_tac_zalo', 'tuong_tac_facebook'
        ];

        const payload = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                payload[key] = value;
            }
        }

        // Always update last_response timestamp
        payload.last_response = new Date().toISOString();

        const response = await fetch(
            `${NOCO_DB_URL}/api/v1/tables/${TABLE_ID}/records/${leadId}`,
            {
                method: 'PATCH',
                headers: {
                    'xc-token': NOCO_DB_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NocoDB error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        return res.status(200).json({
            success: true,
            message: 'Lead updated successfully',
            data: result
        });

    } catch (error) {
        console.error('CRM Update API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
