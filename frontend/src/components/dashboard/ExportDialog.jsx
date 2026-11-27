import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chronicleApi } from "../../lib/api";
import { EXPORT_FORMATS } from "../../lib/exportFormats";
import { dayKey, formatEntryDate } from "../../lib/journal";
import FilterDatePicker from "../ui/FilterDatePicker";

const scopes = [
  { id: "all", label: "Entire journal", description: "Every entry in your archive" },
  { id: "year", label: "By year", description: "Entries written in one year" },
  { id: "range", label: "Date range", description: "Choose a start and end date" },
  { id: "selected", label: "Choose entries", description: "Select individual pages" },
];
const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 20;

const fetchAllEntries = async (token, ownerId) => {
  const firstPage = await chronicleApi.getChronicles(
    token,
    { page: 1, limit: PAGE_SIZE, sort: "oldest" },
    ownerId,
  );
  const totalPages = Math.max(Number(firstPage?.totalPages) || 1, 1);
  const entries = [...(firstPage?.chronicles || [])];

  for (let startPage = 2; startPage <= totalPages; startPage += 4) {
    const pageNumbers = Array.from(
      { length: Math.min(4, totalPages - startPage + 1) },
      (_, index) => startPage + index,
    );
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        chronicleApi.getChronicles(
          token,
          { page, limit: PAGE_SIZE, sort: "oldest" },
          ownerId,
        ),
      ),
    );
    pages.forEach((result) => entries.push(...(result?.chronicles || [])));
  }

  return entries;
};

export default function ExportDialog({
  open,
  token,
  ownerId,
  exporting = false,
  onClose,
  onExport,
  exportError = "",
  formats = EXPORT_FORMATS,
  initialFormat = "pdf",
  initialScope = "all",
}) {
  const [format, setFormat] = useState(initialFormat);
  const [scope, setScope] = useState(initialScope);
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [archiveEntries, setArchiveEntries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  const closeDialog = useCallback(() => {
    setScope(initialScope);
    setFormat(initialFormat);
    setPage(1);
    setSelectedIds([]);
    setLoadingEntries(false);
    setArchiveEntries([]);
    setLoadError("");
    onClose();
  }, [onClose, initialFormat, initialScope]);

  const showFormatPicker = formats.length > 1;
  const selectedFormat =
    formats.find((item) => item.id === format) || formats[0] || EXPORT_FORMATS[0];

  useEffect(() => {
    if (!open || !token || !ownerId) return undefined;
    let active = true;
    setLoadingEntries(true);
    setLoadError("");
    setSelectedIds([]);
    fetchAllEntries(token, ownerId)
      .then((allEntries) => {
        if (!active) return;
        setArchiveEntries(allEntries);
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
  }, [open, token, ownerId, loadKey]);

  const totalPages = Math.max(1, Math.ceil(archiveEntries.length / PAGE_SIZE));
  const entryCount = archiveEntries.length;
  const entries = archiveEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    const selectedEntries = archiveEntries.filter((entry) => {
      if (scope === "selected") return selectedIds.includes(String(entry._id));
      if (scope === "year") return String(new Date(entry.date).getFullYear()) === year;
      if (scope === "range") {
        const entryDay = dayKey(entry.date);
        return entryDay >= from && entryDay <= to;
      }
      return true;
    });
    onExport(filters, selectedEntries);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-scrim/35 p-4 backdrop-blur-sm sm:p-6"
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
            className="my-auto w-full max-w-3xl border border-hairline bg-ivory p-5 shadow-paper-lg sm:p-7"
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
                  {format === "json" || format === "markdown"
                    ? "Downloads directly to this device."
                    : "Opens a print view to save as PDF."}
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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {formats.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id)}
                      className={`rounded-lg border px-3 py-3 text-left transition-colors duration-300 ${
                        format === item.id
                          ? "border-sage/50 bg-sage-subtle/60"
                          : "border-hairline bg-paper/70 hover:border-sage/30"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-charcoal">
                          {item.label}
                        </span>
                        <Check
                          className={`h-4 w-4 text-sage-deep ${
                            format === item.id ? "opacity-100" : "opacity-0"
                          }`}
                          aria-hidden="true"
                        />
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
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors duration-300 ${
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
                    }}
                    className="mt-1 accent-sage-deep"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-charcoal">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-gray">{item.description}</span>
                  </span>
                  <Check
                    className={`mt-1 h-4 w-4 text-sage-deep ${
                      scope === item.id ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </label>
              ))}
            </fieldset>

            <p className="mt-3 text-[11px] text-muted-gray">
              {loadingEntries
                ? "Loading and decrypting your entries in this browser…"
                : `${entryCount.toLocaleString("en-US")} entries available for export`}
            </p>
            {loadError && (
              <p role="alert" className="mt-2 text-xs text-danger">
                {loadError}{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    setLoadingEntries(true);
                    setLoadKey((value) => value + 1);
                  }}
                >
                  Retry
                </button>
              </p>
            )}

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
                <div className="text-xs font-medium text-charcoal">
                  <span className="mb-2 block">From</span>
                  <FilterDatePicker
                    value={from}
                    onChange={setFrom}
                    label="From date"
                    placeholder="Select date"
                    max={to || undefined}
                    variant="field"
                  />
                </div>
                <div className="text-xs font-medium text-charcoal">
                  <span className="mb-2 block">To</span>
                  <FilterDatePicker
                    value={to}
                    onChange={setTo}
                    label="To date"
                    placeholder="Select date"
                    min={from || undefined}
                    variant="field"
                    align="right"
                  />
                </div>
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
              <button type="submit" disabled={Boolean(validationError) || exporting || loadingEntries || Boolean(loadError)} className="btn-primary justify-center disabled:cursor-wait">
                <Download className="h-4 w-4" />
                {exporting
                  ? `Preparing ${selectedFormat.label}…`
                  : format === "json"
                    ? `Download ${selectedFormat.label}`
                    : "Open print dialog"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
