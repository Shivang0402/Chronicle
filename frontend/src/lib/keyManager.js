import { argon2id } from "hash-wasm";
import { CRYPTO_SETTINGS, fromBase64Url, getSubtleCrypto, randomBytes, toBase64Url, utf8Encode } from "./crypto.utils.js";

const subtle = () => getSubtleCrypto();

// Persist every Argon2id input needed to derive the same key on another device.
// Only this profile is accepted so untrusted metadata cannot request arbitrary work.
const KDF_PROFILE = Object.freeze({
  algorithm: "Argon2id",
  algorithmVersion: "1.3",
  memoryKiB: 64 * 1024,
  passes: 3,
  parallelism: 1,
  outputBytes: 32,
});

const SALT_BYTES = 16;
const RECOVERY_KEY_BYTES = 32;

function keyWrapAad(ownerId, purpose) {
  return utf8Encode(JSON.stringify(["chronicle-master-key", CRYPTO_SETTINGS.version, ownerId, purpose]));
}

function readKdfMetadata(metadata) {
  const kdf = metadata?.kdf;
  if (
    metadata?.metadataVersion !== 1 ||
    kdf?.algorithm !== KDF_PROFILE.algorithm ||
    kdf?.algorithmVersion !== KDF_PROFILE.algorithmVersion ||
    kdf?.memoryKiB !== KDF_PROFILE.memoryKiB ||
    kdf?.passes !== KDF_PROFILE.passes ||
    kdf?.parallelism !== KDF_PROFILE.parallelism ||
    kdf?.outputBytes !== KDF_PROFILE.outputBytes
  ) {
    throw new Error("Unsupported passphrase KDF metadata");
  }
  const salt = fromBase64Url(kdf.salt);
  if (salt.length !== SALT_BYTES || kdf.salt.length !== 22) throw new TypeError("Invalid passphrase salt");
  return { kdf, salt };
}

async function derivePassphraseKey(passphrase, salt, kdf = KDF_PROFILE) {
  if (typeof passphrase !== "string" || passphrase.length === 0) throw new TypeError("Passphrase is required");

  const password = utf8Encode(passphrase.normalize("NFC"));
  if (password.length > CRYPTO_SETTINGS.maxPassphraseBytes) {
    password.fill(0);
    throw new RangeError("Passphrase exceeds the supported size limit");
  }
  let rawKey;
  try {
    if (typeof WebAssembly !== "object" || typeof argon2id !== "function") {
      throw new Error("Argon2id is unavailable in this browser");
    }
    try {
      rawKey = await argon2id({
        password,
        salt,
        iterations: kdf.passes,
        parallelism: kdf.parallelism,
        memorySize: kdf.memoryKiB,
        hashLength: kdf.outputBytes,
        outputType: "binary",
      });
    } catch (cause) {
      throw new Error("Argon2id key derivation is unavailable or failed in this browser", { cause });
    }
    return await subtle().importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
  } finally {
    password.fill(0);
    rawKey?.fill(0);
  }
}

