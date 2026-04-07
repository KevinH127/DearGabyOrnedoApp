import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function encodeMeta(str: string) {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function decodeMeta(str: string) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

// Dev-only plugin: handles /api/letters locally so we don't need `vercel dev`
function apiPlugin(env: any) {
  return {
    name: 'local-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/letters')) return next();

        const { list, put, del } = await import('@vercel/blob');
        const token = env.BLOB_READ_WRITE_TOKEN;

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.method === 'GET') {
            const { blobs } = await list({ prefix: 'letters-v3/', token });

            const letters = blobs.map((b: any) => {
              const filename = b.pathname.split('/').pop().replace('.txt', '');
              const parts = filename.split('.');
              if (parts.length >= 3) {
                return {
                  id: parseInt(parts[0], 10),
                  title: decodeMeta(parts[1]),
                  preview: decodeMeta(parts[2]),
                  url: b.url,
                  createdAt: b.uploadedAt
                };
              }
              return null;
            }).filter(Boolean);

            letters.sort((a: any, b: any) => a.id - b.id);
            res.end(JSON.stringify({ letters }));
            return;
          }

          if (req.method === 'POST') {
            const body: any = await new Promise((resolve) => {
              let data = '';
              req.on('data', (chunk: string) => (data += chunk));
              req.on('end', () => resolve(JSON.parse(data)));
            });

            const { password, title, preview, encryptedContent } = body;

            if (password !== env.ADMIN_PASSWORD) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Invalid admin password' }));
              return;
            }

            const { blobs } = await list({ prefix: 'letters-v3/', token });
            let maxId = 0;
            for (const b of blobs) {
              const parts = b.pathname.split('/').pop().split('.');
              const id = parseInt(parts[0], 10);
              if (id > maxId) maxId = id;
            }
            const newId = maxId + 1;

            const filename = `letters-v3/${newId}.${encodeMeta(title)}.${encodeMeta(preview)}.txt`;

            const contentBlob = await put(filename, encryptedContent, {
              access: 'public',
              addRandomSuffix: false,
              allowOverwrite: true,
              token,
            });

            res.statusCode = 201;
            res.end(JSON.stringify({
              letter: {
                id: newId,
                title,
                preview,
                url: contentBlob.url,
                createdAt: new Date().toISOString()
              }
            }));
            return;
          }

          if (req.method === 'PUT') {
            const body: any = await new Promise((resolve) => {
              let data = '';
              req.on('data', (chunk: string) => (data += chunk));
              req.on('end', () => resolve(JSON.parse(data)));
            });

            const { password, id, title, preview, encryptedContent } = body;

            if (password !== env.ADMIN_PASSWORD) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Invalid admin password' }));
              return;
            }

            const { blobs } = await list({ prefix: 'letters-v3/', token });
            const oldBlob = blobs.find((b: any) => b.pathname.startsWith(`letters-v3/${id}.`));

            if (!oldBlob) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Letter not found' }));
              return;
            }

            const newFilename = `letters-v3/${id}.${encodeMeta(title)}.${encodeMeta(preview)}.txt`;

            const contentBlob = await put(newFilename, encryptedContent, {
              access: 'public',
              addRandomSuffix: false,
              allowOverwrite: true,
              token,
            });

            if (oldBlob.pathname !== newFilename) {
              await del(oldBlob.url, { token });
            }

            res.statusCode = 200;
            res.end(JSON.stringify({
              letter: {
                id,
                title,
                preview,
                url: contentBlob.url,
                createdAt: oldBlob.uploadedAt
              }
            }));
            return;
          }

          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        } catch (err: any) {
          console.error('API error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error', detail: err?.message }));
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
