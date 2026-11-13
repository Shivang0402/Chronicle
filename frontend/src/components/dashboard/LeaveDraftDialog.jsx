import { AnimatePresence, motion } from "framer-motion";
import { Feather, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function LeaveDraftDialog({
  open,
  isEditing = false,
  onClose,
  onSaveDraft,
  onAbandon,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-scrim/35 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-draft-title"
            aria-describedby="leave-draft-description"
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-hairline bg-paper shadow-paper-lg sm:rounded-3xl"
          >
            <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-warm-beige/80 via-paper to-sage-subtle/60 px-6 pb-6 pt-7">
              <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border border-sage/15" />
              <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-sage/10 blur-2xl" />

              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper/80 text-charcoal-muted transition-colors hover:text-charcoal"
                aria-label="Keep writing"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-sage-subtle text-sage-deep shadow-sm">
                <Feather className="h-5 w-5" />
              </span>
              <span className="eyebrow relative mt-4 block">Before you go</span>
              <h2
                id="leave-draft-title"
                className="relative mt-1 font-serif text-2xl tracking-tight text-charcoal"
              >
                Keep this page?
              </h2>
              <p
                id="leave-draft-description"
                className="relative mt-2 text-[12px] leading-relaxed text-charcoal-muted"
              >
                {isEditing
                  ? "Your unsaved changes will be saved as a draft, so you can pick them up whenever you return."
                  : "Your writing will be saved as a draft, so you can return whenever you are ready."}
              </p>
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="btn-sage w-full !px-4 !py-3 text-[10px]"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save as draft & leave
                </button>
                <button
                  type="button"
                  onClick={onAbandon}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-danger/20 bg-paper px-4 py-3 text-[11px] font-medium text-danger transition-colors hover:bg-danger/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Abandon writing
                </button>
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-[11px] text-charcoal-muted transition-colors hover:text-charcoal"
                >
                  Keep writing
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-gray">
                Abandoning will not keep a draft.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
