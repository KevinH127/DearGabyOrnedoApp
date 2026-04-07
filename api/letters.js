import { put, list, del } from '@vercel/blob';

// ─── UTILS ──────────────────────────────────────────────────────
function encodeMeta(str) {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function decodeMeta(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

// GET: Return all letter metadata
// POST: Upload a new encrypted letter (admin password required)
// PUT: Edit an existing letter (admin password required)

export default async function handler(req, res) {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── GET /api/letters ───────────────────────────────────────────
async function handleGet(_req, res) {
  try {
    // V3 Architecture: metadata is heavily embedded in the file names
    // This entirely avoids Vercel Edge Firewall checks associated with `fetch()`
    const { blobs } = await list({ prefix: 'letters-v3/' });

    const letters = blobs.map((b) => {
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

    letters.sort((a, b) => a.id - b.id);

    return res.status(200).json({ letters });
  } catch (error) {
    console.error('GET /api/letters error:', error);
    return res.status(500).json({ error: 'Failed to fetch letters', detail: error?.message || String(error) });
  }
}

// ─── POST /api/letters ──────────────────────────────────────────
async function handlePost(req, res) {
  try {
    const { password, title, preview, encryptedContent } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    if (!title || !preview || !encryptedContent) {
      return res.status(400).json({ error: 'Missing required fields: title, preview, encryptedContent' });
    }

    // Get current blobs to determine next ID
    const { blobs } = await list({ prefix: 'letters-v3/' });
    let maxId = 0;
    for (const b of blobs) {
      const parts = b.pathname.split('/').pop().split('.');
      const id = parseInt(parts[0], 10);
      if (id > maxId) maxId = id;
    }
    const newId = maxId + 1;

    // Filename: letters-v3/id.titleBase64.previewBase64.txt
    const filename = `letters-v3/${newId}.${encodeMeta(title)}.${encodeMeta(preview)}.txt`;

    const contentBlob = await put(filename, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    const newLetter = {
      id: newId,
      title,
      preview,
      url: contentBlob.url,
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({ letter: newLetter });
  } catch (error) {
    console.error('POST /api/letters error:', error);
    return res.status(500).json({ error: 'Failed to create letter', detail: error?.message || String(error) });
  }
}

// ─── PUT /api/letters ───────────────────────────────────────────
async function handlePut(req, res) {
  try {
    const { password, id, title, preview, encryptedContent } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    if (!id || !title || !preview || !encryptedContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find existing blob
    const { blobs } = await list({ prefix: 'letters-v3/' });
    const oldBlob = blobs.find((b) => b.pathname.startsWith(`letters-v3/${id}.`));

    if (!oldBlob) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    const newFilename = `letters-v3/${id}.${encodeMeta(title)}.${encodeMeta(preview)}.txt`;

    // Upload new content
    const contentBlob = await put(newFilename, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // Delete old blob if filename changed
    if (oldBlob.pathname !== newFilename) {
      await del(oldBlob.url);
    }

    return res.status(200).json({
      letter: {
        id,
        title,
        preview,
        url: contentBlob.url,
        createdAt: oldBlob.uploadedAt
      }
    });
  } catch (error) {
    console.error('PUT /api/letters error:', error);
    return res.status(500).json({ error: 'Failed to update letter', detail: error?.message || String(error) });
  }
}
