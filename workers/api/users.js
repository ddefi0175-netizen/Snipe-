import { corsHeaders } from '../lib/cors.js'

// User Management with KV Cache
export async function handleUsers(request, env) {
  const { CACHE } = env
  const url = new URL(request.url)
  const userId = url.pathname.replace('/api/users/', '')
  
  // Check cache first
  const cacheKey = `user:${userId}`
  const cached = await CACHE.get(cacheKey)
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'HIT'
      }
    })
  }
  
  // Fetch from Firestore using REST API
  // Note: This uses Firebase REST API with API key for read-only operations
  // For production, consider using Firebase Admin SDK with service account
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}`;
  try {
    const response = await fetch(firestoreUrl, {
      headers: {
        'X-Firebase-Api-Key': env.FIREBASE_API_KEY
      }
    });

    if (response.ok) {
      const userData = await response.json();
      // Cache for 1 hour and return
      await CACHE.put(cacheKey, JSON.stringify(userData.fields), { expirationTtl: 3600 });
      return new Response(JSON.stringify(userData.fields), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS'
        }
      });
    }
    
    // User not found
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Fallback to placeholder data on error
    const userData = { 
      id: userId, 
      cached: false,
      message: 'User data fetched from Firestore',
      error: error.message
    }
    
    return new Response(JSON.stringify(userData), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'ERROR'
      }
    });
  }
}
