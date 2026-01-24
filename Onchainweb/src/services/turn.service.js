/**
 * Cloudflare TURN Server Service
 * 
 * Provides ICE server configuration for WebRTC connections through Cloudflare TURN servers.
 * This improves peer-to-peer connection reliability when direct connections fail due to
 * NAT or firewalls.
 */

import { TURN_SERVER_CONFIG } from '../config/constants';

/**
 * Fetches ICE servers from Cloudflare TURN API
 * @returns {Promise<Array>} Array of ICE server configurations
 */
export const getCloudflareIceServers = async () => {
  try {
    // Check if TURN server configuration is available
    if (!TURN_SERVER_CONFIG.TOKEN_ID || !TURN_SERVER_CONFIG.API_TOKEN) {
      console.warn('⚠️ Cloudflare TURN server credentials not configured. Falling back to default STUN servers.');
      return getDefaultIceServers();
    }

    const url = `${TURN_SERVER_CONFIG.API_ENDPOINT}/${TURN_SERVER_CONFIG.TOKEN_ID}/credentials/generate-ice-servers`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURN_SERVER_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ttl: TURN_SERVER_CONFIG.TTL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Cloudflare ICE servers:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Cloudflare returns ICE servers as an array of server configurations
    // Format: { iceServers: [{ urls: [...], username: "...", credential: "..." }] }
    if (data.iceServers && Array.isArray(data.iceServers) && data.iceServers.length > 0) {
      console.log('✅ Successfully fetched Cloudflare ICE servers:', {
        count: data.iceServers.length,
        servers: data.iceServers.map(s => ({
          urlCount: s.urls?.length || 0,
          hasCredentials: !!(s.username && s.credential)
        }))
      });
      
      // Return the ICE servers directly as they're already in the correct format
      return data.iceServers;
    }

    console.warn('Invalid ICE server response from Cloudflare:', data);
    return getDefaultIceServers();
    
  } catch (error) {
    console.error('Error fetching Cloudflare ICE servers:', error);
    // Fall back to default STUN servers on error
    return getDefaultIceServers();
  }
};

/**
 * Returns default STUN servers as fallback
 * @returns {Array} Array of default ICE server configurations
 */
const getDefaultIceServers = () => {
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];
};

/**
 * Cache for ICE servers to avoid repeated API calls
 */
let cachedIceServers = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Gets ICE servers with caching
 * @returns {Promise<Array>} Array of ICE server configurations
 */
export const getCachedIceServers = async () => {
  const now = Date.now();
  
  // Return cached servers if still valid
  if (cachedIceServers && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Using cached ICE servers');
    return cachedIceServers;
  }
  
  // Fetch fresh servers
  const servers = await getCloudflareIceServers();
  
  // Update cache
  cachedIceServers = servers;
  cacheTimestamp = now;
  
  return servers;
};

/**
 * Clears the ICE servers cache
 */
export const clearIceServersCache = () => {
  cachedIceServers = null;
  cacheTimestamp = null;
  console.log('🗑️ ICE servers cache cleared');
};

export default {
  getCloudflareIceServers,
  getCachedIceServers,
  clearIceServersCache,
  getDefaultIceServers
};
