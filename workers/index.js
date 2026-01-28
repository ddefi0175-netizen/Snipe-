import { handleCache } from './api/cache.js'
import { handleStorage } from './api/storage.js'
import { handleAdmin } from './api/admin.js'
import { handleUsers } from './api/users.js'
import { corsHeaders } from './lib/cors.js'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Route requests
      if (url.pathname.startsWith('/api/cache')) {
        return handleCache(request, env)
      }
      if (url.pathname.startsWith('/api/storage')) {
        return handleStorage(request, env)
      }
      if (url.pathname.startsWith('/api/admin')) {
        return handleAdmin(request, env)
      }
      if (url.pathname.startsWith('/api/users')) {
        return handleUsers(request, env)
      }

      // Health check endpoint
      if (url.pathname === '/health' || url.pathname === '/') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          service: 'snipe-workers',
          version: '1.0.0'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      })
    }
  }
}
