// TOTP implementation using Web Crypto API (no external deps needed)

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = "";
  for (let i = 0; i < bytes.length; i += 5) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    const b3 = bytes[i + 3] ?? 0;
    const b4 = bytes[i + 4] ?? 0;
    result += BASE32_CHARS[(b0 >> 3) & 31];
    result += BASE32_CHARS[((b0 << 2) | (b1 >> 6)) & 31];
    result += BASE32_CHARS[(b1 >> 1) & 31];
    result += BASE32_CHARS[((b1 << 4) | (b2 >> 4)) & 31];
    result += BASE32_CHARS[((b2 << 1) | (b3 >> 7)) & 31];
    result += BASE32_CHARS[(b3 >> 2) & 31];
    result += BASE32_CHARS[((b3 << 3) | (b4 >> 5)) & 31];
    result += BASE32_CHARS[b4 & 31];
  }
  return result;
}

export function base32Decode(encoded: string): ArrayBuffer {
  const str = encoded.toUpperCase().replace(/=+$/, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of str) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes).buffer;
}

async function hmacSha1(
  key: ArrayBuffer,
  data: ArrayBuffer,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(sig);
}

function counterToBuffer(counter: number): ArrayBuffer {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  return buf;
}

export async function validateTotp(
  token: string,
  secret: string,
  windowSize = 1,
  timeStep = 30,
  digits = 6,
): Promise<boolean> {
  const keyBytes = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  for (let delta = -windowSize; delta <= windowSize; delta++) {
    const hmac = await hmacSha1(keyBytes, counterToBuffer(counter + delta));
    const offset = hmac[19]! & 0x0f;
    const code =
      (((hmac[offset]! & 0x7f) << 24) |
        ((hmac[offset + 1]! & 0xff) << 16) |
        ((hmac[offset + 2]! & 0xff) << 8) |
        (hmac[offset + 3]! & 0xff)) %
      10 ** digits;
    if (code.toString().padStart(digits, "0") === token) return true;
  }
  return false;
}

export function buildTotpUri(
  secret: string,
  issuer: string,
  account: string,
): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
