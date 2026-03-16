// Inbox API - Get Facebook Messenger conversations
// This endpoint retrieves messages from Facebook Messenger via Graph API

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

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

    // Get Facebook credentials from environment
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    console.log('📋 Inbox API - Credentials check:');
    console.log('  - Page ID:', pageId ? `${pageId.substring(0, 10)}...` : 'MISSING');
    console.log('  - Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');

    // If no Facebook credentials, return mock data
    if (!pageId || !accessToken) {
        console.log('⚠️ Facebook credentials not configured, returning mock data');
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
        console.log('📥 Fetching conversations from Facebook Messenger...');

        // Get conversations from Facebook Graph API
        const conversationsUrl = `${FACEBOOK_GRAPH_URL}/${pageId}/conversations?access_token=${accessToken}&fields=id,updated_time&limit=25`;

        const response = await fetch(conversationsUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', response.status, errorText);
            throw new Error(`Facebook API error: ${response.status}`);
        }

        const data = await response.json();

        console.log('📬 Facebook API Response:', JSON.stringify(data, null, 2).substring(0, 1000));

        const conversations = data.data || [];

        console.log(`📬 Found ${conversations.length} conversations`);

        // Transform to messages format
        const messages = [];
        const seenSenders = new Set();

        // For each conversation, get the messages
        for (const conv of conversations) {
            try {
                // Fetch messages for this conversation
                const messagesUrl = `${FACEBOOK_GRAPH_URL}/${conv.id}?access_token=${accessToken}&fields=messages{message,from,created_time}&limit=25`;
                const msgResponse = await fetch(messagesUrl);

                if (!msgResponse.ok) continue;

                const msgData = await msgResponse.json();
                const allMessages = (msgData.messages && msgData.messages.data) || [];

                // Find the last message from CUSTOMER (not from page)
                let customerMsg = null;
                for (const msg of allMessages) {
                    const sender = msg.from || {};
                    // If sender is NOT the page, it's a customer message
                    if (sender.id && sender.id !== pageId) {
                        customerMsg = msg;
                        break; // Take the first customer message (most recent)
                    }
                }

                // If no customer message found, skip this conversation
                if (!customerMsg) continue;

                const sender = customerMsg.from || {};

                // Skip if already added this sender
                const senderKey = sender.id || sender.name;
                if (seenSenders.has(senderKey)) continue;
                seenSenders.add(senderKey);

                messages.push({
                    id: conv.id,
                    sender_id: sender.id,
                    sender_name: sender.name || 'Unknown',
                    message: customerMsg.message || '',
                    avatar: null,
                    created_time: customerMsg.created_time,
                    is_read: false,
                    source: 'messenger'
                });
            } catch (e) {
                console.log('Error fetching messages for conversation:', conv.id, e.message);
            }
        }

        // Calculate stats
        const today = new Date().toDateString();
        const stats = {
            total: messages.length,
            unread: messages.filter(m => !m.is_read).length,
            today: messages.filter(m => new Date(m.created_time).toDateString() === today).length
        };

        console.log(`✅ Loaded ${messages.length} conversations from Facebook`);

        return res.status(200).json({
            success: true,
            source: 'facebook',
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
