import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SECRET_KEY = process.env.VITE_LETTER_KEY;

if (!BLOB_TOKEN || !SECRET_KEY) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN or VITE_LETTER_KEY');
  process.exit(1);
}

const SRC_DIR = path.resolve('letters-src');
const INDEX_FILE = path.join(SRC_DIR, 'index.json');

function encodeMeta(str) {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function encrypt(plaintext) {
  const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

async function main() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('❌ No letters-src/index.json found');
    process.exit(1);
  }

  const localLetters = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const { blobs } = await list({ prefix: 'letters-v3/', token: BLOB_TOKEN });

  let blobTitles = new Set();
  let maxId = 0;

  for (const b of blobs) {
    const filename = b.pathname.split('/').pop().replace('.txt', '');
    const parts = filename.split('.');
    if (parts.length >= 3) {
      const id = parseInt(parts[0], 10);
      if (id > maxId) maxId = id;
      const title = Buffer.from(parts[1], 'base64url').toString('utf8');
      blobTitles.add(title);
    }
  }

  const newLetters = localLetters.filter((l) => !blobTitles.has(l.title));

  if (newLetters.length === 0) {
    console.log('✨ All letters are already uploaded!');
    return;
  }

  console.log(`🚀 Found ${newLetters.length} new letter(s) to upload\n`);

  let nextId = maxId + 1;

  for (const meta of newLetters) {
    const srcPath = path.join(SRC_DIR, meta.file);
    if (!fs.existsSync(srcPath)) continue;

    const plaintext = fs.readFileSync(srcPath, 'utf8');
    const encryptedContent = encrypt(plaintext);
    
    const filename = `letters-v3/${nextId}.${encodeMeta(meta.title)}.${encodeMeta(meta.preview)}.txt`;

    console.log(`📤 Uploading ${meta.title}...`);
    await put(filename, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: BLOB_TOKEN,
    });

    nextId++;
  }

  console.log(`\n🎉 Done! ${newLetters.length} new letter(s) securely published.`);
}

main().catch(err => console.error(err));
