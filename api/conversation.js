// Conversation API - Get single conversation messages and send messages
// This endpoint retrieves messages from a specific Facebook Messenger conversation

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get Facebook credentials from environment
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    // If no Facebook credentials, return error
    if (!pageId || !accessToken) {
        return res.status(200).json({
            success: false,
            message: 'Facebook credentials not configured'
        });
    }

    const { conversationId, recipientId, message } = req.query;

    // Handle POST for sending messages
    if (req.method === 'POST') {
        return handleSendMessage(req, res, pageId, accessToken);
    }

    // Handle GET for fetching conversation messages
    if (req.method === 'GET') {
        return handleGetMessages(req, res, pageId, accessToken);
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}

async function handleGetMessages(req, res, pageId, accessToken) {
    const conversationId = req.query.conversationId;

    if (!conversationId) {
        return res.status(400).json({ success: false, message: 'conversationId is required' });
    }

    try {
        console.log('📥 Fetching messages for conversation:', conversationId);

        // Get messages for this conversation
        const messagesUrl = `${FACEBOOK_GRAPH_URL}/${conversationId}?access_token=${accessToken}&fields=messages{message,from,created_time,attachments}&limit=50`;
        const msgResponse = await fetch(messagesUrl);

        if (!msgResponse.ok) {
            const errorText = await msgResponse.text();
            console.error('Facebook API error:', msgResponse.status, errorText);
            throw new Error(`Facebook API error: ${msgResponse.status}`);
        }

        const msgData = await msgResponse.json();
        const messages = (msgData.messages && msgData.messages.data) || [];

        // Transform messages
        const transformedMessages = messages.map(msg => {
            const sender = msg.from || {};
            const isFromPage = sender.id === pageId;

            return {
                id: msg.id,
                message: msg.message || '',
                from_id: sender.id,
                from_name: sender.name || 'Unknown',
                is_from_page: isFromPage,
                created_time: msg.created_time,
                attachments: msg.attachments || []
            };
        }).reverse(); // Oldest first

        return res.status(200).json({
            success: true,
            conversation_id: conversationId,
            messages: transformedMessages,
            conversation: {
                id: conversationId,
                messages: transformedMessages
            }
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        return res.status(200).json({
            success: false,
            message: error.message
        });
    }
}

async function handleSendMessage(req, res, pageId, accessToken) {
    try {
        const body = req.body || {};
        const { recipientId, message, messagingType } = body;

        if (!recipientId || !message) {
            return res.status(400).json({
                success: false,
                message: 'recipientId and message are required'
            });
        }

        console.log('📤 Sending message to:', recipientId);

        // Send message via Facebook Graph API
        const sendUrl = `${FACEBOOK_GRAPH_URL}/me/messages?access_token=${accessToken}`;

        const payload = {
            messaging_type: messagingType || 'RESPONSE',
            recipient: {
                id: recipientId
            },
            message: {
                text: message
            }
        };

        const response = await fetch(sendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook send error:', response.status, errorText);
            throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        console.log('✅ Message sent:', result);

        return res.status(200).json({
            success: true,
            message_id: result.message_id,
            recipient_id: recipientId
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(200).json({
            success: false,
            message: error.message
        });
    }
}
