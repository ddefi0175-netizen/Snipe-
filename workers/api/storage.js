import { corsHeaders } from '../lib/cors.js'
import { verifyFirebaseToken, isAdmin } from '../lib/firebaseAdmin.js'

// R2 Storage Handler - Zero egress fees
// PRODUCTION: Authentication required for all storage operations
export async function handleStorage(request, env) {
  const { STORAGE, R2_PUBLIC_URL } = env
  const url = new URL(request.url)
  const key = url.pathname.replace('/api/storage/', '')
  
  // Extract token from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
  
  // GET: Download file - Public read OR authenticated users
  if (request.method === 'GET') {
    // Allow public access for files in public/ directory
    if (key.startsWith('public/')) {
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
    
    // For non-public files, require authentication
    if (!token) {
      return new Response('Unauthorized - Authentication required', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const authResult = await verifyFirebaseToken(token, env)
    if (!authResult.valid) {
      return new Response('Unauthorized - Invalid token', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
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
  
  // PUT: Upload file - REQUIRES AUTHENTICATION + ADMIN ROLE
  if (request.method === 'PUT') {
    if (!token) {
      return new Response('Unauthorized - Authentication required', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const authResult = await verifyFirebaseToken(token, env)
    if (!authResult.valid) {
      return new Response('Unauthorized - Invalid token', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    // Verify admin role for uploads
    if (!isAdmin(authResult.claims)) {
      return new Response('Forbidden - Admin access required for uploads', { 
        status: 403,
        headers: corsHeaders
      })
    }
    
    const contentType = request.headers.get('Content-Type')
    
    // Validate file size (limit to 10MB)
    const contentLength = request.headers.get('Content-Length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return new Response('File too large - Maximum 10MB allowed', { 
        status: 413,
        headers: corsHeaders
      })
    }
    
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
  
  // DELETE: Delete file - REQUIRES AUTHENTICATION + ADMIN ROLE
  if (request.method === 'DELETE') {
    if (!token) {
      return new Response('Unauthorized - Authentication required', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const authResult = await verifyFirebaseToken(token, env)
    if (!authResult.valid) {
      return new Response('Unauthorized - Invalid token', { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    // Verify admin role for deletions
    if (!isAdmin(authResult.claims)) {
      return new Response('Forbidden - Admin access required for deletions', { 
        status: 403,
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
