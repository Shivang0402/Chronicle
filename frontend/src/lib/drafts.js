import { decryptEntry, encryptEntry } from "./entryCrypto.js";
import { getEncryptionKey } from "./cryptoSession.js";

const DRAFT_PREFIX = "chronicle.drafts.v1";

export const getDraftOwner = (user) =>
  user?._id || user?.id || user?.email || "session";

const draftKey = (owner, entryId) =>
  `${DRAFT_PREFIX}.${encodeURIComponent(owner)}.${entryId || "new"}`;

const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag || "").trim().replace(/^#/, ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);
  }

  return [];
};

const normalizeDraft = (value) => ({
  title: typeof value?.title === "string" ? value.title : "",
  content: typeof value?.content === "string" ? value.content : "",
  mood: typeof value?.mood === "string" ? value.mood : "",
  tags: normalizeTags(value?.tags),
});

export const hasDraftContent = (value) => {
  const draft = normalizeDraft(value);

  return Boolean(
    draft.title.trim() ||
      draft.content.trim() ||
      draft.mood.trim() ||
      draft.tags.length,
  );
};

const draftContext = (accountId, entryId, updatedAt) => ({
  ownerId: accountId,
  entryId: `draft:${entryId || "new"}`,
  date: updatedAt,
});

async function decodeStoredDraft(owner, accountId, entryId, parsed) {
  if (parsed?.encrypted === true) {
    const masterKey = getEncryptionKey(accountId);
    if (!masterKey || !parsed.encryptedPayload) return null;
    const updatedAt = typeof parsed.updatedAt === "string"
      ? parsed.updatedAt
      : new Date().toISOString();
    const payload = await decryptEntry(
      masterKey,
      parsed.encryptedPayload,
      draftContext(accountId, entryId, updatedAt),
    );
    const draft = normalizeDraft(payload);
    return hasDraftContent(draft) ? { ...draft, updatedAt } : null;
  }

  // Keep legacy, non-E2EE browser drafts usable. Once saved while unlocked,
  // writeDraft upgrades them to encrypted storage.
  const draft = normalizeDraft(parsed);
  if (!hasDraftContent(draft)) return null;
  return {
    ...draft,
    updatedAt: typeof parsed?.updatedAt === "string"
      ? parsed.updatedAt
      : new Date().toISOString(),
  };
}

export async function readDraft(owner, entryId, accountId = "") {
  try {
    const raw = window.localStorage.getItem(draftKey(owner, entryId));
    if (!raw) return null;
    return await decodeStoredDraft(owner, accountId, entryId, JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeDraft(owner, entryId, value, accountId = "") {
  const draft = normalizeDraft(value);

  if (!hasDraftContent(draft)) {
    clearDraft(owner, entryId);
    return null;
  }

  const updatedAt = new Date().toISOString();
  const masterKey = getEncryptionKey(accountId);
  let stored;

  try {
    if (masterKey) {
      const encryptedPayload = await encryptEntry(
        masterKey,
        draft,
        draftContext(accountId, entryId, updatedAt),
      );
      stored = { encrypted: true, encryptedPayload, updatedAt };
    } else {
      stored = { ...draft, updatedAt };
    }
    window.localStorage.setItem(draftKey(owner, entryId), JSON.stringify(stored));
    return { ...draft, updatedAt };
  } catch {
    return null;
  }
}

export function clearDraft(owner, entryId) {
  try {
    window.localStorage.removeItem(draftKey(owner, entryId));
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export function clearDrafts(owner) {
  if (typeof window === "undefined") return;

  const prefix = `${DRAFT_PREFIX}.${encodeURIComponent(owner)}.`;

  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export async function listDrafts(owner, accountId = "") {
  if (typeof window === "undefined") return [];

  const prefix = `${DRAFT_PREFIX}.${encodeURIComponent(owner)}.`;
  const results = [];

  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(prefix)) keys.push(key);
    }

    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const suffix = key.slice(prefix.length);
      const entryId = suffix === "new" ? null : suffix;
      const draft = await decodeStoredDraft(owner, accountId, entryId, parsed);
      if (!draft) continue;

      results.push({
        ...draft,
        entryId,
        key,
        isNew: entryId === null,
      });

      // Upgrade old plaintext records on the next unlocked read.
      if (parsed?.encrypted !== true && getEncryptionKey(accountId)) {
        await writeDraft(owner, entryId, draft, accountId);
      }
    }
  } catch {
    return [];
  }

  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return results;
}
