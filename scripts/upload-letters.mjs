/**
 * Encrypt & Upload: reads letters from letters-src/, encrypts new ones,
 * and uploads to Vercel Blob.
 *
 * Usage: npm run upload
 *
 * Workflow:
 *   1. Write your letter in letters-src/letter-N.txt
 *   2. Add an entry to letters-src/index.json with title + preview
 *   3. Run: npm run upload
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';
import { config } from 'dotenv';

// Load env vars
config({ path: '.env.local' });
config({ path: '.env' });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SECRET_KEY = process.env.VITE_LETTER_KEY;

if (!BLOB_TOKEN) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN in .env.local');
  process.exit(1);
}

if (!SECRET_KEY) {
  console.error('❌ Missing VITE_LETTER_KEY in .env or .env.local');
  process.exit(1);
}

const SRC_DIR = path.resolve('letters-src');
const INDEX_FILE = path.join(SRC_DIR, 'index.json');

// ─── Encrypt a plaintext string (same scheme as decrypt.ts) ─────
function encrypt(plaintext) {
  const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  // Read local index
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('❌ No letters-src/index.json found');
    console.error('   Create it with entries like: { "file": "letter-5.txt", "title": "...", "preview": "..." }');
    process.exit(1);
  }

  const localLetters = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

  // Fetch existing Blob metadata
  let blobLetters = [];
  const { blobs } = await list({ prefix: 'meta/', token: BLOB_TOKEN });
  const metaBlob = blobs.find((b) => b.pathname === 'meta/letters.json');

  if (metaBlob) {
    const response = await fetch(metaBlob.url);
    const data = await response.json();
    blobLetters = data.letters || [];
  }

  // Find which local letters are already uploaded (match by title)
  const uploadedTitles = new Set(blobLetters.map((l) => l.title));
  const newLetters = localLetters.filter((l) => !uploadedTitles.has(l.title));

  if (newLetters.length === 0) {
    console.log('✨ All letters are already uploaded!');
    return;
  }

  console.log(`🚀 Found ${newLetters.length} new letter(s) to upload\n`);

  const maxId = blobLetters.reduce((max, l) => Math.max(max, l.id), 0);
  let nextId = maxId + 1;

  for (const meta of newLetters) {
    const srcPath = path.join(SRC_DIR, meta.file);

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ File not found: ${srcPath}`);
      continue;
    }

    // Read and encrypt
    const plaintext = fs.readFileSync(srcPath, 'utf8');
    const encryptedContent = encrypt(plaintext);

    // Upload to Blob
    console.log(`📤 Encrypting & uploading ${meta.file}...`);
    const blob = await put(`letters/letter-${nextId}.txt`, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });

    blobLetters.push({
      id: nextId,
      title: meta.title,
      preview: meta.preview,
      url: blob.url,
      createdAt: new Date().toISOString(),
    });

    console.log(`   ✅ Uploaded → ${blob.url}`);
    nextId++;
  }

  // Update metadata in Blob
  console.log('\n📤 Updating metadata...');
  await put('meta/letters.json', JSON.stringify({ letters: blobLetters }, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    token: BLOB_TOKEN,
  });

  console.log(`\n🎉 Done! ${newLetters.length} new letter(s) encrypted & uploaded.`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
