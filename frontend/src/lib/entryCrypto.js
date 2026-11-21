import { CRYPTO_SETTINGS, canonicalPayloadBytes, fromBase64Url, getSubtleCrypto, randomBytes, toBase64Url, utf8Decode } from "./crypto.utils.js";

const subtle = () => getSubtleCrypto();

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
    !context.date ||
    context.ownerId.length > 128 ||
    context.entryId.length > 128 ||
    context.date.length > 64
  ) {
    throw new TypeError("Entry owner, ID, and date are required");
  }
}

export async function encryptEntry(masterKey, payload, context) {
  checkEntryContext(context);
  const iv = randomBytes(CRYPTO_SETTINGS.ivBytes);
  const ciphertext = await subtle().encrypt(
    { name: "AES-GCM", iv, additionalData: entryAad(context), tagLength: 128 },
    masterKey,
    canonicalPayloadBytes(payload),
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
  const maxEncodedCiphertextLength = Math.ceil(CRYPTO_SETTINGS.maxEntryCiphertextBytes * 4 / 3);
  if (typeof envelope.iv !== "string" || envelope.iv.length !== 16 || typeof envelope.ciphertext !== "string" || envelope.ciphertext.length < 24 || envelope.ciphertext.length > maxEncodedCiphertextLength) {
    throw new TypeError("Invalid entry envelope");
  }

  const iv = fromBase64Url(envelope.iv);
  if (iv.length !== CRYPTO_SETTINGS.ivBytes) throw new TypeError("Invalid entry IV");

  try {
    const ciphertext = fromBase64Url(envelope.ciphertext);
    if (ciphertext.length > CRYPTO_SETTINGS.maxEntryCiphertextBytes) throw new TypeError("Entry ciphertext is too large");
    const plaintext = await subtle().decrypt(
      { name: "AES-GCM", iv, additionalData: entryAad(context), tagLength: 128 },
      masterKey,
      ciphertext,
    );
    const payload = JSON.parse(utf8Decode(plaintext));
    canonicalPayloadBytes(payload);
    return payload;
  } catch {
    throw new Error("Entry could not be decrypted");
  }
}
