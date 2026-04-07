import https from 'https';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) return res.status(400).json({ error: 'Missing url' });

  // Only allow our blob storage
  if (!url.includes('.vercel-storage.com/')) {
    return res.status(403).json({ error: 'Forbidden domain' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Try to fake a real browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/plain, */*',
      }
    });

    if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed' });
    }

    const text = await response.text();
    
    // Check if it's the security checkpoint
    if (text.includes('Vercel Security Checkpoint')) {
       return res.status(503).json({ error: 'Security Checkpoint active, bypassing failed.' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
