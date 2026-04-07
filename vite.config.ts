import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only plugin: handles /api/letters locally so we don't need `vercel dev`
function apiPlugin(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/letters')) return next();

        // Dynamically import @vercel/blob
        const { list, put } = await import('@vercel/blob');
        const token = env.BLOB_READ_WRITE_TOKEN;

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.method === 'GET') {
            const { blobs } = await list({ prefix: 'meta/', token });
            const metaBlob = blobs.find((b) => b.pathname === 'meta/letters.json');

            if (!metaBlob) {
              res.end(JSON.stringify({ letters: [] }));
              return;
            }

            const response = await fetch(metaBlob.url);
            const data = await response.json();
            res.end(JSON.stringify(data));
            return;
          }

          if (req.method === 'POST') {
            // Parse JSON body
            const body = await new Promise((resolve) => {
              let data = '';
              req.on('data', (chunk) => (data += chunk));
              req.on('end', () => resolve(JSON.parse(data)));
            });

            const { password, title, preview, encryptedContent } = body;

            if (password !== env.ADMIN_PASSWORD) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Invalid admin password' }));
              return;
            }

            if (!title || !preview || !encryptedContent) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing required fields' }));
              return;
            }

            // Load existing metadata
            let letters = [];
            const { blobs } = await list({ prefix: 'meta/', token });
            const metaBlob = blobs.find((b) => b.pathname === 'meta/letters.json');

            if (metaBlob) {
              const response = await fetch(metaBlob.url);
              const data = await response.json();
              letters = data.letters || [];
            }

            const maxId = letters.reduce((max, l) => Math.max(max, l.id), 0);
            const newId = maxId + 1;

            const contentBlob = await put(`letters/letter-${newId}.txt`, encryptedContent, {
              access: 'public',
              addRandomSuffix: false,
              token,
            });

            const newLetter = {
              id: newId,
              title,
              preview,
              url: contentBlob.url,
              createdAt: new Date().toISOString(),
            };

            letters.push(newLetter);

            await put('meta/letters.json', JSON.stringify({ letters }, null, 2), {
              access: 'public',
              addRandomSuffix: false,
              token,
            });

            res.statusCode = 201;
            res.end(JSON.stringify({ letter: newLetter }));
            return;
          }

          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        } catch (err) {
          console.error('API error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), apiPlugin(env)],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
