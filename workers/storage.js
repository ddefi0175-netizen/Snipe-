/**
 * Cloudflare Workers - R2 Storage Handler
 * Handles file uploads to Cloudflare R2 for cost-effective storage
 * Benefits: Zero egress fees, S3-compatible API
 */

export async function handleStorageRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - Missing authorization token',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /storage/upload - Upload file to R2
    if (method === 'POST' && path === '/storage/upload') {
      const formData = await request.formData();
      const file = formData.get('file');
      const category = formData.get('category') || 'general'; // profile, kyc, receipts, chat
      const userId = formData.get('userId');

      if (!file || !userId) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: file, userId',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({
          error: 'File too large - maximum 10MB',
        }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate file type based on category
      const allowedTypes = {
        profile: ['image/jpeg', 'image/png', 'image/webp'],
        kyc: ['image/jpeg', 'image/png', 'application/pdf'],
        receipts: ['image/jpeg', 'image/png', 'application/pdf'],
        chat: ['image/jpeg', 'image/png', 'image/gif'],
      };

      if (allowedTypes[category] && !allowedTypes[category].includes(file.type)) {
        return new Response(JSON.stringify({
          error: `Invalid file type for ${category}. Allowed: ${allowedTypes[category].join(', ')}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${category}/${userId}/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      if (env.STORAGE_BUCKET) {
        await env.STORAGE_BUCKET.put(filename, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
          customMetadata: {
            userId,
            category,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        });

        // Generate public URL (if bucket is public) or signed URL
        const fileUrl = `https://storage.yourdomain.com/${filename}`;

        return new Response(JSON.stringify({
          success: true,
          filename,
          url: fileUrl,
          size: file.size,
          type: file.type,
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          error: 'Storage bucket not configured',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // GET /storage/file/:filename - Retrieve file from R2
    if (method === 'GET' && path.startsWith('/storage/file/')) {
      const filename = path.replace('/storage/file/', '');

      if (!env.STORAGE_BUCKET) {
        return new Response(JSON.stringify({
          error: 'Storage bucket not configured',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const object = await env.STORAGE_BUCKET.get(filename);

      if (!object) {
        return new Response(JSON.stringify({
          error: 'File not found',
          filename,
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Return file with appropriate headers
      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year for immutable files

      return new Response(object.body, { headers });
    }

    // DELETE /storage/file/:filename - Delete file from R2
    if (method === 'DELETE' && path.startsWith('/storage/file/')) {
      const filename = path.replace('/storage/file/', '');

      if (!env.STORAGE_BUCKET) {
        return new Response(JSON.stringify({
          error: 'Storage bucket not configured',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await env.STORAGE_BUCKET.delete(filename);

      return new Response(JSON.stringify({
        success: true,
        filename,
        message: 'File deleted',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /storage/list/:userId - List user's files
    if (method === 'GET' && path.startsWith('/storage/list/')) {
      const userId = path.replace('/storage/list/', '');

      if (!env.STORAGE_BUCKET) {
        return new Response(JSON.stringify({
          error: 'Storage bucket not configured',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // List objects with prefix
      const list = await env.STORAGE_BUCKET.list({
        prefix: `profile/${userId}/`,
        limit: 100,
      });

      const files = list.objects.map(obj => ({
        filename: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        metadata: obj.customMetadata,
      }));

      return new Response(JSON.stringify({
        userId,
        files,
        count: files.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({
      error: 'Storage route not found',
      path,
      method,
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Storage API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
