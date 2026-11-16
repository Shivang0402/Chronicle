const { escapeHtml, renderMarkdown } = require("./journalExport");

const toDate = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = toDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (value) => {
  const date = toDate(value);

  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const buildMeta = (entry) => {
  const parts = [];

  if (entry.mood) parts.push(`Mood: ${entry.mood}`);
  if (entry.tags?.length) parts.push(`Tags: ${entry.tags.join(", ")}`);

  if (!parts.length) return "";

  return `<p class="entry-meta">${escapeHtml(parts.join(" · "))}</p>`;
};

const buildEntryHtml = (entry) => {
  const date = formatDate(entry.date);
  const time = formatTime(entry.date);
  const stamp = time ? `${date}, ${time}` : date;

  return `
    <article class="entry">
      <header class="entry-head">
        <p class="entry-date">${escapeHtml(stamp)}</p>
        ${entry.title ? `<h2 class="entry-title">${escapeHtml(entry.title)}</h2>` : ""}
        ${buildMeta(entry)}
      </header>
      <div class="entry-content">${renderMarkdown(entry.content)}</div>
    </article>
  `;
};

const printStyles = `
  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  body {
    color: #111111;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.75;
  }

  .entry {
    margin: 0 0 12mm;
  }

  .entry:last-child {
    margin-bottom: 0;
  }

  .entry-head {
    margin: 0 0 3mm;
    break-after: avoid;
    page-break-after: avoid;
  }

  .entry-date {
    margin: 0 0 1.5mm;
    color: #555555;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
  }

  .entry-title {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14pt;
    font-weight: 600;
    line-height: 1.35;
  }

  .entry-meta {
    margin: 1.5mm 0 0;
    color: #555555;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
  }

  .entry-content {
    overflow-wrap: break-word;
  }

  .entry-content p {
    margin: 0 0 3.5mm;
  }

  .entry-content p:last-child {
    margin-bottom: 0;
  }

  .entry-content h1,
  .entry-content h2,
  .entry-content h3,
  .entry-content h4,
  .entry-content h5,
  .entry-content h6 {
    margin: 5mm 0 2.5mm;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    line-height: 1.35;
    break-after: avoid;
    page-break-after: avoid;
  }

  .entry-content h1 {
    font-size: 15pt;
  }

  .entry-content h2 {
    font-size: 14pt;
  }

  .entry-content h3 {
    font-size: 13pt;
  }

  .entry-content h4,
  .entry-content h5,
  .entry-content h6 {
    font-size: 12pt;
  }

  .entry-content ul,
  .entry-content ol {
    margin: 0 0 3.5mm;
    padding-left: 6mm;
  }

  .entry-content li {
    margin-bottom: 1.5mm;
  }

  .entry-content blockquote {
    margin: 3.5mm 0;
    padding: 0 0 0 5mm;
    color: #333333;
    font-style: italic;
  }

  .entry-content hr {
    margin: 5mm 0;
    border: 0;
    border-top: 1px solid #cccccc;
  }

  .entry-content img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 160mm;
    margin: 4mm 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .entry-content a {
    color: inherit;
    text-decoration: underline;
  }

  .entry-content code {
    font-family: "Courier New", Courier, monospace;
    font-size: 10pt;
  }

  .entry-content strong {
    font-weight: 600;
  }

  .empty {
    color: #555555;
    font-style: italic;
  }
`;

const renderPrintHtml = (entries) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const entriesHtml = safeEntries.map((entry) => buildEntryHtml(entry)).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Journal</title>
  <style>${printStyles}</style>
</head>
<body>
  <main class="page">
    ${
      safeEntries.length
        ? entriesHtml
        : '<p class="empty">No entries to export yet.</p>'
    }
  </main>
</body>
</html>`;
};

module.exports = { renderPrintHtml };
