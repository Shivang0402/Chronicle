import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  Feather,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  countWords,
  formatLongDate,
  readingTime,
} from "../../lib/journal";
import FormattedContent from "../ui/FormattedContent";

export default function EntryReader({
  entry,
  onClose,
  onEdit,
  onDelete,
  deleting = false,
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const words = entry ? countWords(entry.content) : 0;

  useEffect(() => {
    if (!entry) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [entry, onClose]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-scrim/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.article
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-hairline bg-writing-folio shadow-paper-lg sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5 sm:px-9">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-gray">
                  <CalendarDays className="h-3 w-3 text-sage" />
                  {formatLongDate(entry.date)}
                </p>
                {entry.mood && (
                  <span className="mt-3 inline-flex rounded-full bg-sage-subtle px-2.5 py-1 text-[10px] font-medium text-sage-deep">
                    {entry.mood}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted transition-colors hover:text-charcoal"
                aria-label="Close entry"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-9 sm:py-9">
              <h2
                id="reader-title"
                className="font-serif text-3xl leading-tight tracking-tight text-charcoal"
              >
                {entry.title || "Untitled entry"}
              </h2>

              {entry.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted-gray">
                  {entry.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <FormattedContent
                content={entry.content}
                className="mt-7 font-reading text-lg font-light leading-[1.85] text-charcoal"
              />
            </div>

            <div className="border-t border-hairline bg-warm-beige/30 px-6 py-4 sm:px-9">
              <div className="flex flex-col gap-2 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {words.toLocaleString("en-US")} words · {readingTime(words)}{" "}
                  min read
                </span>
                <span className="flex items-center gap-1.5 italic">
                  <Feather className="h-3 w-3 text-sage" />
                  Preserved in your archive
                </span>
              </div>

              {(onEdit || onDelete) && (
                <div className="mt-3 border-t border-hairline/70 pt-3">
                  {confirmingDelete ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-[11px] text-danger">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Delete this entry permanently? This cannot be undone.
                      </p>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(false)}
                          disabled={deleting}
                          className="btn-ghost !px-3.5 !py-2 text-[10px]"
                        >
                          Keep entry
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(entry)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3.5 py-2 text-[10px] font-medium text-on-danger transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          {deleting ? "Deleting..." : "Delete forever"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3.5 py-2 text-[10px] text-charcoal-muted transition-colors hover:text-charcoal"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(true)}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] text-danger transition-colors hover:bg-danger/5"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
