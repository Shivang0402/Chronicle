import { AlertCircle, AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import DialogShell from "../ui/DialogShell";

export default function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  deleting = false,
  error = "",
}) {
  return (
    <DialogShell
      open={open}
      onClose={deleting ? undefined : onClose}
      labelledBy="delete-account-title"
      describedBy="delete-account-description"
      dismissable={!deleting}
    >
      <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-danger/[0.07] via-paper to-warm-beige/80 px-6 pb-6 pt-7">
        <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border border-danger/10" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-danger/5 blur-2xl" />

        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper/80 text-charcoal-muted transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-danger/10 text-danger shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <span className="eyebrow relative mt-4 block text-danger">
          Permanent action
        </span>
        <h2
          id="delete-account-title"
          className="relative mt-1 font-serif text-2xl tracking-tight text-charcoal"
        >
          Delete your account?
        </h2>
        <p
          id="delete-account-description"
          className="relative mt-2 text-[12px] leading-relaxed text-charcoal-muted"
        >
          This permanently deletes your account and every journal entry
          associated with it. This action cannot be undone. Export any entries
          you want to keep before continuing.
        </p>
      </div>

      <div className="p-5">
        {error && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-danger/15 bg-danger/[0.06] px-4 py-3 text-[11px] leading-relaxed text-danger"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep account
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-5 py-2.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {deleting ? "Deleting account..." : "Delete account"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}
