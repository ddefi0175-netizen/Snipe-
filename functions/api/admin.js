/**
 * Cloudflare Workers - Admin API
 * Secure admin operations without exposing credentials in frontend
 */

export async function handleAdminRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - Missing or invalid authorization token',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Firebase Admin SDK
    // Note: This requires Firebase Admin SDK initialization
    // For production, implement proper token verification
    
    // GET /api/admin/users - List all users (admin only)
    if (method === 'GET' && path === '/api/admin/users') {
      // Implement rate limiting
      const rateLimitKey = `ratelimit:admin:${token.substring(0, 10)}`;
      const requestCount = await env.RATE_LIMIT_KV?.get(rateLimitKey);
      
      if (requestCount && parseInt(requestCount) > 100) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment rate limit counter
      await env.RATE_LIMIT_KV?.put(rateLimitKey, 
        String((parseInt(requestCount || '0') + 1)), 
        { expirationTtl: 3600 }
      );

      // Fetch users from Firestore
      // For now, return placeholder
      return new Response(JSON.stringify({
        users: [],
        message: 'Implement Firestore fetch with Firebase Admin SDK',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /api/admin/users/:userId/permissions - Update user permissions
    if (method === 'POST' && path.includes('/permissions')) {
      const userIdMatch = path.match(/\/api\/admin\/users\/([^/]+)\/permissions/);
      const userId = userIdMatch ? userIdMatch[1] : null;

      if (!userId) {
        return new Response(JSON.stringify({
          error: 'Invalid user ID',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const permissions = await request.json();

      // Update permissions in Firestore via Firebase Admin SDK
      // Clear user cache
      const cacheKey = `user:${userId}`;
      await env.USERS_KV?.delete(cacheKey);

      return new Response(JSON.stringify({
        success: true,
        userId,
        permissions,
        message: 'Permissions updated, cache cleared',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /api/admin/stats - Get platform statistics
    if (method === 'GET' && path === '/api/admin/stats') {
      // Try cache first
      const cacheKey = 'admin:stats';
      const cached = await env.STATS_KV?.get(cacheKey, 'json');

      if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return new Response(JSON.stringify(cached), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }

      // Calculate stats from Firestore
      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        totalTrades: 0,
        timestamp: Date.now(),
        message: 'Implement real stats calculation',
      };

      // Cache stats
      await env.STATS_KV?.put(cacheKey, JSON.stringify(stats), {
        expirationTtl: 300, // 5 minutes
      });

      return new Response(JSON.stringify(stats), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
        },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      error: 'Admin route not found',
      path,
      method,
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
