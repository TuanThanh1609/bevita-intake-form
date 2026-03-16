// API - Submit Treatment Plan (Phác Đồ)
// This endpoint allows consultant to submit treatment plan for a lead

const NOCO_DB_URL = process.env.NOCODB_URL || 'https://nocodb.smax.in';
const NOCO_DB_TOKEN = process.env.NOCODB_TOKEN;
const TABLE_ID = 'muwldo248riapzx'; // Leads table

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // Check for token
    if (!NOCO_DB_TOKEN) {
        console.error('PhacDo API: Missing NOCODB_TOKEN');
        return res.status(500).json({ success: false, message: 'Server configuration error: Missing NOCODB_TOKEN' });
    }

    try {
        const { Id, phac_do, phac_do_severity, phac_do_diagnosis, phac_do_treatment, phac_do_products, phac_do_sent_at, send_zalo, current_step } = req.body;

        if (!Id) {
            return res.status(400).json({ success: false, message: 'Missing lead ID' });
        }

        if (!phac_do) {
            return res.status(400).json({ success: false, message: 'Missing phác đồ content' });
        }

        console.log(`📝 Submitting treatment plan for lead ${Id}`);

        // Update lead in NocoDB with treatment plan
        const updateData = {
            phac_do: phac_do,
            phac_do_severity: phac_do_severity,
            phac_do_diagnosis: phac_do_diagnosis,
            phac_do_treatment: phac_do_treatment,
            phac_do_products: phac_do_products,
            phac_do_sent_at: phac_do_sent_at || new Date().toISOString(),
            current_step: current_step || 8, // Move to B7 - Hoàn thành
            trang_thai: 'Đã chốt'
        };

        const response = await fetch(
            `${NOCO_DB_URL}/api/v2/tables/${TABLE_ID}/records`,
            {
                method: 'PATCH',
                headers: {
                    'xc-token': NOCO_DB_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Id: Id,
                    ...updateData
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('PhacDo API: NocoDB error:', response.status, errorText);
            throw new Error(`NocoDB error: ${response.status}`);
        }

        const result = await response.json();

        // TODO: If send_zalo is true, integrate with Zalo API to send message
        if (send_zalo) {
            console.log(`📱 Would send Zalo message for lead ${Id} (Zalo integration pending)`);
            // Zalo integration would go here
        }

        console.log(`✅ Treatment plan submitted for lead ${Id}`);

        return res.status(200).json({
            success: true,
            message: 'Treatment plan submitted successfully',
            leadId: Id
        });

    } catch (error) {
        console.error('PhacDo API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
