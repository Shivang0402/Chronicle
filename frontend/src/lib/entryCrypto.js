import { CRYPTO_SETTINGS, fromBase64Url, randomBytes, toBase64Url, utf8Decode, utf8Encode } from "./crypto.utils.js";

const subtle = crypto.subtle;

function entryAad({ ownerId, entryId, date }) {
  return utf8Encode(JSON.stringify(["chronicle-entry", CRYPTO_SETTINGS.version, ownerId, entryId, date]));
}

function checkEntryContext(context) {
  if (
    typeof context?.ownerId !== "string" ||
    typeof context?.entryId !== "string" ||
    typeof context?.date !== "string" ||
    !context.ownerId ||
    !context.entryId ||
    !context.date
  ) {
    throw new TypeError("Entry owner, ID, and date are required");
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

  try {
    const plaintext = await subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: entryAad(context), tagLength: 128 },
      masterKey,
      fromBase64Url(envelope.ciphertext),
    );
    return JSON.parse(utf8Decode(plaintext));
  } catch {
    throw new Error("Entry could not be decrypted");
  }
}
