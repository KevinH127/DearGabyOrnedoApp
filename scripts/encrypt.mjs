import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('letters-src');
const OUT_DIR = path.resolve('public/letters');

// Use VITE_LETTER_KEY from .env, or fall back
const envFile = fs.readFileSync('.env', 'utf8');
const keyMatch = envFile.match(/VITE_LETTER_KEY=(.+)/);
const SECRET_KEY = keyMatch?.[1]?.trim();

if (!SECRET_KEY) {
  console.error('❌ Missing VITE_LETTER_KEY in .env');
  process.exit(1);
}

// Ensure output dir exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Derive a 256-bit key from the secret
const key = crypto.createHash('sha256').update(SECRET_KEY).digest();

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.txt'));

if (files.length === 0) {
  console.log('No .txt files found in letters-src/');
  process.exit(0);
}

let encryptedCount = 0;
let skippedCount = 0;

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file);
  const outPath = path.join(OUT_DIR, file);

  // Skip if already exists and hasn't changed
  if (fs.existsSync(outPath)) {
    const srcStat = fs.statSync(srcPath);
    const outStat = fs.statSync(outPath);
    if (srcStat.mtime <= outStat.mtime) {
      skippedCount++;
      continue;
    }
  }

  const plaintext = fs.readFileSync(srcPath, 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Store as iv:encrypted (both base64)
  const output = iv.toString('base64') + ':' + encrypted;
  fs.writeFileSync(outPath, output);
  console.log(`✅ Encrypted: ${file}`);
  encryptedCount++;
}

if (encryptedCount === 0 && skippedCount > 0) {
  console.log('✨ All letters are already up to date!');
} else {
  console.log(`\nDone! ${encryptedCount} letter(s) encrypted, ${skippedCount} skipped.`);
}
