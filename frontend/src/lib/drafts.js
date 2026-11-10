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

export function readDraft(owner, entryId) {
  try {
    const raw = window.localStorage.getItem(draftKey(owner, entryId));

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const draft = normalizeDraft(parsed);

    if (!hasDraftContent(draft)) return null;

    return {
      ...draft,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeDraft(owner, entryId, value) {
  const draft = normalizeDraft(value);

  if (!hasDraftContent(draft)) {
    clearDraft(owner, entryId);
    return null;
  }

  const stored = { ...draft, updatedAt: new Date().toISOString() };

  try {
    window.localStorage.setItem(draftKey(owner, entryId), JSON.stringify(stored));
    return stored;
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

      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function listDrafts(owner) {
  if (typeof window === "undefined") return [];

  const prefix = `${DRAFT_PREFIX}.${encodeURIComponent(owner)}.`;
  const results = [];

  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);

      if (!key || !key.startsWith(prefix)) continue;

      const raw = window.localStorage.getItem(key);

      if (!raw) continue;

      const parsed = safeParse(raw);
      const draft = normalizeDraft(parsed);

      if (!hasDraftContent(draft)) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Ignore cleanup failures.
        }
        continue;
      }

      const entryIdSuffix = key.slice(prefix.length);
      const entryId = entryIdSuffix === "new" ? null : entryIdSuffix;
      const updatedAt =
        typeof parsed?.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString();

      results.push({
        ...draft,
        entryId,
        key,
        updatedAt,
        isNew: entryId === null,
      });
    }
  } catch {
    return [];
  }

  results.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });

  return results;
}
