// Cloudflare Workers API for Chat System
// Handles chat messages with D1 database and Server-Sent Events for real-time updates

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routes
      if (path === '/api/chat/send' && request.method === 'POST') {
        return await handleSendMessage(request, env, corsHeaders);
      }
      
      if (path === '/api/chat/messages' && request.method === 'GET') {
        return await handleGetMessages(request, env, corsHeaders);
      }
      
      if (path === '/api/chat/active' && request.method === 'GET') {
        return await handleGetActiveChats(request, env, corsHeaders);
      }
      
      if (path === '/api/chat/reply' && request.method === 'POST') {
        return await handleAdminReply(request, env, corsHeaders);
      }
      
      if (path === '/api/chat/stream' && request.method === 'GET') {
        return await handleSSEStream(request, env, corsHeaders);
      }

      return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  },
};

// Send a new chat message
async function handleSendMessage(request, env, corsHeaders) {
  const data = await request.json();
  const { sessionId, message, senderName, senderWallet, senderType = 'user' } = data;

  if (!sessionId || !message) {
    return jsonResponse({ error: 'Missing required fields' }, 400, corsHeaders);
  }

  const now = Date.now();
  
  // Insert message
  const result = await env.DB.prepare(
    'INSERT INTO chat_messages (session_id, message, sender_name, sender_wallet, sender_type, created_at, delivered, read) VALUES (?, ?, ?, ?, ?, ?, 0, 0)'
  ).bind(sessionId, message, senderName || 'User', senderWallet || '', senderType, now).run();

  // Update or create active chat
  await env.DB.prepare(
    `INSERT INTO active_chats (session_id, user_name, user_wallet, last_message, last_message_time, unread_count, status, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, 'active', ?)
     ON CONFLICT(session_id) DO UPDATE SET
       last_message = excluded.last_message,
       last_message_time = excluded.last_message_time,
       unread_count = unread_count + 1,
       updated_at = excluded.updated_at`
  ).bind(sessionId, senderName || 'User', senderWallet || '', message, now, now).run();

  return jsonResponse({ 
    success: true, 
    messageId: result.meta.last_row_id 
  }, 201, corsHeaders);
}

// Get messages for a session
async function handleGetMessages(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  if (!sessionId) {
    return jsonResponse({ error: 'sessionId required' }, 400, corsHeaders);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(sessionId, limit).all();

  return jsonResponse({ messages: results.reverse() }, 200, corsHeaders);
}

// Get all active chats (for admin dashboard)
async function handleGetActiveChats(request, env, corsHeaders) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'active';
  const limit = parseInt(url.searchParams.get('limit') || '100');

  const { results } = await env.DB.prepare(
    'SELECT * FROM active_chats WHERE status = ? ORDER BY updated_at DESC LIMIT ?'
  ).bind(status, limit).all();

  return jsonResponse({ chats: results }, 200, corsHeaders);
}

// Admin reply to a chat
async function handleAdminReply(request, env, corsHeaders) {
  const data = await request.json();
  const { sessionId, message, adminName = 'Support' } = data;

  if (!sessionId || !message) {
    return jsonResponse({ error: 'Missing required fields' }, 400, corsHeaders);
  }

  const now = Date.now();

  // Insert admin reply
  const result = await env.DB.prepare(
    'INSERT INTO chat_messages (session_id, message, sender_name, sender_type, created_at, delivered, read) VALUES (?, ?, ?, \'admin\', ?, 1, 0)'
  ).bind(sessionId, message, adminName, now).run();

  // Update active chat
  await env.DB.prepare(
    `UPDATE active_chats 
     SET last_message = ?, last_message_time = ?, unread_count = 0, updated_at = ?
     WHERE session_id = ?`
  ).bind(message, now, now, sessionId).run();

  return jsonResponse({ 
    success: true, 
    messageId: result.meta.last_row_id 
  }, 201, corsHeaders);
}

// Server-Sent Events stream for real-time updates
async function handleSSEStream(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return jsonResponse({ error: 'sessionId required' }, 400, corsHeaders);
  }

  // Get initial messages
  const { results } = await env.DB.prepare(
    'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(sessionId).all();

  let lastCheckTime = Date.now();

  // Create SSE stream
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial data
  writer.write(encoder.encode(`data: ${JSON.stringify({ messages: results.reverse() })}\n\n`));

  // Poll for new messages every 3 seconds
  const intervalId = setInterval(async () => {
    try {
      const { results: newMessages } = await env.DB.prepare(
        'SELECT * FROM chat_messages WHERE session_id = ? AND created_at > ? ORDER BY created_at ASC'
      ).bind(sessionId, lastCheckTime).all();

      if (newMessages.length > 0) {
        writer.write(encoder.encode(`data: ${JSON.stringify({ messages: newMessages })}\n\n`));
        lastCheckTime = Date.now();
      }
    } catch (error) {
      console.error('SSE polling error:', error);
    }
  }, 3000);

  // Cleanup on disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function for JSON responses
function jsonResponse(data, status = 200, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
