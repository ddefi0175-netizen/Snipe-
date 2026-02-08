/**
 * Firebase Admin SDK for Cloudflare Workers
 * 
 * Provides server-side authentication and token verification
 * for secure API endpoints in Cloudflare Workers environment.
 * 
 * IMPORTANT: This module uses the Firebase Admin REST API instead of
 * the full Admin SDK, which is not compatible with Cloudflare Workers.
 * 
 * For production use, ensure the following secrets are set:
 * - wrangler secret put FIREBASE_PRIVATE_KEY
 * - wrangler secret put FIREBASE_CLIENT_EMAIL
 * - wrangler secret put FIREBASE_PROJECT_ID
 */

/**
 * Verify a Firebase ID token using Firebase Admin REST API
 * 
 * @param {string} token - The Firebase ID token to verify
 * @param {object} env - Environment variables containing Firebase configuration
 * @returns {Promise<object>} - Verification result with valid flag, uid, and claims
 */
export async function verifyFirebaseToken(token, env) {
  try {
    // Validate input
    if (!token || typeof token !== 'string' || token.length < 50) {
      return { 
        valid: false, 
        error: 'Invalid token format' 
      };
    }

    // Split JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { 
        valid: false, 
        error: 'Invalid JWT format - expected 3 parts' 
      };
    }

    // Decode the payload (middle part) to extract claims
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verify basic claims
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiration
    if (payload.exp && payload.exp < now) {
      return { 
        valid: false, 
        error: 'Token has expired' 
      };
    }
    
    // Check issued at time (token not used before it was issued)
    if (payload.iat && payload.iat > now + 60) {
      return { 
        valid: false, 
        error: 'Token used before issued time' 
      };
    }
    
    // Check auth time (if present)
    if (payload.auth_time && payload.auth_time > now + 60) {
      return { 
        valid: false, 
        error: 'Invalid auth time' 
      };
    }
    
    // Verify audience matches project ID
    if (payload.aud !== env.FIREBASE_PROJECT_ID) {
      return { 
        valid: false, 
        error: 'Token audience does not match project ID' 
      };
    }
    
    // Verify issuer
    const expectedIssuer = `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`;
    if (payload.iss !== expectedIssuer) {
      return { 
        valid: false, 
        error: 'Invalid token issuer' 
      };
    }
    
    // Verify subject (user ID) exists
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return { 
        valid: false, 
        error: 'Invalid subject claim' 
      };
    }

    // Fetch public keys from Google to verify signature
    const response = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      {
        cf: {
          cacheTtl: 3600, // Cache public keys for 1 hour
          cacheEverything: true
        }
      }
    );

    if (!response.ok) {
      return { 
        valid: false, 
        error: 'Failed to fetch public keys for signature verification' 
      };
    }

    const publicKeys = await response.json();

    // Decode header to get key ID
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const kid = header.kid;

    if (!kid || !publicKeys[kid]) {
      return { 
        valid: false, 
        error: 'Invalid token key ID' 
      };
    }

    // In a production environment with full crypto support, verify signature here
    // For Cloudflare Workers, we rely on the Web Crypto API
    try {
      const publicKey = publicKeys[kid];
      const isValid = await verifyJWTSignature(token, publicKey);
      
      if (!isValid) {
        return { 
          valid: false, 
          error: 'Invalid token signature' 
        };
      }
    } catch (error) {
      // If signature verification fails, log and return error
      console.error('Signature verification error:', error.message);
      return { 
        valid: false, 
        error: 'Signature verification failed' 
      };
    }

    // Token is valid - return user info and claims
    return {
      valid: true,
      uid: payload.sub,
      claims: {
        email: payload.email || null,
        email_verified: payload.email_verified || false,
        admin: payload.admin || false,
        role: payload.role || 'user',
        ...payload
      }
    };
    
  } catch (error) {
    console.error('Token verification error:', error);
    return { 
      valid: false, 
      error: error.message || 'Token verification failed' 
    };
  }
}

/**
 * Verify JWT signature using Web Crypto API
 * 
 * @param {string} token - The JWT token
 * @param {string} publicKeyPem - The public key in PEM format
 * @returns {Promise<boolean>} - True if signature is valid
 */
async function verifyJWTSignature(token, publicKeyPem) {
  try {
    const parts = token.split('.');
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];
    
    // Convert base64url signature to ArrayBuffer
    const signatureBuffer = base64UrlToArrayBuffer(signature);
    
    // Create the data to verify (header.payload)
    const data = new TextEncoder().encode(`${header}.${payload}`);
    
    // Import the public key
    const publicKey = await importPublicKey(publicKeyPem);
    
    // Verify the signature
    const isValid = await crypto.subtle.verify(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      publicKey,
      signatureBuffer,
      data
    );
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Import a public key from PEM format
 * 
 * @param {string} pem - The public key in PEM format
 * @returns {Promise<CryptoKey>} - The imported public key
 */
async function importPublicKey(pem) {
  // Remove PEM headers and convert to binary
  const pemContents = pem
    .replace('-----BEGIN CERTIFICATE-----', '')
    .replace('-----END CERTIFICATE-----', '')
    .replace(/\n/g, '');
  
  const binaryDer = base64ToArrayBuffer(pemContents);
  
  // Import as X509 certificate
  const key = await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  );
  
  return key;
}

/**
 * Convert base64 to ArrayBuffer
 * 
 * @param {string} base64 - Base64 string
 * @returns {ArrayBuffer} - ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert base64url to ArrayBuffer
 * 
 * @param {string} base64url - Base64url string
 * @returns {ArrayBuffer} - ArrayBuffer
 */
function base64UrlToArrayBuffer(base64url) {
  // Convert base64url to base64
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return base64ToArrayBuffer(base64);
}

/**
 * Check if a user has admin role
 * 
 * @param {object} claims - User claims from verified token
 * @returns {boolean} - True if user is an admin
 */
export function isAdmin(claims) {
  return claims && (claims.admin === true || claims.role === 'admin' || claims.role === 'master');
}

/**
 * Check if a user has master admin role
 * 
 * @param {object} claims - User claims from verified token
 * @returns {boolean} - True if user is a master admin
 */
export function isMasterAdmin(claims) {
  return claims && claims.role === 'master';
}
