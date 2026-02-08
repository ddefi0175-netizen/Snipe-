import { corsHeaders } from '../lib/cors.js'

// Helper function to verify authentication
async function isAuthenticated(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  
  // TODO: Implement Firebase Admin SDK token verification
  // For now, basic check - REPLACE WITH PROPER AUTH
  const token = authHeader.replace('Bearer ', '')
  return token && token.length > 20
}

// R2 Storage Handler - Zero egress fees
// SECURITY: Add authentication before production use
export async function handleStorage(request, env) {
  const { STORAGE, R2_PUBLIC_URL } = env
  const url = new URL(request.url)
  const key = url.pathname.replace('/api/storage/', '')
  
  // PRODUCTION: Authentication required for all storage operations
  if (!await isAuthenticated(request)) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: corsHeaders
    })
  }
  
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
  
  // PUT: Upload file - REQUIRES AUTH
  if (request.method === 'PUT') {
    if (!await isAuthenticated(request)) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const contentType = request.headers.get('Content-Type')
    await STORAGE.put(key, request.body, {
      httpMetadata: { contentType }
    })
    
    // Use environment variable for public URL
    const publicUrl = R2_PUBLIC_URL || `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/onchainweb`
    
    return new Response(JSON.stringify({
      success: true,
      url: `${publicUrl}/${key}`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  // DELETE: Delete file - REQUIRES AUTH
  if (request.method === 'DELETE') {
    if (!await isAuthenticated(request)) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
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
