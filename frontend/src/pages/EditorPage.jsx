import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Feather,
  Hash,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LeaveDraftDialog from "../components/dashboard/LeaveDraftDialog";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PageTransition from "../components/ui/PageTransition";
import Reveal from "../components/ui/Reveal";
import RichTextEditor from "../components/ui/RichTextEditor";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import {
  clearDraft,
  getDraftOwner,
  readDraft,
  writeDraft,
} from "../lib/drafts";
import {
  countWords,
  formatLongDate,
  formatTime,
  readingTime,
} from "../lib/journal";
import { MOODS } from "../lib/moods";

const MOOD_EMOJI = {
  Peaceful: "🌿",
  Grateful: "✨",
  Inspired: "💡",
  Contemplative: "🍂",
  Reflective: "🪞",
  Hopeful: "🌅",
};

export default function EditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const draftOwner = getDraftOwner(user);
  const prompt = isEditing ? "" : location.state?.prompt || "";

  const [initialDraft] = useState(() =>
    !isEditing && token ? readDraft(draftOwner, null) : null,
  );

  const [entry, setEntry] = useState(null);
  const [title, setTitle] = useState(initialDraft?.title || "");
  const [content, setContent] = useState(
    initialDraft?.content || (prompt ? `${prompt}\n\n` : ""),
  );
  const [mood, setMood] = useState(initialDraft?.mood || "");
  const [tags, setTags] = useState(initialDraft?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [customMoodInput, setCustomMoodInput] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(Boolean(initialDraft));
  const [savedAt, setSavedAt] = useState(null);
  const [draftRestoredAt, setDraftRestoredAt] = useState(() =>
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [draftSavedAt, setDraftSavedAt] = useState(() =>
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [focusMode, setFocusMode] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [openedAt] = useState(() => new Date());

  const draftSnapshotRef = useRef(null);
  const dirtyRef = useRef(Boolean(initialDraft));

  useDocumentTitle(
    isEditing ? entry?.title || "Edit Entry" : "New Entry",
  );

  useEffect(() => {
    if (!token || !isEditing) return undefined;

    let active = true;

    chronicleApi
      .getEntry(id, token)
      .then((data) => {
        if (!active) return;

        const next = data?.chronicle;

        if (!next) {
          throw new Error("This entry could not be found.");
        }

        const baseTitle = next.title || "";
        const baseContent = next.content || "";
        const baseMood = next.mood || "";
        const baseTags = Array.isArray(next.tags) ? next.tags : [];
        const draft = readDraft(draftOwner, id);
        const hasRestorableDraft =
          draft &&
          (draft.title !== baseTitle ||
            draft.content !== baseContent ||
            draft.mood !== baseMood ||
            JSON.stringify(draft.tags) !== JSON.stringify(baseTags));

        setEntry(next);
        setSavedAt(null);
        setLoading(false);

        if (hasRestorableDraft) {
          setTitle(draft.title);
          setContent(draft.content);
          setMood(draft.mood);
          setTags(draft.tags);
          setDraftRestoredAt(new Date(draft.updatedAt));
          setDraftSavedAt(new Date(draft.updatedAt));
        } else {
          setTitle(baseTitle);
          setContent(baseContent);
          setMood(baseMood);
          setTags(baseTags);
          setDraftRestoredAt(null);
          setDraftSavedAt(null);

          if (draft) clearDraft(draftOwner, id);
        }

        dirtyRef.current = Boolean(hasRestorableDraft);
        setDirty(Boolean(hasRestorableDraft));
      })
      .catch((loadFailure) => {
        if (!active) return;
        setLoadError(
          loadFailure?.message || "Could not open this entry.",
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [draftOwner, id, isEditing, token, loadKey]);

  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event) => {
      if (draftSnapshotRef.current) {
        writeDraft(draftOwner, id || null, draftSnapshotRef.current);
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, draftOwner, id]);

  useEffect(() => {
    draftSnapshotRef.current = { title, content, mood, tags };
  }, [content, mood, tags, title]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(
    () => () => {
      if (!dirtyRef.current || !draftSnapshotRef.current) return;

      writeDraft(draftOwner, id || null, draftSnapshotRef.current);
    },
    [draftOwner, id],
  );

  useEffect(() => {
    if (!token || !dirty) return undefined;

    const timeout = window.setTimeout(() => {
      if (!dirtyRef.current) return;

      const stored = writeDraft(draftOwner, id || null, {
        title,
        content,
        mood,
        tags,
      });

      setDraftSavedAt(stored ? new Date(stored.updatedAt) : null);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [content, dirty, draftOwner, id, mood, tags, title, token]);

  const words = countWords(content);
  const reading = readingTime(words);
  const canSave = content.trim().length >= 10 && !saving && !loading;
  const dateLabel =
    isEditing && entry ? formatLongDate(entry.date) : formatLongDate(openedAt);
  const timeLabel =
    isEditing && entry?.date ? formatTime(entry.date) : formatTime(openedAt);
  const moodOptions =
    mood && !MOODS.includes(mood) ? [mood, ...MOODS] : MOODS;

  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
    setSavedAt(null);
  };

  const handleImageUpload = useCallback(
    async (file) => {
      if (!token) return null;

      try {
        const data = await chronicleApi.uploadImage(file, token);
        return data?.url || null;
      } catch (uploadError) {
        setError(uploadError?.message || "Could not upload this image.");
        return null;
      }
    },
    [token],
  );

  const handleDiscardDraft = () => {
    setDiscardDialogOpen(true);
  };

  const confirmDiscardDraft = () => {
    clearDraft(draftOwner, id || null);
    dirtyRef.current = false;
    setDirty(false);
    setDraftRestoredAt(null);
    setDraftSavedAt(null);
    setSavedAt(null);
    setError("");
    setTagInput("");
    setCustomMoodInput("");
    setDiscardDialogOpen(false);

    if (isEditing && entry) {
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setMood(entry.mood || "");
      setTags(Array.isArray(entry.tags) ? entry.tags : []);
    } else {
      setTitle("");
      setContent("");
      setMood("");
      setTags([]);
    }
  };

  const addTag = (raw) => {
    const next = [
      ...new Set(
        raw
          .split(",")
          .map((tag) => tag.trim().replace(/^#/, ""))
          .filter(Boolean),
      ),
    ];

    if (next.length === 0) return;

    setTags((current) => [
      ...current,
      ...next.filter((tag) => !current.includes(tag)),
    ]);
    setTagInput("");
    markDirty();
  };

  const removeTag = (tag) => {
    setTags((current) => current.filter((item) => item !== tag));
    markDirty();
  };

  const addCustomMood = (raw) => {
    const next = raw.trim();

    if (!next) return;

    setMood(next);
    setCustomMoodInput("");
    markDirty();
  };

  const handleCustomMoodKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addCustomMood(customMoodInput);
    }
  };

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
      return;
    }

    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const closeLeaveDialog = useCallback(() => {
    setLeaveDialogOpen(false);
  }, []);

  const handleBack = () => {
    if (dirty) {
      setLeaveDialogOpen(true);
      return;
    }

    navigate("/journal");
  };

  const handleSaveDraftAndLeave = () => {
    writeDraft(
      draftOwner,
      id || null,
      draftSnapshotRef.current || { title, content, mood, tags },
    );
    dirtyRef.current = false;
    setDirty(false);
    setLeaveDialogOpen(false);
    navigate("/journal", {
      state: { notice: "Draft saved. Continue whenever you're ready." },
    });
  };

  const handleAbandonWriting = () => {
    clearDraft(draftOwner, id || null);
    dirtyRef.current = false;
    setDirty(false);
    setDraftRestoredAt(null);
    setDraftSavedAt(null);
    setSavedAt(null);
    setLeaveDialogOpen(false);
    navigate("/journal", {
      state: {
        notice: isEditing
          ? "Changes discarded. No draft was saved."
          : "Writing abandoned. No draft was saved.",
      },
    });
  };

  const handleSave = useCallback(async () => {
    if (!token || saving) return;

    const trimmed = content.trim();

    if (trimmed.length < 10) {
      setError("Write at least 10 characters before saving.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = isEditing
      ? {
          title: title.trim(),
          content: trimmed,
          mood: mood.trim(),
          tags,
        }
      : {
          title: title.trim() || undefined,
          content: trimmed,
          mood: mood.trim() || undefined,
          tags,
        };

    try {
      if (isEditing) {
        const data = await chronicleApi.updateEntry(id, payload, token);
        setEntry(data?.chronicle || entry);
        clearDraft(draftOwner, id);
        dirtyRef.current = false;
        setDirty(false);
        setSavedAt(new Date());
        setDraftRestoredAt(null);
        setDraftSavedAt(null);
      } else {
        await chronicleApi.createEntry(payload, token);
        clearDraft(draftOwner, null);
        dirtyRef.current = false;
        setDirty(false);
        setDraftRestoredAt(null);
        setDraftSavedAt(null);
        navigate("/journal", {
          state: { notice: "Entry preserved in your archive." },
        });
      }
    } catch (saveFailure) {
      setError(saveFailure?.message || "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  }, [
    content,
    draftOwner,
    entry,
    id,
    isEditing,
    mood,
    navigate,
    saving,
    tags,
    title,
    token,
  ]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleSave]);

  const statusLabel = saving
    ? "Saving..."
    : error
      ? "Save failed"
      : dirty
        ? draftSavedAt
          ? `Draft saved at ${formatTime(draftSavedAt)}`
          : "Unsaved changes"
        : savedAt
          ? `Saved at ${formatTime(savedAt)}`
          : isEditing
            ? "All changes saved"
            : "Ready when you are";
  const statusTone = error
    ? "bg-danger"
    : saving || dirty
      ? "bg-sage"
      : "bg-sage-deep";

  if (loading) {
    return (
      <PageTransition variant="fade">
        <div className="grid min-h-screen place-items-center bg-ivory px-6">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-sage" />
            <p className="mt-3 text-[12px] text-charcoal-muted">
              Opening your page...
            </p>
            <button
              type="button"
              onClick={() => navigate("/journal")}
              className="mt-4 text-[11px] text-sage-deep underline decoration-sage-deep/40 underline-offset-4 transition-colors hover:text-charcoal"
            >
              Back to Journal
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (loadError) {
    return (
      <PageTransition variant="fade">
        <div className="grid min-h-screen place-items-center bg-ivory px-6">
          <div className="max-w-md text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h1 className="mt-5 font-serif text-2xl text-charcoal">
              This page could not be opened
            </h1>
            <p className="mt-2 text-[12px] leading-relaxed text-charcoal-muted">
              {loadError}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setLoadError("");
                  setLoadKey((value) => value + 1);
                }}
                className="btn-ghost border border-hairline !px-5 !py-2.5 text-[11px]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate("/journal")}
                className="btn-sage !px-5 !py-2.5 text-[10px]"
              >
                Back to Journal
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="fade">
      <div className="min-h-screen bg-ivory">
        <div className="pointer-events-none fixed inset-0 paper-texture opacity-40" />
        <div className="pointer-events-none fixed -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

        <header className="sticky top-0 z-40 border-b border-hairline/70 bg-ivory/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] text-charcoal-muted transition-colors hover:bg-warm-beige hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Journal</span>
            </button>

            <div
              className={`items-center gap-3 rounded-full border border-hairline bg-paper/80 px-3 py-1.5 text-[10px] text-charcoal-muted shadow-sm ${
                focusMode ? "hidden" : "hidden sm:flex"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${statusTone}`} />
                {statusLabel}
              </span>
              <span className="h-3 w-px bg-hairline" />
              <span>{words.toLocaleString("en-US")} words</span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle className="h-9 w-9" />
              <button
                type="button"
                onClick={() => setFocusMode((value) => !value)}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-2 text-[10px] text-charcoal-muted transition-colors hover:text-charcoal"
                aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
              >
                {focusMode ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden md:inline">
                  {focusMode ? "Exit focus" : "Focus"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="btn-sage !px-4 !py-2 text-[10px] sm:!px-5 sm:!py-2.5"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {saving ? "Saving..." : "Save"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main
          className={`relative mx-auto px-4 pb-16 pt-8 sm:px-6 ${
            focusMode ? "max-w-2xl" : "max-w-3xl"
          }`}
        >
          {!focusMode && (
            <Reveal
              as="section"
              variant="scale"
              y={18}
              blur={false}
              className="relative mb-5 overflow-hidden rounded-3xl border border-hairline bg-paper shadow-paper"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 scale-105 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/hero-journal.jpg')" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/50 to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-ivory/70 via-transparent to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 paper-texture opacity-25 mix-blend-soft-light"
              />
              <div className="relative flex min-h-[190px] flex-col justify-between gap-6 p-6 sm:min-h-[220px] sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span className="eyebrow rounded-full bg-paper/70 px-2.5 py-1 backdrop-blur-sm">
                    {isEditing ? "Returning to the page" : "A fresh page"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-hairline/70 bg-paper/80 px-2.5 py-1 text-[9px] uppercase tracking-wider text-charcoal-muted backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-sage" />
                    {timeLabel}
                  </span>
                </div>
                <div>
                  <h1 className="max-w-lg font-serif text-2xl leading-tight tracking-tight text-charcoal sm:text-[2rem]">
                    {isEditing ? "Edit your entry" : "Write what you notice"}
                  </h1>
                  <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-charcoal-muted">
                    A quiet place for what you noticed, felt, or want to remember.
                  </p>
                </div>
              </div>
            </Reveal>
          )}

          {!focusMode && (
            <Reveal
              as="section"
              variant="left"
              y={16}
              delay={0.05}
              blur={false}
              className="mb-4 rounded-2xl border border-hairline bg-paper/90 px-4 py-3 shadow-paper sm:px-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-charcoal-muted">
                  <CalendarDays className="h-3 w-3 text-sage" />
                  {dateLabel}
                  <span className="text-muted-gray/50">·</span>
                  <Clock className="h-3 w-3 text-sage" />
                  {timeLabel}
                </span>
                <span className="rounded-full bg-warm-beige px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-charcoal-muted">
                  {isEditing ? "Editing archive" : "New reflection"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline/60 pt-2">
                <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-gray">
                  Mood
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {moodOptions.map((item) => {
                    const active = mood === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setMood(active ? "" : item);
                          markDirty();
                        }}
                        aria-pressed={active}
                        title={MOOD_EMOJI[item] || undefined}
                        className={`rounded-full px-2.5 py-1 text-[9px] font-medium transition-all ${
                          active
                            ? "bg-sage-deep text-on-primary shadow-sm"
                            : "bg-warm-beige/80 text-charcoal-muted hover:bg-sage-light/60 hover:text-charcoal"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                  <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-hairline bg-paper px-2 py-0.5">
                    <input
                      type="text"
                      value={customMoodInput}
                      onChange={(event) =>
                        setCustomMoodInput(event.target.value)
                      }
                      onKeyDown={handleCustomMoodKeyDown}
                      placeholder="Custom mood"
                      maxLength={40}
                      className="w-20 border-0 bg-transparent text-[9px] text-charcoal outline-none placeholder:text-muted-gray/80"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomMood(customMoodInput)}
                      className="grid h-3.5 w-3.5 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                      aria-label="Add custom mood"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline/60 pt-2">
                <span className="inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-gray">
                  <Hash className="h-2.5 w-2.5 text-sage" />
                  Tags
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-1 rounded-full bg-warm-beige px-2 py-0.5 text-[9px] text-charcoal-muted transition-colors hover:text-charcoal"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-gray transition-colors group-hover:text-danger"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}

                  <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-hairline bg-paper px-2 py-0.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => addTag(tagInput)}
                      placeholder="Add tag"
                      className="w-16 border-0 bg-transparent text-[9px] text-charcoal outline-none placeholder:text-muted-gray/80"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="grid h-3.5 w-3.5 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                      aria-label="Add tag"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          <Reveal
            variant="up"
            y={20}
            delay={0.08}
            blur={false}
            className={`overflow-hidden rounded-2xl border bg-writing-folio ${
              focusMode
                ? "border-transparent shadow-none"
                : "border-hairline shadow-paper"
            }`}
          >
            {error && (
              <div className="border-b border-danger/20 bg-danger/5 px-6 py-3 text-[11px] text-danger sm:px-10">
                {error}
              </div>
            )}

            {draftRestoredAt && (
              <div className="flex flex-col gap-2 border-b border-sage/20 bg-sage-subtle/50 px-6 py-3 text-[11px] text-sage-deep sm:flex-row sm:items-center sm:justify-between sm:px-10">
                <span>
                  Draft restored from {formatTime(draftRestoredAt)}. Keep
                  writing or discard it.
                </span>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="self-start font-medium underline decoration-sage/40 underline-offset-4 transition-colors hover:text-charcoal sm:self-auto"
                >
                  Discard draft
                </button>
              </div>
            )}

            <div className="px-6 pb-0 pt-7 sm:px-10 sm:pt-9">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.18em] text-muted-gray">
                <span className="inline-flex items-center gap-1.5">
                  <Feather className="h-3 w-3 text-sage" />
                  Writing desk
                </span>
                <span>
                  {words.toLocaleString("en-US")} words · {reading} min read
                </span>
              </div>

              <div className="group relative">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    markDirty();
                  }}
                  placeholder="Untitled reflection..."
                  maxLength={120}
                  autoFocus={!isEditing}
                  className="w-full border-0 bg-transparent pb-3 font-serif text-2xl leading-tight tracking-tight text-charcoal outline-none placeholder:text-muted-gray/60 sm:text-[2.1rem]"
                />
                <div className="h-0.5 w-full rounded-full bg-hairline transition-colors duration-300 group-focus-within:bg-sage/60" />
              </div>

              <RichTextEditor
                className="mt-6"
                value={content}
                onChange={(nextContent) => {
                  setContent(nextContent);
                  markDirty();
                }}
                onUploadImage={handleImageUpload}
                placeholder="Let the thought unfold, exactly as it came to you..."
                spellCheck
                editorClassName="ruled-paper -mx-6 mt-4 min-h-[468px] w-[calc(100%_+_3rem)] px-6 font-reading font-light text-charcoal caret-sage sm:-mx-10 sm:w-[calc(100%_+_5rem)] sm:px-10"
              />
            </div>

            <footer className="flex flex-col gap-3 border-t border-hairline bg-warm-beige/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-gray">
                <span>{words.toLocaleString("en-US")} words</span>
                <span className="h-1 w-1 rounded-full bg-hairline" />
                <span>{reading} min read</span>
                {dirty && (
                  <span className="rounded-full bg-sage-subtle px-2 py-0.5 text-sage-deep">
                    {draftSavedAt ? "Draft saved" : "Unsaved"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-ghost !px-4 !py-2 text-[10px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="btn-sage !px-5 !py-2.5 text-[10px]"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {saving
                    ? "Saving..."
                    : isEditing
                      ? "Save changes"
                      : "Preserve entry"}
                </button>
              </div>
            </footer>
          </Reveal>

          {!focusMode && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-hairline bg-paper/70 px-5 py-3 text-[10px] text-muted-gray shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <Feather className="h-3.5 w-3.5 text-sage" />
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                Press
                <kbd className="rounded border border-hairline bg-paper px-1.5 py-0.5 font-sans text-[9px]">
                  Ctrl
                </kbd>
                +
                <kbd className="rounded border border-hairline bg-paper px-1.5 py-0.5 font-sans text-[9px]">
                  S
                </kbd>
                to save
              </span>
            </div>
          )}
        </main>

        <LeaveDraftDialog
          open={leaveDialogOpen}
          isEditing={isEditing}
          onClose={closeLeaveDialog}
          onSaveDraft={handleSaveDraftAndLeave}
          onAbandon={handleAbandonWriting}
        />

        <ConfirmDialog
          open={discardDialogOpen}
          eyebrow="Discard draft"
          title="Discard this draft?"
          description="Your unsaved changes cannot be recovered."
          confirmLabel="Discard draft"
          cancelLabel="Keep writing"
          onConfirm={confirmDiscardDraft}
          onClose={() => setDiscardDialogOpen(false)}
        />
      </div>
    </PageTransition>
  );
}
