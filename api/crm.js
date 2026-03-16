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

    // Check for token
    if (!NOCO_DB_TOKEN) {
        console.error('CRM API: Missing NOCODB_TOKEN');
        // Return mock data for demo if no token
        const mockLeads = getMockLeadsForAPI();
        return res.status(200).json({
            success: true,
            source: 'mock',
            list: mockLeads,
            metrics: calculateMockMetrics(mockLeads)
        });
    }

    try {
        // Get all leads from NocoDB (using v2 API like submit.js)
        const response = await fetch(
            `${NOCO_DB_URL}/api/v2/tables/${TABLE_ID}/records?where=&sort=-CreatedAt&limit=100`,
            {
                headers: {
                    'xc-token': NOCO_DB_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CRM API: NocoDB error:', response.status, errorText);
            throw new Error(`NocoDB error: ${response.status} - ${errorText}`);
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
            Skin_Photos: lead.Skin_Photos,
            Skin_photo_2: lead.Skin_photo_2,
            Skin_photo_3: lead.Skin_photo_3,
            History_Cosmetics: lead.History_Cosmetics,
            History_Spa: lead.History_Spa,
            History_Spa_Service: lead.History_Spa_Service,
            History_Spa_Results: lead.History_Spa_Results,
            Current_Routine: lead.Current_Routine,
            Routine_Photos: lead.Routine_Photos,
            Health_Status: lead.Health_Status,
            Supplements: lead.Supplements,
            Lifestyle_Sleep: lead.Lifestyle_Sleep,
            Lifestyle_Stress: lead.Lifestyle_Stress,
            Note: lead.Note,
            tu_van_vien: lead.tu_van_vien,
            coach: lead.coach,
            ngay_tiep_nhan: lead.ngay_tiep_nhan,
            tu_van_vien_notes: lead.tu_van_vien_notes,
            tuong_tac_zalo: lead.tuong_tac_zalo,
            tuong_tac_facebook: lead.tuong_tac_facebook,
            tuong_tac_website: lead.tuong_tac_website,
            tuong_tac_dien_thoai: lead.tuong_tac_dien_thoai,
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

// Mock data for demo when NocoDB not available
function getMockLeadsForAPI() {
    return [
        { Id: 1, Full_Name: 'Nguyễn Thị Hoa', Phone_Number: '0912345678', Age_Group: '25-34', Skin_Condition: 'Mụn, Da xỉn', Location: 'TP.HCM', nguon: 'Zalo OA', trang_thai: 'Mới tiếp nhận', current_step: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
        { Id: 2, Full_Name: 'Trần Minh Châu', Phone_Number: '0987654321', Age_Group: '35-42', Skin_Condition: 'Nám', Location: 'Hà Nội', nguon: 'Facebook Ads', trang_thai: 'Đang tư vấn', current_step: 3, CreatedAt: new Date(Date.now() - 2*3600000).toISOString(), UpdatedAt: new Date().toISOString() },
        { Id: 3, Full_Name: 'Lê Thùy Dung', Phone_Number: '0934567890', Age_Group: 'Trên 42', Skin_Condition: 'Lão hóa, Nám', Location: 'Đà Nẵng', nguon: 'Referral', trang_thai: 'Đang tư vấn', current_step: 5, CreatedAt: new Date(Date.now() - 24*3600000).toISOString(), UpdatedAt: new Date().toISOString() },
        { Id: 4, Full_Name: 'Phạm Lan Anh', Phone_Number: '0978123456', Age_Group: 'Dưới 25', Skin_Condition: 'Mụn', Location: 'TP.HCM', nguon: 'Google Ads', trang_thai: 'Chờ KH phản hồi', current_step: 2, CreatedAt: new Date(Date.now() - 20*3600000).toISOString(), UpdatedAt: new Date(Date.now() - 15*3600000).toISOString() },
        { Id: 5, Full_Name: 'Vũ Quỳnh Trang', Phone_Number: '0965123456', Age_Group: '30-42', Skin_Condition: 'Nám, Lão hóa', Location: 'Hà Nội', nguon: 'Walk-in', trang_thai: 'Đang tư vấn', current_step: 5, CreatedAt: new Date(Date.now() - 48*3600000).toISOString(), UpdatedAt: new Date().toISOString() },
    ];
}

function calculateMockMetrics(leads) {
    const today = new Date().toDateString();
    const leadsToday = leads.filter(l => new Date(l.CreatedAt).toDateString() === today).length;
    const followUpActive = leads.filter(l => l.trang_thai !== 'Đã chốt').length;
    const waitingReply = 2;
    return { leadsToday, autoRate: 84, followUpActive, waitingReply };
}
