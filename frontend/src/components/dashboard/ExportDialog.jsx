import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chronicleApi } from "../../lib/api";
import { formatEntryDate } from "../../lib/journal";

const scopes = [
  { id: "all", label: "Entire journal", description: "Every entry in your archive" },
  { id: "year", label: "By year", description: "Entries written in one year" },
  { id: "range", label: "Date range", description: "Choose a start and end date" },
  { id: "selected", label: "Choose entries", description: "Select individual pages" },
];
const DEFAULT_FORMATS = [
  {
    id: "pdf",
    label: "PDF",
    description: "A typeset keepsake ready to print",
  },
];
const CURRENT_YEAR = new Date().getFullYear();

export default function ExportDialog({
  open,
  token,
  exporting = false,
  onClose,
  onExport,
  exportError = "",
  formats = DEFAULT_FORMATS,
  initialFormat = "pdf",
}) {
  const [format, setFormat] = useState(initialFormat);
  const [scope, setScope] = useState("all");
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [entryCount, setEntryCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadError, setLoadError] = useState("");

  const closeDialog = useCallback(() => {
    setScope("all");
    setFormat(initialFormat);
    setPage(1);
    setSelectedIds([]);
    setLoadingEntries(false);
    onClose();
  }, [onClose, initialFormat]);

  const showFormatPicker = formats.length > 1;
  const selectedFormat =
    formats.find((item) => item.id === format) || formats[0] || DEFAULT_FORMATS[0];

  useEffect(() => {
    if (!open || scope !== "selected" || !token) return undefined;
    let active = true;
    chronicleApi
      .getChronicles(token, { page, limit: 20 })
      .then((data) => {
        if (!active) return;
        setEntries(data?.chronicles || []);
        setTotalPages(Math.max(1, data?.totalPages || 1));
        setEntryCount(data?.totalChronicles || 0);
      })
      .catch((error) => {
        if (active) setLoadError(error?.message || "Could not load your entries.");
      })
      .finally(() => {
        if (active) setLoadingEntries(false);
      });

    return () => {
      active = false;
    };
  }, [open, scope, page, token]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !exporting) closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, exporting, closeDialog]);

  const validationError = useMemo(() => {
    if (scope === "year" && (!/^\d{4}$/.test(year) || Number(year) < 1970)) {
      return "Enter a year from 1970 onward.";
    }
    if (scope === "range" && (!from || !to)) return "Choose both dates for your range.";
    if (scope === "range" && from > to) return "The end date must be on or after the start date.";
    if (scope === "selected" && selectedIds.length === 0) return "Select at least one entry.";
    return "";
  }, [scope, year, from, to, selectedIds.length]);

  const toggleEntry = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validationError || exporting) return;
    const filters = { format };
    if (scope === "year") filters.year = year;
    if (scope === "range") {
      filters.from = from;
      filters.to = to;
    }
    if (scope === "selected") filters.ids = selectedIds.join(",");
    onExport(filters);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-charcoal/35 p-4 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !exporting) closeDialog();
          }}
        >
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.22 }}
            className="my-auto w-full max-w-xl border border-hairline bg-ivory p-5 shadow-paper-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">Take your writing with you</span>
                <h2 id="export-dialog-title" className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">
                  {showFormatPicker
                    ? "Export your journal"
                    : `Export as ${selectedFormat.label}`}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
                  Choose a format and which journal entries to include.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={exporting}
                aria-label="Close export dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {showFormatPicker && (
              <div className="mt-5">
                <span className="field-label">Format</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {formats.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id)}
                      className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                        format === item.id
                          ? "border-sage/50 bg-sage-subtle/60"
                          : "border-hairline bg-paper/70 hover:border-sage/30"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-charcoal">
                          {item.label}
                        </span>
                        {format === item.id && (
                          <Check className="h-4 w-4 text-sage-deep" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-gray">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <fieldset className="mt-6 space-y-2">
              <legend className="sr-only">Entries to export</legend>
              {scopes.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 border px-3.5 py-3 transition-colors ${
                    scope === item.id
                      ? "border-sage/50 bg-sage-subtle/50"
                      : "border-hairline bg-paper/70 hover:border-sage/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="export-scope"
                    value={item.id}
                    checked={scope === item.id}
                    onChange={() => {
                      setScope(item.id);
                      setPage(1);
                      setLoadError("");
                      setLoadingEntries(item.id === "selected");
                    }}
                    className="mt-1 accent-sage-deep"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-charcoal">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-gray">{item.description}</span>
                  </span>
                  {scope === item.id && <Check className="mt-1 h-4 w-4 text-sage-deep" />}
                </label>
              ))}
            </fieldset>

            {scope === "year" && (
              <label className="mt-4 block text-xs font-medium text-charcoal">
                Year
                <input
                  type="number"
                  min="1970"
                  max="9999"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="field-input mt-2"
                />
              </label>
            )}

            {scope === "range" && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-charcoal">
                  From
                  <span className="relative mt-2 block">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
                    <input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="field-input pl-10" />
                  </span>
                </label>
                <label className="text-xs font-medium text-charcoal">
                  To
                  <span className="relative mt-2 block">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
                    <input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="field-input pl-10" />
                  </span>
                </label>
              </div>
            )}

            {scope === "selected" && (
              <div className="mt-4 border border-hairline bg-paper/70">
                <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5 text-xs">
                  <span className="font-medium text-charcoal">Your entries</span>
                  <span className="text-muted-gray">{selectedIds.length} selected · {entryCount} total</span>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {loadingEntries ? (
                    <p className="px-3.5 py-6 text-center text-xs text-muted-gray">Loading entries…</p>
                  ) : loadError ? (
                    <p role="alert" className="px-3.5 py-6 text-center text-xs text-danger">{loadError}</p>
                  ) : entries.length === 0 ? (
                    <p className="px-3.5 py-6 text-center text-xs text-muted-gray">No entries to export yet.</p>
                  ) : (
                    entries.map((entry) => (
                      <label key={entry._id} className="flex cursor-pointer items-start gap-3 border-b border-hairline/70 px-3.5 py-3 last:border-0 hover:bg-warm-beige/40">
                        <input type="checkbox" checked={selectedIds.includes(entry._id)} onChange={() => toggleEntry(entry._id)} className="mt-1 accent-sage-deep" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-charcoal">{entry.title || "Untitled entry"}</span>
                          <span className="mt-0.5 block text-[10px] text-muted-gray">{formatEntryDate(entry.date)}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-hairline px-3 py-2">
                    <button type="button" onClick={() => { setLoadingEntries(true); setPage((value) => Math.max(1, value - 1)); }} disabled={page === 1 || loadingEntries} className="btn-ghost !px-2 !py-1 text-xs disabled:opacity-40">
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    <span className="text-[10px] text-muted-gray">Page {page} of {totalPages}</span>
                    <button type="button" onClick={() => { setLoadingEntries(true); setPage((value) => Math.min(totalPages, value + 1)); }} disabled={page === totalPages || loadingEntries} className="btn-ghost !px-2 !py-1 text-xs disabled:opacity-40">
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {validationError && <p role="alert" className="mt-3 text-xs text-danger">{validationError}</p>}
            {exportError && <p role="alert" className="mt-3 text-xs text-danger">{exportError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-hairline pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeDialog} disabled={exporting} className="btn-ghost justify-center border border-hairline disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={Boolean(validationError) || exporting || (scope === "selected" && loadingEntries)} className="btn-primary justify-center disabled:cursor-wait">
                <Download className="h-4 w-4" />
                {exporting
                  ? `Preparing ${selectedFormat.label}…`
                  : `Download ${selectedFormat.label}`}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
