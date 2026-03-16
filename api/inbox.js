// Inbox API - Get Facebook Messenger conversations
// This endpoint retrieves messages from Facebook Messenger via NocoDB

const NOCO_DB_URL = process.env.NOCODB_URL || 'https://nocodb.smax.in';
const NOCO_DB_TOKEN = process.env.NOCODB_TOKEN;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // If no token, return mock data
    if (!NOCO_DB_TOKEN) {
        return res.status(200).json({
            success: true,
            source: 'mock',
            messages: getMockMessages(),
            stats: {
                total: 24,
                unread: 8,
                today: 5
            }
        });
    }

    try {
        // Get conversations from NocoDB
        // Assuming there's a 'conversations' or 'messages' table
        // You may need to adjust the table ID based on your NocoDB setup
        const conversationsResponse = await fetch(
            `${NOCO_DB_URL}/api/v2/tables/muwldo248riapzx/records?where=&sort=-UpdatedAt&limit=50`,
            {
                headers: {
                    'xc-token': NOCO_DB_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!conversationsResponse.ok) {
            throw new Error(`NocoDB error: ${conversationsResponse.status}`);
        }

        const data = await conversationsResponse.json();
        const leads = data.list || [];

        // Transform leads to messages format
        const messages = leads.map(lead => ({
            id: lead.Id,
            sender_id: lead.fb_pid || lead.fbpageid,
            sender_name: lead.Full_Name,
            message: lead.nhucau || 'Tin nhắn từ chatbot',
            avatar: null,
            created_time: lead.CreatedAt,
            is_read: lead.current_step >= 6,
            source: 'messenger'
        }));

        // Calculate stats
        const today = new Date().toDateString();
        const stats = {
            total: messages.length,
            unread: messages.filter(m => !m.is_read).length,
            today: messages.filter(m => new Date(m.created_time).toDateString() === today).length
        };

        return res.status(200).json({
            success: true,
            messages,
            stats
        });

    } catch (error) {
        console.error('Inbox API Error:', error);
        return res.status(200).json({
            success: true,
            source: 'mock',
            messages: getMockMessages(),
            stats: {
                total: 24,
                unread: 8,
                today: 5
            }
        });
    }
}

function getMockMessages() {
    return [
        {
            id: 1,
            sender_id: '123456789',
            sender_name: 'Nguyễn Thị Hoa',
            message: 'Em chào chị ạ, em muốn tư vấn về việc trị mụn ạ',
            avatar: null,
            created_time: new Date(Date.now() - 5 * 60000).toISOString(),
            is_read: false,
            source: 'messenger'
        },
        {
            id: 2,
            sender_id: '987654321',
            sender_name: 'Trần Minh Châu',
            message: 'Chị có thể cho em biết sản phẩm nào trị nám hiệu quả không ạ?',
            avatar: null,
            created_time: new Date(Date.now() - 15 * 60000).toISOString(),
            is_read: false,
            source: 'messenger'
        },
        {
            id: 3,
            sender_id: '456789123',
            sender_name: 'Lê Thùy Dung',
            message: 'Em đã dùng serum C nhưng không thấy cải thiện',
            avatar: null,
            created_time: new Date(Date.now() - 30 * 60000).toISOString(),
            is_read: true,
            source: 'messenger'
        },
        {
            id: 4,
            sender_id: '789123456',
            sender_name: 'Phạm Lan Anh',
            message: 'Da em nhạy cảm, có sản phẩm nào phù hợp không ạ?',
            avatar: null,
            created_time: new Date(Date.now() - 2 * 3600000).toISOString(),
            is_read: true,
            source: 'messenger'
        },
        {
            id: 5,
            sender_id: '321654987',
            sender_name: 'Vũ Quỳnh Trang',
            message: 'Em muốn đặt lịch khám da',
            avatar: null,
            created_time: new Date(Date.now() - 3 * 3600000).toISOString(),
            is_read: false,
            source: 'messenger'
        }
    ];
}
