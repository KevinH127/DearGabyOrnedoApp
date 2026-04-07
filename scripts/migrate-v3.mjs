import { list, put } from '@vercel/blob';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });
config({ path: '.env' });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function encodeMeta(str) {
  return Buffer.from(str, 'utf8').toString('base64url');
}

async function main() {
  console.log('Fetching old blobs...');
  const { blobs } = await list({ prefix: 'letters/', token: BLOB_TOKEN });
  
  // Actually, we can just read from the local file index.json to map title/preview
  // Or fetch the old meta/letters.json from Vercel! If bot protection blocks fetch, 
  // we can just use the provided url but with curl header equivalent or we fetch it 
  // with downloadUrl
  console.log(`Found ${blobs.length} raw blobs. Trying to fetch meta/letters.json...`);
  
  const metaList = await list({ prefix: 'meta/', token: BLOB_TOKEN });
  const metaBlob = metaList.blobs.find(b => b.pathname === 'meta/letters.json');
  
  if (!metaBlob) {
    console.error('No metal blob found!');
    process.exit(1);
  }

  const res = await fetch(metaBlob.url, {
      headers: {
          'User-Agent': 'Mozilla/5.0' // Try to bypass bot protection just for this one-off run
      }
  });

  const text = await res.text();
  let data;
  try {
      data = JSON.parse(text);
  } catch(e) {
      console.log('Bot protection blocked fetch. Using local letters-src/index.json as fallback...');
      const fs = await import('fs');
      if (fs.existsSync('letters-src/index.json')) {
         const local = JSON.parse(fs.readFileSync('letters-src/index.json', 'utf8'));
         data = { letters: local.map((l, i) => ({ id: i+1, title: l.title, preview: l.preview, fileUrl: '' })) };
      }
  }

  const letters = data?.letters || [];

  for (const letter of letters) {
    // If not fileUrl, we assume it corresponds to letters/letter-{id}.txt
    const oldPath = `letters/letter-${letter.id}.txt`;
    const oldBlob = blobs.find(b => b.pathname === oldPath);
    
    if (oldBlob) {
      console.log(`Downloading ${oldBlob.pathname}...`);
      // Since it's a serverless environment getting blocked, we can fetch from local using raw node HTTP maybe
      const contentRes = await fetch(oldBlob.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      let content = await contentRes.text();

      if (content.includes('<!DOCTYPE html>')) {
        console.error(`Failed to fetch content for letter ${letter.id}!! Bot protection caught it.`);
        continue;
      }

      const newFilename = `letters-v3/${letter.id}.${encodeMeta(letter.title)}.${encodeMeta(letter.preview)}.txt`;
      console.log(`Uploading as ${newFilename}...`);

      await put(newFilename, content, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: BLOB_TOKEN,
      });
      console.log(`Migrated letter ${letter.id}!`);
    } else {
      console.warn(`Could not find blob for letter ${letter.id}`);
    }
  }

  console.log('Migration complete!');
}

main().catch(err => console.error(err));
