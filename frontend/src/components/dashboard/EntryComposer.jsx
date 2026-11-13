import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Hash, Loader2, PenLine, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import RichTextEditor from "../ui/RichTextEditor";
import { chronicleApi } from "../../lib/api";
import {
  clearDraft,
  getDraftOwner,
  readDraft,
  writeDraft,
} from "../../lib/drafts";
import {
  countWords,
  formatLongDate,
  formatTime,
  todayLabel,
} from "../../lib/journal";
import { MOODS } from "../../lib/moods";

export default function EntryComposer({
  open,
  onClose,
  token,
  user = null,
  onCreated,
  onUpdated,
  initialPrompt = "",
  entry = null,
}) {
  const isEditing = Boolean(entry?._id);
  const draftOwner = getDraftOwner(user);
  const draftEntryId = entry?._id || null;
  const baselineTitle = entry?.title || "";
  const baselineContent = entry?.content
    ? entry.content
    : initialPrompt
      ? `${initialPrompt}\n\n`
      : "";
  const baselineMood = entry?.mood || "";
  const baselineTagsInput = Array.isArray(entry?.tags)
    ? entry.tags.join(", ")
    : "";

  const [initialDraft] = useState(() => {
    if (!open) return null;

    const draft = readDraft(draftOwner, draftEntryId);

    if (!draft) return null;

    const draftTagsInput = draft.tags.join(", ");
    const differs =
      draft.title !== baselineTitle ||
      draft.content !== baselineContent ||
      draft.mood !== baselineMood ||
      draftTagsInput !== baselineTagsInput;

    return differs ? draft : null;
  });

  const [title, setTitle] = useState(initialDraft?.title ?? baselineTitle);
  const [content, setContent] = useState(
    initialDraft?.content ?? baselineContent,
  );
  const [mood, setMood] = useState(initialDraft?.mood ?? baselineMood);
  const [tagsInput, setTagsInput] = useState(
    initialDraft ? initialDraft.tags.join(", ") : baselineTagsInput,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(Boolean(initialDraft));
  const [draftRestoredAt, setDraftRestoredAt] = useState(() =>
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [draftSavedAt, setDraftSavedAt] = useState(() =>
    initialDraft ? new Date(initialDraft.updatedAt) : null,
  );
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const draftSnapshotRef = useRef(null);
  const dirtyRef = useRef(Boolean(initialDraft));

  const words = countWords(content);
  const canSave = content.trim().length >= 10 && !saving;
  const moodOptions =
    entry?.mood && !MOODS.includes(entry.mood)
      ? [entry.mood, ...MOODS]
      : MOODS;

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    draftSnapshotRef.current = {
      title,
      content,
      mood,
      tags: tagsInput,
    };
  }, [content, mood, tagsInput, title]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!open || !dirty) return undefined;

    const handleBeforeUnload = () => {
      if (draftSnapshotRef.current) {
        writeDraft(draftOwner, draftEntryId, draftSnapshotRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, draftEntryId, draftOwner, open]);

  useEffect(
    () => () => {
      if (!dirtyRef.current || !draftSnapshotRef.current) return;

      writeDraft(draftOwner, draftEntryId, draftSnapshotRef.current);
    },
    [draftEntryId, draftOwner],
  );

  useEffect(() => {
    if (!open || !dirty) return undefined;

    const timeout = window.setTimeout(() => {
      if (!dirtyRef.current) return;

      const stored = writeDraft(draftOwner, draftEntryId, {
        title,
        content,
        mood,
        tags: tagsInput,
      });

      setDraftSavedAt(stored ? new Date(stored.updatedAt) : null);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    content,
    dirty,
    draftEntryId,
    draftOwner,
    mood,
    open,
    tagsInput,
    title,
  ]);

  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
  };

  const handleDiscardDraft = () => {
    setDiscardDialogOpen(true);
  };

  const confirmDiscardDraft = () => {
    clearDraft(draftOwner, draftEntryId);
    dirtyRef.current = false;
    setDirty(false);
    setDraftRestoredAt(null);
    setDraftSavedAt(null);
    setError("");
    setTitle(baselineTitle);
    setContent(baselineContent);
    setMood(baselineMood);
    setTagsInput(baselineTagsInput);
    setDiscardDialogOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmed = content.trim();

    if (trimmed.length < 10) {
      setError("Write at least 10 characters before saving.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);

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

    setSaving(true);

    try {
      if (isEditing) {
        const data = await chronicleApi.updateEntry(
          entry._id,
          payload,
          token,
        );
        onUpdated?.(data?.chronicle);
        clearDraft(draftOwner, draftEntryId);
      } else {
        const data = await chronicleApi.createEntry(payload, token);
        onCreated?.(data?.chronicle);
        clearDraft(draftOwner, draftEntryId);
      }

      dirtyRef.current = false;
      setDirty(false);
      setDraftRestoredAt(null);
      setDraftSavedAt(null);
      onClose();
    } catch (saveError) {
      setError(saveError?.message || "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-scrim/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.form
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="composer-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-hairline bg-writing-folio shadow-paper-lg sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5 sm:px-8">
              <div>
                <span className="eyebrow mb-2 block">
                  {isEditing ? "Edit entry" : "New entry"}
                </span>
                <h2
                  id="composer-title"
                  className="font-serif text-2xl tracking-tight text-charcoal"
                >
                  {isEditing ? "Refine the page" : "Capture the moment"}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-gray">
                  <CalendarDays className="h-3 w-3" />
                  {isEditing ? formatLongDate(entry.date) : todayLabel()}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted transition-colors hover:text-charcoal"
                aria-label={dirty ? "Close and keep draft" : "Close editor"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {draftRestoredAt && (
              <div className="flex flex-col gap-2 border-b border-sage/20 bg-sage-subtle/50 px-6 py-3 text-[11px] text-sage-deep sm:flex-row sm:items-center sm:justify-between sm:px-8">
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

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  markDirty();
                }}
                placeholder="Give this page a title (optional)"
                maxLength={120}
                className="w-full border-0 bg-transparent font-serif text-2xl leading-tight tracking-tight text-charcoal outline-none placeholder:text-muted-gray/80"
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {moodOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMood(mood === item ? "" : item);
                      markDirty();
                    }}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      mood === item
                        ? "bg-sage-deep text-on-primary shadow-sm"
                        : "bg-warm-beige/80 text-charcoal-muted hover:bg-sage-light/60 hover:text-charcoal"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-hairline pt-6">
                <RichTextEditor
                  value={content}
                  onChange={(nextContent) => {
                    setContent(nextContent);
                    markDirty();
                  }}
                  placeholder="Let the thought unfold, exactly as it came to you..."
                  autoFocus
                  editorClassName="ruled-paper -mx-6 mt-4 min-h-[240px] w-[calc(100%_+_3rem)] px-6 font-reading font-light text-charcoal caret-sage sm:-mx-8 sm:w-[calc(100%_+_4rem)] sm:px-8"
                />
              </div>

              <div className="mt-4 border-t border-hairline pt-5">
                <label
                  htmlFor="entry-tags"
                  className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-gray"
                >
                  <Hash className="h-3 w-3 text-sage" />
                  Tags
                </label>
                <input
                  id="entry-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(event) => {
                    setTagsInput(event.target.value);
                    markDirty();
                  }}
                  placeholder="Reflections, Gratitude, MorningPages"
                  className="field-input !bg-warm-beige/50 !py-2.5 !text-[13px]"
                />
                <p className="mt-1.5 text-[10px] text-muted-gray">
                  Separate tags with commas. They will appear in your collections.
                </p>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-[11px] text-danger">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-hairline bg-warm-beige/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-gray">
                <span>
                  <span className="font-medium text-charcoal">{words}</span>{" "}
                  {words === 1 ? "word" : "words"}
                </span>
                <span className="h-1 w-1 rounded-full bg-hairline" />
                <span>
                  {content.trim().length < 10
                    ? "at least 10 characters"
                    : isEditing
                      ? "ready to save"
                      : "ready to preserve"}
                </span>
                {dirty && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-hairline" />
                    <span className="rounded-full bg-sage-subtle px-2 py-0.5 text-sage-deep">
                      {draftSavedAt ? "Draft saved" : "Unsaved"}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost !px-4 !py-2 text-[11px]"
                >
                  {dirty ? "Keep draft" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="btn-sage !px-5 !py-2.5 text-[10px]"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PenLine className="h-3.5 w-3.5" />
                  )}
                  {saving
                    ? isEditing
                      ? "Saving..."
                      : "Preserving..."
                    : isEditing
                      ? "Save changes"
                      : "Preserve entry"}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

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
    </>
  );
}
