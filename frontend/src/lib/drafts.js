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
