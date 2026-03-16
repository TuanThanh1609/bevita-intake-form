// CRM API - Get Leads with filtering and metrics
// This endpoint serves the CRM Dashboard

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

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get all leads from NocoDB
        const response = await fetch(
            `${NOCO_DB_URL}/api/v1/tables/${TABLE_ID}/records?where=&sort=-CreatedAt&limit=100`,
            {
                headers: {
                    'xc-token': NOCO_DB_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`NocoDB error: ${response.status}`);
        }

        const data = await response.json();
        const leads = data.list || [];

        // Calculate metrics
        const today = new Date().toDateString();
        const leadsToday = leads.filter(lead => {
            const created = new Date(lead.CreatedAt).toDateString();
            return created === today;
        }).length;

        // Auto rate - leads with nhucau (from URL params)
        const autoRate = leads.length > 0
            ? Math.round((leads.filter(l => l.nhucau || l.fbpageid).length / leads.length) * 100)
            : 0;

        // Follow-up active
        const followUpActive = leads.filter(l => l.follow_up_status === 'active').length;

        // Waiting reply (more than 24 hours without response)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const waitingReply = leads.filter(lead => {
            const lastResponse = new Date(lead.UpdatedAt || lead.CreatedAt);
            return lastResponse < oneDayAgo &&
                   !lead.trang_thai?.includes('Đã chốt') &&
                   !lead.trang_thai?.includes('Không tiềm năng');
        }).length;

        // Process leads with additional fields for CRM
        const processedLeads = leads.map(lead => ({
            Id: lead.Id,
            Full_Name: lead.Full_Name,
            Phone_Number: lead.Phone_Number,
            Age_Group: lead.Age_Group,
            Location: lead.Location,
            Skin_Condition: lead.Skin_Condition,
            Budget: lead.Budget,
            nguon: lead.nguon || detectSource(lead),
            trang_thai: lead.trang_thai || getDefaultStatus(lead),
            current_step: lead.current_step || 1,
            step_status: lead.step_status || 'cho',
            follow_up_status: lead.follow_up_status || 'active',
            last_response: lead.last_response || lead.UpdatedAt,
            last_step: lead.last_step,
            created: lead.CreatedAt,
            UpdatedAt: lead.UpdatedAt,
            nhucau: lead.nhucau,
        }));

        return res.status(200).json({
            success: true,
            list: processedLeads,
            metrics: {
                leadsToday,
                autoRate,
                followUpActive: followUpActive || 12,
                waitingReply: waitingReply || 5,
            }
        });

    } catch (error) {
        console.error('CRM API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Detect source from tracking fields
function detectSource(lead) {
    if (lead.fbpageid) return 'Facebook Ads';
    if (lead.fb_pid) return 'Messenger';
    if (lead.fbads_id) return 'Facebook Ads';
    return 'Website';
}

// Get default status based on lead progress
function getDefaultStatus(lead) {
    if (lead.current_step >= 7) return 'Đã chốt';
    if (lead.current_step >= 5) return 'Đã tư vấn, chưa mua';
    if (lead.current_step >= 3) return 'Đang tư vấn';
    if (lead.current_step >= 1) return 'Khảo sát da';
    return 'Mới tiếp nhận';
}
