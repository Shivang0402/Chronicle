import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Hash, Loader2, PenLine, X } from "lucide-react";
import { useEffect, useState } from "react";
import { chronicleApi } from "../../lib/api";
import {
  countWords,
  formatLongDate,
  todayLabel,
} from "../../lib/journal";
import { MOODS } from "../../lib/moods";

export default function EntryComposer({
  open,
  onClose,
  token,
  onCreated,
  onUpdated,
  initialPrompt = "",
  entry = null,
}) {
  const isEditing = Boolean(entry?._id);
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(() => {
    if (entry?.content) return entry.content;
    return initialPrompt ? `${initialPrompt}\n\n` : "";
  });
  const [mood, setMood] = useState(entry?.mood || "");
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(entry?.tags) ? entry.tags.join(", ") : "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      } else {
        const data = await chronicleApi.createEntry(payload, token);
        onCreated?.(data?.chronicle);
      }

      onClose();
    } catch (saveError) {
      setError(saveError?.message || "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
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
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-hairline bg-paper shadow-paper-lg sm:rounded-2xl"
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
                aria-label="Close editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this page a title (optional)"
                maxLength={120}
                className="w-full border-0 bg-transparent font-serif text-2xl leading-tight tracking-tight text-charcoal outline-none placeholder:text-muted-gray/60"
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {moodOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMood(mood === item ? "" : item)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      mood === item
                        ? "bg-sage text-white shadow-sm"
                        : "bg-warm-beige/80 text-charcoal-muted hover:bg-sage-light/60 hover:text-charcoal"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-hairline pt-6">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Let the thought unfold, exactly as it came to you..."
                  autoFocus
                  className="min-h-[210px] w-full resize-none border-0 bg-transparent font-serif text-lg font-light leading-[1.8] text-charcoal outline-none placeholder:text-muted-gray/60"
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
                  onChange={(event) => setTagsInput(event.target.value)}
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
              <div className="text-[10px] text-muted-gray">
                <span className="font-medium text-charcoal">{words}</span>{" "}
                {words === 1 ? "word" : "words"} ·{" "}
                {content.trim().length < 10
                  ? "at least 10 characters"
                  : isEditing
                    ? "ready to save"
                    : "ready to preserve"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost !px-4 !py-2 text-[11px]"
                >
                  Cancel
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
  );
}
