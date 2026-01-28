// Get allowed origins from environment or use default
const getAllowedOrigins = (env) => {
  if (env?.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',')
  }
  // Default for development - CHANGE FOR PRODUCTION
  return ['https://onchainweb.pages.dev', 'https://www.onchainweb.app']
}

export const getCorsHeaders = (origin, env) => {
  const allowedOrigins = getAllowedOrigins(env)
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*')
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

// Default CORS headers (permissive for development)
// IMPORTANT: Update ALLOWED_ORIGINS environment variable for production
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}
