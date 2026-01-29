/**
 * Cloudflare Workers - KV Cache Handler
 * Edge caching for frequently accessed data
 * Benefits: Sub-millisecond latency, 100K reads/day free
 */

export async function handleKVCacheRequest(request, env) {
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
    // GET /cache/get/:key - Get cached value
    if (method === 'GET' && path.startsWith('/cache/get/')) {
      const key = path.replace('/cache/get/', '');

      const value = await env.CACHE_KV?.get(key, 'json');

      if (value) {
        return new Response(JSON.stringify({
          key,
          value,
          cached: true,
          hit: true,
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }

      return new Response(JSON.stringify({
        key,
        cached: false,
        hit: false,
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
        },
      });
    }

    // POST /cache/set - Set cache value
    if (method === 'POST' && path === '/cache/set') {
      const { key, value, ttl = 3600 } = await request.json();

      if (!key || value === undefined) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: key, value',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await env.CACHE_KV?.put(key, JSON.stringify(value), {
        expirationTtl: ttl,
      });

      return new Response(JSON.stringify({
        success: true,
        key,
        ttl,
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /cache/delete/:key - Delete cache value
    if (method === 'DELETE' && path.startsWith('/cache/delete/')) {
      const key = path.replace('/cache/delete/', '');

      await env.CACHE_KV?.delete(key);

      return new Response(JSON.stringify({
        success: true,
        key,
        message: 'Cache entry deleted',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /cache/increment - Increment counter (for rate limiting)
    if (method === 'POST' && path === '/cache/increment') {
      const { key, increment = 1, ttl = 3600 } = await request.json();

      if (!key) {
        return new Response(JSON.stringify({
          error: 'Missing required field: key',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentValue = await env.CACHE_KV?.get(key);
      const newValue = (parseInt(currentValue || '0') + increment).toString();

      await env.CACHE_KV?.put(key, newValue, {
        expirationTtl: ttl,
      });

      return new Response(JSON.stringify({
        success: true,
        key,
        value: parseInt(newValue),
        increment,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      error: 'Cache route not found',
      path,
      method,
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('KV Cache error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Rate limiting helper using KV
 */
export async function checkRateLimit(env, identifier, limit = 100, window = 3600) {
  const key = `ratelimit:${identifier}`;
  const count = await env.RATE_LIMIT_KV?.get(key);

  if (count && parseInt(count) >= limit) {
    return {
      allowed: false,
      current: parseInt(count),
      limit,
      reset: window,
    };
  }

  const newCount = (parseInt(count || '0') + 1).toString();
  await env.RATE_LIMIT_KV?.put(key, newCount, {
    expirationTtl: window,
  });

  return {
    allowed: true,
    current: parseInt(newCount),
    limit,
    remaining: limit - parseInt(newCount),
  };
}
