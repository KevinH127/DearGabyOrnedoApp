/**
 * One-time migration script: uploads existing encrypted letters to Vercel Blob
 * and creates the initial letters-meta.json.
 *
 * Usage: node scripts/migrate-letters.mjs
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local
 */

import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load env vars from .env.local
config({ path: '.env.local' });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN in .env.local');
  console.error('   Run: vercel env pull .env.local');
  process.exit(1);
}

// Your existing letters — metadata from constants.ts
const EXISTING_LETTERS = [
  {
    id: 1,
    title: "April 2, 2026",
    preview: "I just wanted to talk to you",
    file: "letter-1.txt",
    createdAt: "2026-04-02T00:00:00Z",
  },
  {
    id: 2,
    title: "April 3, 2026",
    preview: "How I felt today",
    file: "letter-2.txt",
    createdAt: "2026-04-03T00:00:00Z",
  },
  {
    id: 3,
    title: "April 4, 2026",
    preview: "Hope you had lots of fun this weekend",
    file: "letter-3.txt",
    createdAt: "2026-04-04T00:00:00Z",
  },
  {
    id: 4,
    title: "April 5, 2026",
    preview: "Happy Easter Gaby",
    file: "letter-4.txt",
    createdAt: "2026-04-05T00:00:00Z",
  },
];

const LETTERS_DIR = path.resolve('public/letters');

async function migrate() {
  console.log('🚀 Starting migration...\n');

  const letters = [];

  for (const meta of EXISTING_LETTERS) {
    const filePath = path.join(LETTERS_DIR, meta.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      console.error('   Make sure you have run "npm run encrypt" first.');
      process.exit(1);
    }

    const encryptedContent = fs.readFileSync(filePath, 'utf8');

    console.log(`📤 Uploading ${meta.file}...`);
    const blob = await put(`letters/${meta.file}`, encryptedContent, {
      access: 'public',
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });

    letters.push({
      id: meta.id,
      title: meta.title,
      preview: meta.preview,
      url: blob.url,
      createdAt: meta.createdAt,
    });

    console.log(`   ✅ Uploaded → ${blob.url}`);
  }

  // Upload metadata
  console.log('\n📤 Uploading letters-meta.json...');
  const metaBlob = await put(
    'meta/letters.json',
    JSON.stringify({ letters }, null, 2),
    {
      access: 'public',
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    },
  );
  console.log(`   ✅ Metadata → ${metaBlob.url}`);

  console.log(`\n🎉 Migration complete! ${letters.length} letters uploaded.`);
  console.log('\nYou can now remove public/letters/ and letters-src/ if you want.');
}

migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
