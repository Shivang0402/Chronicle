import { AlertTriangle, X } from "lucide-react";
import DialogShell from "./DialogShell";

export default function ConfirmDialog({
  open,
  eyebrow = "Please confirm",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  icon: Icon = AlertTriangle,
}) {
  return (
    <DialogShell
      open={open}
      onClose={onClose}
      labelledBy="confirm-dialog-title"
      describedBy="confirm-dialog-description"
    >
      <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-warm-beige/80 via-paper to-sage-subtle/60 px-6 pb-6 pt-7">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border border-sage/15" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-sage/10 blur-2xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper/80 text-charcoal-muted transition-colors hover:text-charcoal"
          aria-label={cancelLabel}
        >
          <X className="h-4 w-4" />
        </button>

        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-danger/10 text-danger shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <span className="eyebrow relative mt-4 block">{eyebrow}</span>
        <h2
          id="confirm-dialog-title"
          className="relative mt-1 font-serif text-2xl tracking-tight text-charcoal"
        >
          {title}
        </h2>
        {description && (
          <p
            id="confirm-dialog-description"
            className="relative mt-2 text-[12px] leading-relaxed text-charcoal-muted"
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[11px]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-5 py-2.5 text-[11px] font-medium text-on-danger transition-opacity hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}
