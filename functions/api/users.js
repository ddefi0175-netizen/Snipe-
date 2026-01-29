/**
 * Cloudflare Workers - User Management API
 * Handles user operations with KV caching for cost optimization
 */

export async function handleUsersRequest(request, env) {
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
    // Extract user ID from path: /api/users/:userId
    const userIdMatch = path.match(/\/api\/users\/([^/]+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    // GET /api/users/:userId - Get user data with KV caching
    if (method === 'GET' && userId) {
      // Try KV cache first
      const cacheKey = `user:${userId}`;
      const cached = await env.USERS_KV?.get(cacheKey, 'json');
      
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }

      // If not in cache, fetch from Firestore via Firebase Admin SDK
      // Note: This requires Firebase Admin SDK initialization in the worker
      // For now, return cache miss indicator
      return new Response(JSON.stringify({
        error: 'Cache miss - implement Firestore fetch',
        userId,
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
        },
      });
    }

    // POST /api/users - Create/update user with cache invalidation
    if (method === 'POST' && path === '/api/users') {
      const userData = await request.json();
      
      // Validate required fields
      if (!userData.userId || !userData.walletAddress) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: userId, walletAddress',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Cache the user data
      const cacheKey = `user:${userData.userId}`;
      await env.USERS_KV?.put(cacheKey, JSON.stringify(userData), {
        expirationTtl: 3600, // 1 hour TTL
      });

      return new Response(JSON.stringify({
        success: true,
        userId: userData.userId,
        cached: true,
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/users/:userId - Update user data
    if (method === 'PUT' && userId) {
      const updateData = await request.json();
      
      // Get existing data from cache
      const cacheKey = `user:${userId}`;
      const existing = await env.USERS_KV?.get(cacheKey, 'json') || {};
      
      // Merge updates
      const updated = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
      
      // Update cache
      await env.USERS_KV?.put(cacheKey, JSON.stringify(updated), {
        expirationTtl: 3600,
      });

      return new Response(JSON.stringify({
        success: true,
        userId,
        data: updated,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/users/:userId - Delete user and clear cache
    if (method === 'DELETE' && userId) {
      const cacheKey = `user:${userId}`;
      await env.USERS_KV?.delete(cacheKey);

      return new Response(JSON.stringify({
        success: true,
        userId,
        message: 'User cache cleared',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      error: 'Route not found',
      path,
      method,
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Users API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
