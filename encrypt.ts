// Encrypts letter content in the browser before uploading
// Uses Web Crypto API (AES-CBC) — mirrors decrypt.ts

const SECRET_KEY = import.meta.env.VITE_LETTER_KEY || '';

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  return crypto.subtle.importKey('raw', keyData, { name: 'AES-CBC' }, false, ['encrypt']);
}

export async function encryptLetter(plaintext: string): Promise<string> {
  if (!SECRET_KEY) {
    throw new Error('Missing encryption key');
  }

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(SECRET_KEY);
  const encoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    encoder.encode(plaintext),
  );

  // Same format as decrypt.ts expects: iv:data (both base64)
  const ivB64 = btoa(String.fromCharCode(...iv));
  const dataB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return ivB64 + ':' + dataB64;
}
