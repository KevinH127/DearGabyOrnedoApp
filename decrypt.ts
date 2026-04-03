// Decrypts letter content fetched from encrypted .txt files
// Uses Web Crypto API (AES-CBC) with the key from env vars

const SECRET_KEY = import.meta.env.VITE_LETTER_KEY || '';

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  return crypto.subtle.importKey('raw', keyData, { name: 'AES-CBC' }, false, ['decrypt']);
}

export async function decryptLetter(encryptedText: string): Promise<string> {
  if (!SECRET_KEY) {
    throw new Error('Missing decryption key');
  }

  const [ivB64, dataB64] = encryptedText.split(':');
  if (!ivB64 || !dataB64) {
    throw new Error('Invalid encrypted format');
  }

  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));

  const key = await deriveKey(SECRET_KEY);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data);

  return new TextDecoder().decode(decrypted);
}
