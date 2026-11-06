import { Link2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { safeHref } from "../../lib/markdownHtml";
import DialogShell from "./DialogShell";

const normalizeHref = (value) => {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  return safeHref(trimmed) ? trimmed : safeHref(`https://${trimmed}`);
};

export default function LinkDialog({
  open,
  hasSelection = false,
  onClose,
  onSubmit,
}) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const urlRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const frame = window.requestAnimationFrame(() => {
      urlRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const href = normalizeHref(url);

    if (!href) {
      setError("Enter a valid link, such as https://example.com.");
      return;
    }

    onSubmit?.({ href, text: text.trim() || href });
  };

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      labelledBy="link-dialog-title"
      describedBy="link-dialog-description"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-warm-beige/80 via-paper to-sage-subtle/60 px-6 pb-6 pt-7">
          <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border border-sage/15" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-sage/10 blur-2xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper/80 text-charcoal-muted transition-colors hover:text-charcoal"
            aria-label="Close link dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-sage-subtle text-sage-deep shadow-sm">
            <Link2 className="h-5 w-5" />
          </span>
          <span className="eyebrow relative mt-4 block">Add a link</span>
          <h2
            id="link-dialog-title"
            className="relative mt-1 font-serif text-2xl tracking-tight text-charcoal"
          >
            Where should it lead?
          </h2>
          <p
            id="link-dialog-description"
            className="relative mt-2 text-[12px] leading-relaxed text-charcoal-muted"
          >
            {hasSelection
              ? "The text you selected will become the link."
              : "Add a URL and the text that should appear in your entry."}
          </p>
        </div>

        <div className="space-y-4 p-5">
          <label className="block text-[11px] font-medium text-charcoal">
            Link URL
            <input
              ref={urlRef}
              type="text"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              placeholder="https://example.com"
              className="field-input mt-2 !bg-warm-beige/50 !py-2.5 !text-[13px]"
            />
          </label>

          {!hasSelection && (
            <label className="block text-[11px] font-medium text-charcoal">
              Link text
              <input
                type="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Read more"
                className="field-input mt-2 !bg-warm-beige/50 !py-2.5 !text-[13px]"
              />
            </label>
          )}

          {error && (
            <p role="alert" className="text-[11px] text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-hairline pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[11px]"
            >
              Cancel
            </button>
            <button type="submit" className="btn-sage !px-5 !py-2.5 text-[10px]">
              <Link2 className="h-3.5 w-3.5" />
              Insert link
            </button>
          </div>
        </div>
      </form>
    </DialogShell>
  );
}
