/**
 * Cloudflare Workers - API Router
 * Routes requests to appropriate handlers
 */

import { handleUsersRequest } from '../functions/api/users.js';
import { handleAdminRequest } from '../functions/api/admin.js';
import { handleCacheRequest } from '../functions/api/cache.js';
import { handleStorageRequest } from './storage.js';
import { handleKVCacheRequest, checkRateLimit } from './cache.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Rate limiting check (optional - enable for production)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    // const rateLimitResult = await checkRateLimit(env, clientIP, 1000, 3600);
    // if (!rateLimitResult.allowed) {
    //   return new Response(JSON.stringify({
    //     error: 'Rate limit exceeded',
    //     ...rateLimitResult,
    //   }), {
    //     status: 429,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // Route to appropriate handler
    if (path.startsWith('/api/users')) {
      return handleUsersRequest(request, env);
    }

    if (path.startsWith('/api/admin')) {
      return handleAdminRequest(request, env);
    }

    if (path.startsWith('/api/cache')) {
      return handleCacheRequest(request, env);
    }

    if (path.startsWith('/storage')) {
      return handleStorageRequest(request, env);
    }

    if (path.startsWith('/cache')) {
      return handleKVCacheRequest(request, env);
    }

    // Health check endpoint
    if (path === '/health' || path === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Default 404
    return new Response(JSON.stringify({
      error: 'Route not found',
      path,
      availableRoutes: [
        '/api/users/*',
        '/api/admin/*',
        '/api/cache/*',
        '/storage/*',
        '/cache/*',
        '/health',
      ],
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
