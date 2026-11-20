import { argon2id } from "hash-wasm";
import {
  CRYPTO_SETTINGS,
  fromBase64Url,
  randomBytes,
  toBase64Url,
  utf8Decode,
  utf8Encode,
} from "./crypto.utils.js";

export { CRYPTO_SETTINGS };

const subtle = crypto.subtle;

function entryAad({ ownerId, entryId, date }) {
  return utf8Encode(JSON.stringify(["chronicle-entry", 1, ownerId, entryId, date]));
}

function wrapAad(ownerId, purpose) {
  return utf8Encode(JSON.stringify(["chronicle-master-key", 1, ownerId, purpose]));
}

function checkEntryContext(context) {
  if (!context?.ownerId || !context?.entryId || !context?.date) {
    throw new TypeError("Entry owner, ID, and date are required");
  }
}

function checkWrappedKey(envelope) {
  if (envelope?.algorithm !== CRYPTO_SETTINGS.algorithm || envelope.version !== CRYPTO_SETTINGS.version) {
    throw new TypeError("Unsupported key envelope");
  }
  const iv = fromBase64Url(envelope.iv);
  const ciphertext = fromBase64Url(envelope.ciphertext);
  if (iv.length !== CRYPTO_SETTINGS.ivBytes || ciphertext.length !== 48) {
    throw new TypeError("Invalid key envelope");
  }
  return { iv, ciphertext };
}

async function wrapMasterKey(masterKey, wrappingKey, ownerId, purpose) {
  if (!masterKey.extractable) throw new TypeError("Master Key must be extractable to create a wrapped copy");
  const iv = randomBytes(CRYPTO_SETTINGS.ivBytes);
  const ciphertext = await subtle.wrapKey("raw", masterKey, wrappingKey, {
    name: "AES-GCM",
    iv,
    additionalData: wrapAad(ownerId, purpose),
    tagLength: 128,
  });
  return {
    algorithm: CRYPTO_SETTINGS.algorithm,
    version: CRYPTO_SETTINGS.version,
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(new Uint8Array(ciphertext)),
  };
}

async function unwrapMasterKey(envelope, wrappingKey, ownerId, purpose, extractable = false) {
  const { iv, ciphertext } = checkWrappedKey(envelope);
  return subtle.unwrapKey(
    "raw",
    ciphertext,
    wrappingKey,
    { name: "AES-GCM", iv, additionalData: wrapAad(ownerId, purpose), tagLength: 128 },
    { name: "AES-GCM" },
    extractable,
    ["encrypt", "decrypt"],
  );
}

// Setup creates an extractable key briefly so it can be wrapped, then the app
// switches to a non-extractable in-memory copy for normal journal use.
export function createMasterKey() {
  return subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function createWorkingMasterKey(setupKey) {
  const rawKey = new Uint8Array(await subtle.exportKey("raw", setupKey));
  try {
    return await subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);
  } finally {
    rawKey.fill(0);
  }
}

async function derivePassphraseKey(passphrase, salt) {
  if (typeof passphrase !== "string" || passphrase.length === 0) {
    throw new TypeError("Passphrase is required");
  }
  if (salt.length !== CRYPTO_SETTINGS.saltBytes) throw new TypeError("Invalid passphrase salt");

  const password = utf8Encode(passphrase.normalize("NFC"));
  let rawKey;
  try {
    rawKey = await argon2id({
      password,
      salt,
      iterations: CRYPTO_SETTINGS.passes,
      parallelism: CRYPTO_SETTINGS.lanes,
      memorySize: CRYPTO_SETTINGS.memoryKiB,
      hashLength: 32,
      outputType: "binary",
    });
    return await subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
  } finally {
    password.fill(0);
    rawKey?.fill(0);
  }
}

export function createRecoveryKey() {
  return toBase64Url(randomBytes(CRYPTO_SETTINGS.recoveryKeyBytes));
}

export async function createPassphraseWrap(masterKey, passphrase, ownerId) {
  const salt = randomBytes(CRYPTO_SETTINGS.saltBytes);
  const wrappingKey = await derivePassphraseKey(passphrase, salt);
  return {
    kdfProfile: CRYPTO_SETTINGS.kdfProfile,
    salt: toBase64Url(salt),
    masterKey: await wrapMasterKey(masterKey, wrappingKey, ownerId, "passphrase-wrap"),
  };
}

export async function unlockWithPassphrase(passphrase, ownerId, metadata, extractable = false) {
  if (metadata?.kdfProfile !== CRYPTO_SETTINGS.kdfProfile) throw new TypeError("Unsupported passphrase KDF");
  const salt = fromBase64Url(metadata.salt);
  const wrappingKey = await derivePassphraseKey(passphrase, salt);
  return unwrapMasterKey(metadata.masterKey, wrappingKey, ownerId, "passphrase-wrap", extractable);
}

export async function createRecoveryWrap(masterKey, recoveryKey, ownerId) {
  const rawKey = fromBase64Url(recoveryKey);
  if (rawKey.length !== CRYPTO_SETTINGS.recoveryKeyBytes) throw new TypeError("Invalid Recovery Key");
  try {
    const wrappingKey = await subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    return wrapMasterKey(masterKey, wrappingKey, ownerId, "recovery-wrap");
  } finally {
    rawKey.fill(0);
  }
}

export async function unlockWithRecoveryKey(recoveryKey, ownerId, envelope, extractable = false) {
  const rawKey = fromBase64Url(recoveryKey);
  if (rawKey.length !== CRYPTO_SETTINGS.recoveryKeyBytes) throw new TypeError("Invalid Recovery Key");
  try {
    const wrappingKey = await subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    return await unwrapMasterKey(envelope, wrappingKey, ownerId, "recovery-wrap", extractable);
  } finally {
    rawKey.fill(0);
  }
}

export async function encryptEntry(masterKey, payload, context) {
  checkEntryContext(context);
  const iv = randomBytes(CRYPTO_SETTINGS.ivBytes);
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: entryAad(context), tagLength: 128 },
    masterKey,
    utf8Encode(JSON.stringify(payload)),
  );
  return {
    algorithm: CRYPTO_SETTINGS.algorithm,
    version: CRYPTO_SETTINGS.version,
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(new Uint8Array(ciphertext)),
  };
}

export async function decryptEntry(masterKey, envelope, context) {
  checkEntryContext(context);
  if (envelope?.algorithm !== CRYPTO_SETTINGS.algorithm || envelope.version !== CRYPTO_SETTINGS.version) {
    throw new TypeError("Unsupported entry envelope");
  }
  const iv = fromBase64Url(envelope.iv);
  if (iv.length !== CRYPTO_SETTINGS.ivBytes) throw new TypeError("Invalid entry IV");
  const plaintext = await subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: entryAad(context), tagLength: 128 },
    masterKey,
    fromBase64Url(envelope.ciphertext),
  );
  return JSON.parse(utf8Decode(plaintext));
}
