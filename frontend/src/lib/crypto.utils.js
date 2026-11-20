// Shared protocol values and small browser helpers used by the crypto modules.
export const CRYPTO_SETTINGS = Object.freeze({
  version: 1,
  algorithm: "AES-256-GCM",
  ivBytes: 12,
  masterKeyBytes: 32,
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function randomBytes(length) {
  if (!Number.isInteger(length) || length < 1 || length > 65536) {
    throw new RangeError("Random byte length must be between 1 and 65536");
  }
  return crypto.getRandomValues(new Uint8Array(length));
}

export function utf8Encode(value) {
  return encoder.encode(value);
}

export function utf8Decode(bytes) {
  return decoder.decode(bytes);
}

export function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new TypeError("Invalid encoded crypto value");
  }

  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  if (toBase64Url(bytes) !== value) throw new TypeError("Non-canonical crypto encoding");
  return bytes;
}
