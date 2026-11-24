import journalTemplateSource from "../../../src/templates/journalExport.js?raw";
import printTemplateSource from "../../../src/templates/printExport.js?raw";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getTemplateLiteral = (source, name) => {
  const match = source.match(new RegExp(`const ${name} = \\x60([\\s\\S]*?)\\x60;`));
  if (!match) throw new Error(`Could not load the ${name} export styles.`);
  return match[1];
};

// Keep the browser export styles sourced from the same templates as server exports.
const journalStyles = getTemplateLiteral(journalTemplateSource, "journalStyles");
const printStyles = getTemplateLiteral(printTemplateSource, "printStyles");

const HORIZONTAL_RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const INLINE_TOKEN =
  /(!\[[^\]\n]*\]\([^\s)]+\)|\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`)/g;

const safeHref = (value) => {
  const href = String(value || "").trim();
  return /^(https?:|mailto:)/i.test(href) ? href : "";
};

const safeImageSrc = (value) => {
  const src = String(value || "").trim();
  return /^https?:/i.test(src) ? src : "";
};

const renderInline = (value) =>
  String(value ?? "")
    .split(INLINE_TOKEN)
    .filter((part) => part !== "")
    .map((part) => {
      const image = part.match(/^!\[([^\]\n]*)\]\(([^)\s]+)\)$/);
      if (image) {
        const src = safeImageSrc(image[2]);
        return src
          ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}">`
          : "";
      }

      const link = part.match(/^\[([^\]\n]+)\]\(([^\s)]+)\)$/);
      if (link) {
        const href = safeHref(link[2]);
        return href
          ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link[1])}</a>`
          : escapeHtml(link[1]);
      }

      if (/^\*\*[\s\S]+\*\*$/.test(part)) return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      if (/^__[\s\S]+__$/.test(part)) return `<u>${escapeHtml(part.slice(2, -2))}</u>`;
      if (/^\*[\s\S]+\*$/.test(part)) return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      if (/^_[\s\S]+_$/.test(part)) return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      if (/^~~[\s\S]+~~$/.test(part)) return `<del>${escapeHtml(part.slice(2, -2))}</del>`;
      if (/^`[\s\S]+`$/.test(part)) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      return escapeHtml(part).replaceAll("\n", "<br>");
    })
    .join("");

const renderMarkdown = (value) => {
  const lines = String(value ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (HORIZONTAL_RULE.test(line)) {
      blocks.push("<hr>");
      index += 1;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push(`<h${Math.min(heading[1].length + 2, 6)}>${renderInline(heading[2])}</h${Math.min(heading[1].length + 2, 6)}>`);
      index += 1;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const quote = [];
      while (index < lines.length && BLOCKQUOTE.test(lines[index])) {
        quote.push(lines[index].match(BLOCKQUOTE)[1]);
        index += 1;
      }
      blocks.push(`<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`);
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const matcher = BULLET.test(line) ? BULLET : ORDERED;
      const tag = matcher === BULLET ? "ul" : "ol";
      const items = [];
      while (index < lines.length && matcher.test(lines[index])) {
        items.push(lines[index].match(matcher)[1]);
        index += 1;
      }
      blocks.push(`<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length) {
      const candidate = lines[index];
      if (!candidate.trim()) break;
      if (HORIZONTAL_RULE.test(candidate) || HEADING.test(candidate) || BLOCKQUOTE.test(candidate) || BULLET.test(candidate) || ORDERED.test(candidate)) break;
      paragraph.push(candidate);
      index += 1;
    }
    blocks.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
  }

  return blocks.join("\n");
};

const moodTone = (mood) => {
  const value = String(mood || "").toLowerCase();
  if (/peace|calm|content|grounded/.test(value)) return "sage";
  if (/grateful|joy|happy|hope/.test(value)) return "gold";
  if (/inspir|curious|excited/.test(value)) return "clay";
  if (/sad|low|tired|anxious|angry/.test(value)) return "blue";
  return "sage";
};

const moodEmoji = (mood) => {
  const value = String(mood || "").toLowerCase();
  if (/peace|calm|content|grounded/.test(value)) return "🌿";
  if (/grateful|joy|happy|hope/.test(value)) return "✨";
  if (/inspir|curious|excited/.test(value)) return "✍️";
  if (/sad|low|tired/.test(value)) return "☁️";
  if (/anxious|angry|tense/.test(value)) return "🫧";
  if (/contemplative|reflective/.test(value)) return "☾";
  return "✦";
};

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatLongDate = (value) => {
  const date = toDate(value);
  if (!date) return "Date unavailable";
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
};

const buildJournalEntry = (entry) => {
  const tags = (entry.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");
  const time = formatTime(entry.date);
  const mood = entry.mood
    ? `<span class="mood mood-${moodTone(entry.mood)}"><span class="emoji">${moodEmoji(entry.mood)}</span>${escapeHtml(entry.mood)}</span>`
    : "";

  return `<article class="entry"><header class="entry-head"><div class="entry-meta"><div class="entry-date">${time ? `<time>${escapeHtml(time)}</time><span class="meta-sep">·</span>` : ""}<span>${escapeHtml(formatLongDate(entry.date))}</span></div>${mood}</div><h2 class="entry-title">${escapeHtml(entry.title || "Untitled entry")}</h2></header><div class="content">${renderMarkdown(entry.content)}</div>${tags ? `<div class="tags">${tags}</div>` : ""}</article>`;
};

const buildPrintEntry = (entry) => {
  const date = toDate(entry.date);
  const formattedDate = date
    ? date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })
    : "Date unavailable";
  const time = formatTime(entry.date);
  const meta = [entry.mood && `Mood: ${entry.mood}`, entry.tags?.length && `Tags: ${entry.tags.join(", ")}`]
    .filter(Boolean)
    .join(" · ");
  return `<article class="entry"><header class="entry-head"><p class="entry-date">${escapeHtml(time ? `${formattedDate}, ${time}` : formattedDate)}</p>${entry.title ? `<h2 class="entry-title">${escapeHtml(entry.title)}</h2>` : ""}${meta ? `<p class="entry-meta">${escapeHtml(meta)}</p>` : ""}</header><div class="entry-content">${renderMarkdown(entry.content)}</div></article>`;
};

export function renderJournalHtml(entries, exportedOn) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const entriesHtml = safeEntries.map(buildJournalEntry).join('<div class="entry-divider" aria-hidden="true"><span class="divider-rule"></span><span class="divider-mark"></span><span class="divider-rule"></span></div>');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="description" content="A private collection of journal entries."><title>Chronicle — Journal</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400..600&family=Playfair+Display:ital,wght@0,400..700;1,400..600&display=swap" rel="stylesheet"><style>${journalStyles}</style></head><body><main class="page"><header class="page-head"><span class="brand">Chronicle<span class="brand-dot">.</span></span><span class="page-date">${escapeHtml(formatLongDate(exportedOn))}</span></header>${safeEntries.length ? entriesHtml : '<p class="empty">Your pages will gather here as you write.</p>'}</main></body></html>`;
}

export function renderPrintHtml(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const entriesHtml = safeEntries.map(buildPrintEntry).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><title>Journal</title><style>@page{size:A4;margin:20mm;@bottom-center{content:"Page " counter(page) " of " counter(pages);font:9px Arial,Helvetica,sans-serif;color:#555;text-align:center}}${printStyles}</style></head><body><main class="page">${safeEntries.length ? entriesHtml : '<p class="empty">No entries to export yet.</p>'}</main></body></html>`;
}
