import { AlertCircle, Loader2, Trash2 } from "lucide-react";
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
      className="max-w-lg !rounded-xl sm:!rounded-xl"
    >
      <div className="border-b border-danger/25 px-6 pb-6 pt-7">
        <span className="eyebrow text-danger">Permanent action</span>
        <h2
          id="delete-account-title"
          className="mt-2 font-serif text-2xl tracking-tight text-charcoal sm:text-[28px]"
        >
          Delete your account?
        </h2>
        <p
          id="delete-account-description"
          className="mt-3 text-[13px] leading-relaxed text-charcoal-muted"
        >
          This permanently removes your account and every journal entry. It
          cannot be undone.
        </p>
      </div>

      <div className="px-6 py-5">
        <p className="text-[13px] leading-relaxed text-muted-gray">
          Export your journal first if you want to keep anything.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border-l border-danger/60 pl-4 text-[13px] leading-relaxed text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="text-[13px] text-muted-gray transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep account
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 border border-danger/60 px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide2 text-danger transition-colors hover:bg-danger/10 disabled:cursor-wait disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Deleting account…" : "Delete account"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}
