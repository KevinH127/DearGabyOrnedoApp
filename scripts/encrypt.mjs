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

for (const file of files) {
  const plaintext = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Store as iv:encrypted (both base64)
  const output = iv.toString('base64') + ':' + encrypted;
  fs.writeFileSync(path.join(OUT_DIR, file), output);
  console.log(`✅ Encrypted: ${file}`);
}

console.log(`\nDone! ${files.length} letter(s) encrypted to public/letters/`);
