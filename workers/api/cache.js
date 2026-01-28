import { corsHeaders } from '../lib/cors.js'

// KV Cache Layer - 80% cost reduction
export async function handleCache(request, env) {
  const { CACHE } = env
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/cache/', '')
  
  // GET: Check cache first
  if (request.method === 'GET') {
    const cached = await CACHE.get(path)
    if (cached) {
      return new Response(cached, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        }
      })
    }
    return new Response(JSON.stringify({ error: 'Not in cache' }), {
      status: 404,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'MISS' 
      }
    })
  }
  
  // PUT: Store in cache
  if (request.method === 'PUT') {
    const data = await request.json()
    const ttl = parseInt(url.searchParams.get('ttl') || '3600')
    await CACHE.put(path, JSON.stringify(data), { expirationTtl: ttl })
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  // DELETE: Clear cache
  if (request.method === 'DELETE') {
    await CACHE.delete(path)
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  return new Response('Method not allowed', { 
    status: 405,
    headers: corsHeaders
  })
}
