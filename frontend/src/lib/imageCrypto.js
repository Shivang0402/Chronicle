import {
  fromBase64Url,
  getSubtleCrypto,
  randomBytes,
  toBase64Url,
  utf8Encode,
} from "./crypto.utils.js";
import { API_BASE } from "./api.js";

const VERSION = 1;
const IV_BYTES = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const subtle = () => getSubtleCrypto();
const imageAad = (purpose, ownerId) =>
  utf8Encode(JSON.stringify(["chronicle-image", VERSION, ownerId, purpose]));

export async function encryptImageFile(file, masterKey, ownerId) {
  if (!(file instanceof Blob) || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new TypeError("Image must be between 1 byte and 5 MB");
  }
  if (!file.type.startsWith("image/"))
    throw new TypeError("Only image files are supported");

  const rawDataKey = randomBytes(32);
  const imageKey = await subtle().importKey(
    "raw",
    rawDataKey,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
  const imageIv = randomBytes(IV_BYTES);
  const wrapIv = randomBytes(IV_BYTES);
  const plaintext = new Uint8Array(await file.arrayBuffer());

  try {
    const [ciphertext, wrappedKey] = await Promise.all([
      subtle().encrypt(
        {
          name: "AES-GCM",
          iv: imageIv,
          additionalData: imageAad("file", ownerId),
          tagLength: 128,
        },
        imageKey,
        plaintext,
      ),
      subtle().encrypt(
        {
          name: "AES-GCM",
          iv: wrapIv,
          additionalData: imageAad("key", ownerId),
          tagLength: 128,
        },
        masterKey,
        rawDataKey,
      ),
    ]);
    return {
      ciphertext: new Blob([ciphertext], { type: "application/octet-stream" }),
      imageIv: toBase64Url(imageIv),
      wrappedKey: toBase64Url(new Uint8Array(wrappedKey)),
      wrapIv: toBase64Url(wrapIv),
      mimeType: file.type,
    };
  } finally {
    rawDataKey.fill(0);
    plaintext.fill(0);
  }
}

export function createEncryptedImageReference({
  assetId,
  imageIv,
  wrappedKey,
  wrapIv,
  mimeType,
}) {
  const value = { v: VERSION, assetId, imageIv, wrappedKey, wrapIv, mimeType };
  return `chronicle-e2ee:${toBase64Url(utf8Encode(JSON.stringify(value)))}`;
}

export function parseEncryptedImageReference(reference) {
  if (typeof reference !== "string" || !reference.startsWith("chronicle-e2ee:"))
    return null;
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      fromBase64Url(reference.slice("chronicle-e2ee:".length)),
    );
    const value = JSON.parse(decoded);
    if (
      value?.v !== VERSION ||
      typeof value.assetId !== "string" ||
      !/^[a-f0-9]{36}$/.test(value.assetId) ||
      typeof value.mimeType !== "string" ||
      !value.mimeType.startsWith("image/") ||
      typeof value.imageIv !== "string" ||
      typeof value.wrapIv !== "string" ||
      typeof value.wrappedKey !== "string"
    )
      return null;
    if (
      fromBase64Url(value.imageIv).length !== IV_BYTES ||
      fromBase64Url(value.wrapIv).length !== IV_BYTES ||
      fromBase64Url(value.wrappedKey).length !== 48
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function getEncryptedImageAssetIds(content) {
  const references =
    String(content || "").match(/chronicle-e2ee:[A-Za-z0-9_-]+/g) || [];
  return [
    ...new Set(
      references
        .map(parseEncryptedImageReference)
        .filter(Boolean)
        .map((value) => value.assetId),
    ),
  ];
}

export async function decryptImageReference(
  reference,
  masterKey,
  ownerId,
  token,
) {
  const value = parseEncryptedImageReference(reference);
  if (!value || !masterKey || !ownerId)
    throw new Error("Invalid encrypted image reference");
  const [imageIv, wrapIv, wrappedKey] = [
    value.imageIv,
    value.wrapIv,
    value.wrappedKey,
  ].map(fromBase64Url);
  const rawDataKey = new Uint8Array(
    await subtle().decrypt(
      {
        name: "AES-GCM",
        iv: wrapIv,
        additionalData: imageAad("key", ownerId),
        tagLength: 128,
      },
      masterKey,
      wrappedKey,
    ),
  );
  try {
    const imageKey = await subtle().importKey(
      "raw",
      rawDataKey,
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const response = await fetch(
      `${API_BASE}/api/upload/encrypted/${value.assetId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!response.ok) throw new Error("Encrypted image could not be loaded");
    const ciphertext = await response.arrayBuffer();
    if (
      ciphertext.byteLength < 17 ||
      ciphertext.byteLength > MAX_IMAGE_BYTES + 16
    )
      throw new Error("Invalid encrypted image size");
    const plaintext = await subtle().decrypt(
      {
        name: "AES-GCM",
        iv: imageIv,
        additionalData: imageAad("file", ownerId),
        tagLength: 128,
      },
      imageKey,
      ciphertext,
    );
    return URL.createObjectURL(new Blob([plaintext], { type: value.mimeType }));
  } finally {
    rawDataKey.fill(0);
  }
}