async function wrapMasterKey(masterKey, wrappingKey, ownerId, purpose) {
  if (!masterKey.extractable) throw new TypeError("Master Key must be extractable to create a wrapped copy");
  const iv = randomBytes(CRYPTO_SETTINGS.ivBytes);
  const ciphertext = await subtle().wrapKey("raw", masterKey, wrappingKey, {
    name: "AES-GCM",
    iv,
    additionalData: keyWrapAad(ownerId, purpose),
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
  if (envelope?.algorithm !== CRYPTO_SETTINGS.algorithm || envelope.version !== CRYPTO_SETTINGS.version) {
    throw new TypeError("Unsupported key envelope");
  }
  if (typeof envelope.iv !== "string" || envelope.iv.length !== 16 || typeof envelope.ciphertext !== "string" || envelope.ciphertext.length !== 64) {
    throw new TypeError("Invalid key envelope");
  }
  const iv = fromBase64Url(envelope.iv);
  const ciphertext = fromBase64Url(envelope.ciphertext);
  if (iv.length !== CRYPTO_SETTINGS.ivBytes || ciphertext.length !== CRYPTO_SETTINGS.masterKeyBytes + 16) {
    throw new TypeError("Invalid key envelope");
  }

  try {
    return await subtle().unwrapKey(
      "raw",
      ciphertext,
      wrappingKey,
      { name: "AES-GCM", iv, additionalData: keyWrapAad(ownerId, purpose), tagLength: 128 },
      { name: "AES-GCM" },
      extractable,
      ["encrypt", "decrypt"],
    );
  } catch {
    throw new Error("Unable to unlock Master Key");
  }
}

async function verifySameMasterKey(firstKey, secondKey) {
  const challenge = randomBytes(32);
  const iv = randomBytes(CRYPTO_SETTINGS.ivBytes);
  let decrypted;
  try {
    const encrypted = await subtle().encrypt({ name: "AES-GCM", iv }, firstKey, challenge);
    decrypted = new Uint8Array(await subtle().decrypt({ name: "AES-GCM", iv }, secondKey, encrypted));
    return challenge.every((byte, index) => byte === decrypted[index]);
  } finally {
    challenge.fill(0);
    decrypted?.fill(0);
  }
}

export function createMasterKey() {
  return subtle().generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function createWorkingMasterKey(setupKey) {
  const rawKey = new Uint8Array(await subtle().exportKey("raw", setupKey));
  try {
    return await subtle().importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);
  } finally {
    rawKey.fill(0);
  }
}

export function createRecoveryKey() {
  return toBase64Url(randomBytes(RECOVERY_KEY_BYTES));
}

export async function createPassphraseWrap(masterKey, passphrase, ownerId) {
  const salt = randomBytes(SALT_BYTES);
  const wrappingKey = await derivePassphraseKey(passphrase, salt);
  const wrappedKey = await wrapMasterKey(masterKey, wrappingKey, ownerId, "passphrase-wrap");
  return {
    metadataVersion: 1,
    kdf: { ...KDF_PROFILE, salt: toBase64Url(salt) },
    masterKey: wrappedKey,
  };
}

export async function unlockWithPassphrase(passphrase, ownerId, metadata, { extractable = false } = {}) {
  const { kdf, salt } = readKdfMetadata(metadata);
  const wrappingKey = await derivePassphraseKey(passphrase, salt, kdf);
  return unwrapMasterKey(metadata.masterKey, wrappingKey, ownerId, "passphrase-wrap", extractable);
}

export async function createRecoveryWrap(masterKey, recoveryKey, ownerId) {
  if (typeof recoveryKey !== "string" || recoveryKey.length !== 43) throw new TypeError("Invalid Recovery Key");
  const rawKey = fromBase64Url(recoveryKey);
  try {
    if (rawKey.length !== RECOVERY_KEY_BYTES) throw new TypeError("Invalid Recovery Key");
    const wrappingKey = await subtle().importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    return await wrapMasterKey(masterKey, wrappingKey, ownerId, "recovery-wrap");
  } finally {
    rawKey.fill(0);
  }
}

export async function unlockWithRecoveryKey(recoveryKey, ownerId, envelope, { extractable = false } = {}) {
  if (typeof recoveryKey !== "string" || recoveryKey.length !== 43) throw new TypeError("Invalid Recovery Key");
  const rawKey = fromBase64Url(recoveryKey);
  try {
    if (rawKey.length !== RECOVERY_KEY_BYTES) throw new TypeError("Invalid Recovery Key");
    const wrappingKey = await subtle().importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    return await unwrapMasterKey(envelope, wrappingKey, ownerId, "recovery-wrap", extractable);
  } finally {
    rawKey.fill(0);
  }
}

/** Rewrap the same Master Key; the recovery wrap remains unchanged. */
export async function changePassphrase(oldPassphrase, newPassphrase, ownerId, keyMetadata) {
  if (!keyMetadata?.recoveryWrap) throw new TypeError("Recovery Key wrap is required");

  const oldMasterKey = await unlockWithPassphrase(oldPassphrase, ownerId, keyMetadata.passphraseWrap, { extractable: true });
  const passphraseWrap = await createPassphraseWrap(oldMasterKey, newPassphrase, ownerId);
  const newMasterKey = await unlockWithPassphrase(newPassphrase, ownerId, passphraseWrap, { extractable: true });
  if (!(await verifySameMasterKey(oldMasterKey, newMasterKey))) {
    throw new Error("New passphrase wrap did not verify");
  }

  return { ...keyMetadata, passphraseWrap };
}
