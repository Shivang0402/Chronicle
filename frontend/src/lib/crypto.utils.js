// Shared protocol values and small browser helpers used by the crypto modules.
export const CRYPTO_SETTINGS = Object.freeze({
  version: 1,
  algorithm: "AES-256-GCM",
  ivBytes: 12,
  masterKeyBytes: 32,
  maxPassphraseBytes: 1024,
  maxPayloadBytes: 256 * 1024,
  maxPayloadDepth: 20,
  maxPayloadNodes: 10000,
  maxEntryCiphertextBytes: 256 * 1024 + 16,
});

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export function randomBytes(length) {
  if (!Number.isInteger(length) || length < 1 || length > 65536) {
    throw new RangeError("Random byte length must be between 1 and 65536");
  }
  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error("Secure random generation is unavailable in this browser");
  }
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

export function getSubtleCrypto() {
  if (typeof globalThis.crypto?.subtle?.encrypt !== "function") {
    throw new Error("Web Crypto AES-GCM is unavailable in this browser");
  }
  return globalThis.crypto.subtle;
}

export function canonicalPayloadBytes(payload) {
  const seen = new WeakSet();
  let nodes = 0;

  function normalize(value, depth) {
    nodes += 1;
    if (nodes > CRYPTO_SETTINGS.maxPayloadNodes || depth > CRYPTO_SETTINGS.maxPayloadDepth) {
      throw new RangeError("Journal payload is too complex");
    }
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "object") throw new TypeError("Journal payload must contain JSON values only");
    if (seen.has(value)) throw new TypeError("Journal payload cannot contain cycles");
    seen.add(value);

    if (Array.isArray(value)) return value.map((item) => normalize(item, depth + 1));
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw new TypeError("Journal payload must contain plain objects");
    }
    const result = Object.create(null);
    for (const key of Object.keys(value).sort()) {
      const item = value[key];
      if (item === undefined) throw new TypeError("Journal payload cannot contain undefined values");
      result[key] = normalize(item, depth + 1);
    }
    return result;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Journal payload must be an object");
  }
  if (Object.hasOwn(payload, "content") && typeof payload.content !== "string") {
    throw new TypeError("Journal content must be text");
  }
  if (typeof payload.content === "string" && payload.content.length > 100000) {
    throw new RangeError("Journal content is too long");
  }
  if (Object.hasOwn(payload, "title") && (typeof payload.title !== "string" || payload.title.length > 1000)) {
    throw new TypeError("Journal title is invalid");
  }
  if (Object.hasOwn(payload, "mood") && (typeof payload.mood !== "string" || payload.mood.length > 128)) {
    throw new TypeError("Journal mood is invalid");
  }
  if (Object.hasOwn(payload, "tags")) {
    if (!Array.isArray(payload.tags) || payload.tags.length > 100 || payload.tags.some((tag) => typeof tag !== "string" || tag.length > 256)) {
      throw new TypeError("Journal tags are invalid");
    }
  }

  const bytes = utf8Encode(JSON.stringify(normalize(payload, 0)));
  if (bytes.byteLength > CRYPTO_SETTINGS.maxPayloadBytes) {
    throw new RangeError("Journal payload exceeds the encrypted size limit");
  }
  return bytes;
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
