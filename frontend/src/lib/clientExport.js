import { countWords, formatEntryDate } from "./journal.js";
import { exportFileName } from "./exportFormats.js";
import { renderJournalHtml, renderPrintHtml } from "./exportTemplates.js";

const toExportRecord = (entry) => ({
  id: String(entry._id || entry.id || ""),
  date: entry.date,
  title: entry.title || "",
  content: entry.content || "",
  mood: entry.mood || "",
  tags: Array.isArray(entry.tags) ? entry.tags : [],
  wordCount: countWords(entry.content || ""),
});

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const waitForPrintAssets = async (printWindow) => {
  const document = printWindow.document;
  const waitWithTimeout = (promise, timeout) =>
    Promise.race([promise, new Promise((resolve) => window.setTimeout(resolve, timeout))]);

  await waitWithTimeout(document.fonts?.ready || Promise.resolve(), 2500);
  const imageLoads = Array.from(document.images).map((image) =>
    image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          window.setTimeout(resolve, 5000);
        }),
  );
  await waitWithTimeout(Promise.all(imageLoads), 6000);
};

export function exportEntriesInBrowser(entries, format) {
  const date = new Date().toISOString().slice(0, 10);
  const safeEntries = Array.isArray(entries) ? entries : [];

  if (format === "json") {
    const data = JSON.stringify(safeEntries.map(toExportRecord), null, 2);
    downloadBlob(
      new Blob([data], { type: "application/json;charset=utf-8" }),
      exportFileName(format, date),
    );
    return "downloaded";
  }

  if (format === "markdown") {
    const entries = safeEntries.map((entry) => {
      const record = toExportRecord(entry);
      return [
        `# ${record.title || "Untitled entry"}`,
        `Date: ${formatEntryDate(record.date)}`,
        record.mood ? `Mood: ${record.mood}` : "",
        record.tags.length
          ? `Collections: ${record.tags.map((tag) => `#${tag}`).join(", ")}`
          : "",
        "",
        record.content || "",
      ]
        .filter((line) => line !== "")
        .join("\n");
    });
    const header = `# Chronicle journal\n\nExported ${formatEntryDate(date)} · ${safeEntries.length} ${safeEntries.length === 1 ? "entry" : "entries"}\n\n`;
    const document = `${header}${entries.join("\n\n---\n\n")}\n`;
    downloadBlob(
      new Blob([document], { type: "text/markdown;charset=utf-8" }),
      exportFileName(format, date),
    );
    return "downloaded";
  }

  if (format !== "pdf" && format !== "pdf-print") {
    throw new Error("This export format is not supported in the browser.");
  }

  const printWindow = window.open("about:blank", "_blank");
  if (!printWindow) throw new Error("Allow pop-ups for Chronicle to open the print view.");

  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(
    format === "pdf-print"
      ? renderPrintHtml(safeEntries)
      : renderJournalHtml(safeEntries, date),
  );
  printWindow.document.close();
  printWindow.document.title = exportFileName(format, date).replace(/\.pdf$/i, "");
  waitForPrintAssets(printWindow).finally(() => {
    if (printWindow.closed) return;
    printWindow.focus();
    printWindow.print();
  });
  return "print-view";
}
