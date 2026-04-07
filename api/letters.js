import { put, list } from '@vercel/blob';

// GET: Return all letter metadata
// POST: Upload a new encrypted letter (admin password required)

export default async function handler(req, res) {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── GET /api/letters ───────────────────────────────────────────
async function handleGet(_req, res) {
  try {
    // Try to fetch the metadata file from Blob
    const { blobs } = await list({ prefix: 'meta/' });
    const metaBlob = blobs.find((b) => b.pathname === 'meta/letters.json');

    if (!metaBlob) {
      // No letters yet
      return res.status(200).json({ letters: [] });
    }

    const response = await fetch(metaBlob.url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('GET /api/letters error:', error);
    return res.status(500).json({ error: 'Failed to fetch letters' });
  }
}

// ─── POST /api/letters ──────────────────────────────────────────
async function handlePost(req, res) {
  try {
    const { password, title, preview, encryptedContent } = req.body;

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    if (!title || !preview || !encryptedContent) {
      return res.status(400).json({ error: 'Missing required fields: title, preview, encryptedContent' });
    }

    // Load existing metadata
    let letters = [];
    const { blobs } = await list({ prefix: 'meta/' });
    const metaBlob = blobs.find((b) => b.pathname === 'meta/letters.json');

    if (metaBlob) {
      const response = await fetch(metaBlob.url);
      const data = await response.json();
      letters = data.letters || [];
    }

    // Generate next ID
    const maxId = letters.reduce((max, l) => Math.max(max, l.id), 0);
    const newId = maxId + 1;

    // Upload encrypted content to Blob
    const contentBlob = await put(`letters/letter-${newId}.txt`, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Create new letter entry
    const newLetter = {
      id: newId,
      title,
      preview,
      url: contentBlob.url,
      createdAt: new Date().toISOString(),
    };

    letters.push(newLetter);

    // Upload updated metadata
    await put('meta/letters.json', JSON.stringify({ letters }, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    return res.status(201).json({ letter: newLetter });
  } catch (error) {
    console.error('POST /api/letters error:', error);
    return res.status(500).json({ error: 'Failed to create letter' });
  }
}
