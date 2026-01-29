/**
 * Cloudflare Workers - Cache Management API
 * Edge caching layer for Firestore data to reduce read costs
 */

export async function handleCacheRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET /api/cache/:collection/:id - Get cached data
    if (method === 'GET') {
      const cacheMatch = path.match(/\/api\/cache\/([^/]+)\/([^/]+)/);
      if (cacheMatch) {
        const [, collection, id] = cacheMatch;
        const cacheKey = `${collection}:${id}`;
        
        const cached = await env.CACHE_KV?.get(cacheKey, 'json');
        
        if (cached) {
          return new Response(JSON.stringify({
            data: cached,
            cached: true,
            timestamp: cached._cachedAt || Date.now(),
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
              'Cache-Control': 'public, max-age=60',
            },
          });
        }

        return new Response(JSON.stringify({
          error: 'Cache miss',
          collection,
          id,
        }), {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'MISS',
          },
        });
      }
    }

    // POST /api/cache/:collection/:id - Update cache
    if (method === 'POST') {
      const cacheMatch = path.match(/\/api\/cache\/([^/]+)\/([^/]+)/);
      if (cacheMatch) {
        const [, collection, id] = cacheMatch;
        const data = await request.json();
        
        // Add cache metadata
        data._cachedAt = Date.now();
        
        const cacheKey = `${collection}:${id}`;
        const ttl = data._ttl || 3600; // Default 1 hour
        
        await env.CACHE_KV?.put(cacheKey, JSON.stringify(data), {
          expirationTtl: ttl,
        });

        return new Response(JSON.stringify({
          success: true,
          collection,
          id,
          ttl,
          cachedAt: data._cachedAt,
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // DELETE /api/cache/:collection/:id - Invalidate cache
    if (method === 'DELETE') {
      const cacheMatch = path.match(/\/api\/cache\/([^/]+)\/([^/]+)/);
      if (cacheMatch) {
        const [, collection, id] = cacheMatch;
        const cacheKey = `${collection}:${id}`;
        
        await env.CACHE_KV?.delete(cacheKey);

        return new Response(JSON.stringify({
          success: true,
          collection,
          id,
          message: 'Cache invalidated',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // DELETE /api/cache/:collection - Clear entire collection cache
    if (method === 'DELETE' && path.match(/\/api\/cache\/([^/]+)$/)) {
      const collectionMatch = path.match(/\/api\/cache\/([^/]+)$/);
      const collection = collectionMatch[1];
      
      // Note: KV doesn't support prefix deletion directly
      // In production, maintain a list of keys per collection
      return new Response(JSON.stringify({
        message: 'Collection-wide cache clear requires key tracking implementation',
        collection,
      }), {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /api/cache/stats - Cache statistics
    if (method === 'GET' && path === '/api/cache/stats') {
      // Return cache hit/miss statistics
      const stats = {
        message: 'Cache statistics implementation pending',
        note: 'Track hits/misses using analytics binding',
      };

      return new Response(JSON.stringify(stats), {
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
    console.error('Cache API error:', error);
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
 * Helper function to generate cache keys
 */
export function generateCacheKey(collection, id, options = {}) {
  let key = `${collection}:${id}`;
  
  if (options.userId) {
    key += `:user:${options.userId}`;
  }
  
  if (options.scope) {
    key += `:${options.scope}`;
  }
  
  return key;
}

/**
 * Helper function to parse TTL from collection type
 */
export function getTTLForCollection(collection) {
  const ttlMap = {
    users: 3600,        // 1 hour
    trades: 300,        // 5 minutes
    deposits: 600,      // 10 minutes
    withdrawals: 600,   // 10 minutes
    settings: 86400,    // 24 hours
    stats: 300,         // 5 minutes
  };
  
  return ttlMap[collection] || 3600; // Default 1 hour
}
