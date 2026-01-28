import { corsHeaders } from '../lib/cors.js'

// R2 Storage Handler - Zero egress fees
export async function handleStorage(request, env) {
  const { STORAGE } = env
  const url = new URL(request.url)
  const key = url.pathname.replace('/api/storage/', '')
  
  // GET: Download file
  if (request.method === 'GET') {
    const object = await STORAGE.get(key)
    if (!object) {
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      })
    }
    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'ETag': object.httpEtag
      }
    })
  }
  
  // PUT: Upload file
  if (request.method === 'PUT') {
    const contentType = request.headers.get('Content-Type')
    await STORAGE.put(key, request.body, {
      httpMetadata: { contentType }
    })
    return new Response(JSON.stringify({
      success: true,
      url: `https://eb568c24da7c746c95353226eb665d00.r2.cloudflarestorage.com/onchainweb/${key}`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  // DELETE: Delete file
  if (request.method === 'DELETE') {
    await STORAGE.delete(key)
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
