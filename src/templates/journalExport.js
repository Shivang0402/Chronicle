const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const HORIZONTAL_RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const INLINE_TOKEN =
  /(!\[[^\]\n]*\]\([^)\s]+\)|\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`)/g;

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

        if (!src) return "";

        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}">`;
      }

      const link = part.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);

      if (link) {
        const href = safeHref(link[2]);

        if (!href) return escapeHtml(link[1]);

        return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link[1])}</a>`;
      }

      if (/^\*\*[\s\S]+\*\*$/.test(part)) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }

      if (/^__[\s\S]+__$/.test(part)) {
        return `<u>${escapeHtml(part.slice(2, -2))}</u>`;
      }

      if (/^\*[\s\S]+\*$/.test(part)) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }

      if (/^_[\s\S]+_$/.test(part)) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }

      if (/^~~[\s\S]+~~$/.test(part)) {
        return `<del>${escapeHtml(part.slice(2, -2))}</del>`;
      }

      if (/^`[\s\S]+`$/.test(part)) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      return escapeHtml(part).replaceAll("\n", "<br>");
    })
    .join("");

const renderMarkdown = (value) => {
  const lines = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    if (HORIZONTAL_RULE.test(line)) {
      blocks.push("<hr>");
      index++;
      continue;
    }

    const heading = line.match(HEADING);

    if (heading) {
      const level = Math.min(heading[1].length + 2, 6);

      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index++;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const quote = [];

      while (index < lines.length && BLOCKQUOTE.test(lines[index])) {
        quote.push(lines[index].match(BLOCKQUOTE)[1]);
        index++;
      }

      blocks.push(
        `<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`,
      );
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const matcher = BULLET.test(line) ? BULLET : ORDERED;
      const tag = matcher === BULLET ? "ul" : "ol";
      const items = [];

      while (index < lines.length && matcher.test(lines[index])) {
        items.push(lines[index].match(matcher)[1]);
        index++;
      }

      blocks.push(
        `<${tag}>${items
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</${tag}>`,
      );
      continue;
    }

    const paragraph = [];

    while (index < lines.length) {
      const candidate = lines[index];

      if (!candidate.trim()) break;

      if (
        HORIZONTAL_RULE.test(candidate) ||
        HEADING.test(candidate) ||
        BLOCKQUOTE.test(candidate) ||
        BULLET.test(candidate) ||
        ORDERED.test(candidate)
      ) {
        break;
      }

      paragraph.push(candidate);
      index++;
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
  if (/anxious|angry|tense/.test(value)) return "〰️";
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
    weekday: "long",
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

const buildEntryHtml = (entry) => {
  const tags = (entry.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");
  const time = formatTime(entry.date);
  const mood = entry.mood
    ? `<span class="mood mood-${moodTone(entry.mood)}"><span class="emoji">${moodEmoji(entry.mood)}</span>${escapeHtml(entry.mood)}</span>`
    : "";

  return `
    <article class="entry">
      <header class="entry-head">
        <div class="entry-meta">
          <div class="entry-date">
            ${time ? `<time>${escapeHtml(time)}</time><span class="meta-sep">·</span>` : ""}
            <span>${escapeHtml(formatLongDate(entry.date))}</span>
          </div>
          ${mood}
        </div>
        <h2 class="entry-title">${escapeHtml(entry.title || "Untitled entry")}</h2>
      </header>
      <div class="content">${renderMarkdown(entry.content)}</div>
      ${tags ? `<div class="tags">${tags}</div>` : ""}
    </article>
  `;
};

const buildDividerHtml = () => `
  <div class="entry-divider" aria-hidden="true">
    <span class="divider-rule"></span>
    <span class="divider-mark"></span>
    <span class="divider-rule"></span>
  </div>
`;

const journalStyles = `
  :root {
    --paper: #fcfaf5;
    --ink: #252622;
    --body: #34362f;
    --muted: #777970;
    --sage: #82947c;
    --sage-deep: #52664f;
    --sage-darker: #43543f;
    --sage-light: #e8efe6;
    --gold-light: #f5f0e4;
    --clay-light: #f4ebe5;
    --blue-light: #eaf0f2;
    --line: #e3e0d7;
    --serif: "Playfair Display", Georgia, "Times New Roman", serif;
    --sans: "DM Sans", Arial, "Helvetica Neue", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  @page {
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background-color: var(--paper);
  }

  body {
    color: var(--body);
    font-family: var(--serif);
    font-size: 10.8pt;
    line-height: 1.78;
    font-kerning: normal;
    text-rendering: optimizeLegibility;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: var(--paper);
    background-image:
      radial-gradient(rgba(37, 38, 34, 0.035) 0.55px, transparent 0.55px),
      repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 6.94mm,
        rgba(44, 46, 40, 0.045) 6.94mm,
        rgba(44, 46, 40, 0.045) 7mm
      );
    background-size:
      14px 14px,
      100% 7mm;
  }

  .page {
    width: 100%;
    padding: 16mm 17mm 18mm;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  .page-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6mm;
    margin: 0 0 8mm;
    padding: 0 0 4mm;
    border-bottom: 1px solid var(--line);
    break-after: avoid;
    page-break-after: avoid;
  }

  .brand {
    color: var(--ink);
    font-family: var(--serif);
    font-size: 18pt;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .brand-dot {
    color: var(--sage);
  }

  .page-date {
    color: var(--muted);
    font-family: var(--sans);
    font-size: 7pt;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.16em;
    text-align: right;
    text-transform: uppercase;
  }

  .entry {
    break-inside: auto;
    page-break-inside: auto;
  }

  .entry-head {
    margin: 0 0 4mm;
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
    page-break-after: avoid;
  }

  .entry-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 2mm 6mm;
    margin: 0 0 3mm;
  }

  .entry-date {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2mm;
    color: var(--sage-deep);
    font-family: var(--sans);
    font-size: 7pt;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .entry-date time {
    color: var(--sage-deep);
  }

  .meta-sep {
    color: #b9c2b1;
  }

  .mood {
    display: inline-flex;
    align-items: center;
    padding: 1.2mm 2.8mm;
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 6.8pt;
    font-weight: 600;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .emoji {
    margin-right: 1.5mm;
    font-family:
      "Segoe UI Emoji",
      "Apple Color Emoji",
      "Noto Color Emoji",
      sans-serif;
  }

  .mood-sage {
    background: var(--sage-light);
    color: #46583f;
  }

  .mood-gold {
    background: var(--gold-light);
    color: #806a42;
  }

  .mood-clay {
    background: var(--clay-light);
    color: #93664f;
  }

  .mood-blue {
    background: var(--blue-light);
    color: #54717b;
  }

  .entry-title {
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 21pt;
    font-style: italic;
    font-weight: 500;
    line-height: 1.24;
    letter-spacing: -0.025em;
    overflow-wrap: break-word;
    break-after: avoid;
    page-break-after: avoid;
  }

  .content {
    margin: 0;
    color: var(--body);
    font-family: var(--serif);
    font-size: 10.8pt;
    line-height: 1.82;
    overflow-wrap: break-word;
    word-wrap: break-word;
    orphans: 3;
    widows: 3;
  }

  .content > p:first-of-type::first-letter {
    float: left;
    margin: 0.08em 0.14em 0 0;
    color: var(--sage-deep);
    font-family: var(--serif);
    font-size: 3.3em;
    font-style: italic;
    font-weight: 500;
    line-height: 0.78;
  }

  .content p {
    margin: 0 0 4.2mm;
  }

  .content p:last-child {
    margin-bottom: 0;
  }

  .content h2,
  .content h3,
  .content h4,
  .content h5,
  .content h6 {
    margin: 6mm 0 2.5mm;
    color: var(--ink);
    font-family: var(--serif);
    font-weight: 500;
    line-height: 1.3;
    break-after: avoid;
    page-break-after: avoid;
  }

  .content h2 {
    font-size: 16pt;
  }

  .content h3 {
    font-size: 14pt;
  }

  .content h4 {
    font-size: 12.5pt;
  }

  .content h5 {
    font-size: 11pt;
    font-style: italic;
  }

  .content h6 {
    color: var(--sage-deep);
    font-family: var(--sans);
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .content ul,
  .content ol {
    margin: 1.5mm 0 4mm;
    padding-left: 6mm;
  }

  .content li {
    padding-left: 1mm;
    margin-bottom: 1.4mm;
  }

  .content li::marker {
    color: var(--sage);
  }

  .content blockquote {
    margin: 5mm 0;
    padding: 3mm 4mm;
    border-left: 2px solid rgba(82, 102, 79, 0.4);
    color: var(--muted);
    font-style: italic;
    line-height: 1.8;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .content hr {
    margin: 5.5mm 0;
    border: 0;
    border-top: 1px solid var(--line);
  }

  .content img {
    display: block;
    max-width: 100%;
    max-height: 110mm;
    margin: 4.5mm 0;
    border: 1px solid var(--line);
    border-radius: 4px;
    object-fit: cover;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .content a {
    color: var(--sage-deep);
    text-decoration: underline;
    text-decoration-color: #a8b39f;
  }

  .content code {
    padding: 0.5mm 1.5mm;
    border-radius: 3px;
    background: #f0f1eb;
    color: #4e5949;
    font-family: "Courier New", monospace;
    font-size: 9pt;
  }

  .content strong {
    color: #30332d;
    font-weight: 700;
  }

  .content del {
    color: var(--muted);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2mm;
    margin: 5mm 0 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .tag {
    display: inline-block;
    padding: 1mm 2.8mm;
    border-radius: 999px;
    background: #efeee7;
    color: #5e655a;
    font-family: var(--sans);
    font-size: 6.8pt;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .entry-divider {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin: 8mm 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .divider-rule {
    flex: 1 1 auto;
    height: 1px;
    background: rgba(196, 200, 191, 0.65);
  }

  .divider-mark {
    width: 4px;
    height: 4px;
    border: 1px solid rgba(82, 102, 79, 0.55);
    transform: rotate(45deg);
  }

  .empty {
    padding: 7mm;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: #f5f4ed;
    color: var(--muted);
    font-style: italic;
    line-height: 1.8;
  }

  @media print {
    .page-head,
    .entry-head,
    .entry-title,
    .tags,
    .content h2,
    .content h3,
    .content h4,
    .content h5,
    .content h6,
    .content blockquote {
      break-inside: avoid;
    }

    .content p,
    .content li {
      orphans: 3;
      widows: 3;
    }
  }
`;

const renderJournalHtml = (entries, exportedOn) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const entriesHtml = safeEntries
    .map((entry) => buildEntryHtml(entry))
    .join(buildDividerHtml());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="description" content="A private collection of journal entries.">
  <title>Chronicle — Journal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400..600&family=Playfair+Display:ital,wght@0,400..700;1,400..600&display=swap" rel="stylesheet">
  <style>${journalStyles}</style>
</head>
<body>
  <main class="page">
    <header class="page-head">
      <span class="brand">Chronicle<span class="brand-dot">.</span></span>
      <span class="page-date">${escapeHtml(formatLongDate(exportedOn))}</span>
    </header>

    ${
      safeEntries.length
        ? entriesHtml
        : '<p class="empty">Your pages will gather here as you write.</p>'
    }
  </main>
</body>
</html>`;
};

module.exports = { renderJournalHtml };
