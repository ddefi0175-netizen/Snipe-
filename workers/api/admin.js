import { corsHeaders } from '../lib/cors.js'
import { verifyFirebaseToken, isAdmin, isMasterAdmin } from '../lib/firebaseAdmin.js'

// Secure Admin Operations - No credentials in frontend
export async function handleAdmin(request, env) {
  // Verify admin token
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: corsHeaders
    })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  // Verify Firebase ID token using Firebase Admin
  const verificationResult = await verifyFirebaseToken(token, env)
  if (!verificationResult.valid) {
    return new Response(JSON.stringify({ error: verificationResult.error || 'Invalid token' }), { 
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  // Verify user has admin privileges
  if (!isAdmin(verificationResult.claims)) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions - Admin access required' }), { 
      status: 403,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
  
  try {
    const { action, data } = await request.json()
    
    // Handle admin operations securely with verified authentication
    switch (action) {
      case 'createUser':
        // Create user via Firestore REST API
        // In production, this would create a user document in Firestore
        return new Response(JSON.stringify({ 
          success: true,
          message: 'User creation endpoint - integrate with Firestore REST API',
          userId: verificationResult.uid
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      
      case 'updateBalance':
        // Update balance via Firestore REST API
        // In production, this would update user balance in Firestore
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Balance update endpoint - integrate with Firestore REST API',
          adminId: verificationResult.uid
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      
      case 'listUsers':
        // List users (master admin only)
        if (!isMasterAdmin(verificationResult.claims)) {
          return new Response(JSON.stringify({ error: 'Master admin access required' }), { 
            status: 403,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          })
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'List users endpoint - integrate with Firestore REST API'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
    }
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
