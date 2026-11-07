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
  /(\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`)/g;

const safeHref = (value) => {
  const href = String(value || "").trim();

  return /^(https?:|mailto:)/i.test(href) ? href : "";
};

const renderInline = (value) =>
  String(value ?? "")
    .split(INLINE_TOKEN)
    .filter((part) => part !== "")
    .map((part) => {
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

const formatShortDate = (value) => {
  const date = toDate(value);

  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildRangeLabel = (entries) => {
  const dates = entries
    .map((entry) => toDate(entry.date))
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (!dates.length) return "";

  const first = formatShortDate(dates[0]);
  const last = formatShortDate(dates[dates.length - 1]);

  return first === last ? first : `${first} – ${last}`;
};

const buildContentsHtml = (entries) => {
  if (entries.length < 3) return "";

  const items = entries
    .map(
      (entry, index) => `
        <li class="contents-item">
          <span class="contents-num">${String(index + 1).padStart(2, "0")}</span>
          <span class="contents-title">${escapeHtml(entry.title || "Untitled entry")}</span>
          <span class="contents-date">${escapeHtml(formatShortDate(entry.date))}</span>
        </li>`,
    )
    .join("");

  return `
    <section class="contents">
      <div class="contents-head">
        <span class="kicker">Contents</span>
        <h2>Pages to return to</h2>
      </div>
      <ol class="contents-list">${items}</ol>
    </section>
  `;
};

const buildEntryHtml = (entry, index) => {
  const tags = (entry.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="entry">
      <header class="entry-head">
        <div class="entry-meta">
          <div class="entry-date">
            <span class="entry-number">${String(index + 1).padStart(2, "0")}</span>
            <time>${escapeHtml(formatLongDate(entry.date))}</time>
          </div>
          ${
            entry.mood
              ? `<span class="mood mood-${moodTone(entry.mood)}"><span class="emoji">${moodEmoji(entry.mood)}</span>${escapeHtml(entry.mood)}</span>`
              : ""
          }
        </div>
        <h2 class="entry-title">${escapeHtml(entry.title || "Untitled entry")}</h2>
        ${tags ? `<div class="tags">${tags}</div>` : ""}
      </header>
      <div class="content">${renderMarkdown(entry.content)}</div>
      <div class="entry-endmark">✦</div>
    </article>
  `;
};

const journalStyles = `
  :root {
    --paper: #fcfbf8;
    --ink: #292b27;
    --body: #484941;
    --muted: #89897f;
    --sage: #74836b;
    --sage-dark: #4d5e45;
    --sage-light: #edf0e9;
    --gold-light: #f5f0e4;
    --clay-light: #f4ebe5;
    --blue-light: #eaf0f2;
    --line: #e8e6df;
    --serif: "Playfair Display", Georgia, "Times New Roman", serif;
    --book: Georgia, "Times New Roman", serif;
    --sans: "DM Sans", Arial, "Helvetica Neue", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--paper);
  }

  body {
    color: var(--body);
    font-family: var(--book);
    font-size: 10.5pt;
    line-height: 1.8;
    font-kerning: normal;
    text-rendering: optimizeLegibility;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cover {
    min-height: 264mm;
    padding: 20mm 16mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    background: linear-gradient(145deg, #fdfcf9 0%, #f8f7f3 62%, #f1efe8 100%);
  }

  .cover::after {
    content: "";
    position: absolute;
    right: -34mm;
    bottom: 16mm;
    width: 104mm;
    height: 104mm;
    border: 1px solid rgba(116, 131, 107, 0.2);
    border-radius: 50%;
    box-shadow:
      0 0 0 11mm rgba(116, 131, 107, 0.03),
      0 0 0 22mm rgba(116, 131, 107, 0.02);
  }

  .brand {
    position: relative;
    z-index: 1;
    color: var(--sage-dark);
    font-family: var(--sans);
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  .cover-copy {
    position: relative;
    z-index: 1;
    margin-top: 18mm;
    margin-bottom: 18mm;
  }

  .kicker {
    display: block;
    color: var(--sage);
    font-family: var(--sans);
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .cover-title {
    max-width: 138mm;
    margin: 9mm 0 7mm;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 39pt;
    font-weight: 400;
    line-height: 1.14;
    letter-spacing: -0.04em;
  }

  .cover-deck {
    max-width: 105mm;
    margin: 0;
    color: #77796f;
    font-family: var(--book);
    font-size: 12.5pt;
    line-height: 1.8;
  }

  .cover-note {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 3mm 6mm;
    padding-top: 5mm;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .journal {
    width: 100%;
  }

  .journal-head {
    margin: 0 0 11mm;
    break-after: avoid;
    page-break-after: avoid;
  }

  .journal-head .kicker {
    margin-bottom: 3mm;
  }

  .journal-title {
    margin: 0 0 3mm;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 27pt;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  .journal-deck {
    margin: 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 8pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .contents {
    break-after: page;
    page-break-after: always;
  }

  .contents-head {
    margin: 0 0 7mm;
    break-after: avoid;
    page-break-after: avoid;
  }

  .contents-head h2 {
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 21pt;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  .contents-list {
    margin: 0;
    padding: 0;
    list-style: none;
    column-count: 2;
    column-gap: 12mm;
  }

  .contents-item {
    display: flex;
    align-items: baseline;
    gap: 3mm;
    padding: 2.2mm 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .contents-num {
    flex: 0 0 auto;
    color: var(--sage);
    font-family: var(--book);
    font-style: italic;
    font-size: 9.5pt;
  }

  .contents-title {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ink);
    font-size: 9.5pt;
  }

  .contents-date {
    flex: 0 0 auto;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 7pt;
    white-space: nowrap;
  }

  .entry {
    break-inside: auto;
    page-break-inside: auto;
  }

  .entry + .entry {
    margin-top: 13mm;
  }

  .entry-head {
    margin: 0 0 4.5mm;
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
    page-break-after: avoid;
  }

  .entry-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 3mm 6mm;
    margin-bottom: 3.5mm;
  }

  .entry-date {
    display: flex;
    align-items: center;
    gap: 3mm;
    color: var(--sage-dark);
    font-family: var(--sans);
    font-size: 7.5pt;
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  .entry-number {
    color: #a0aa98;
    font-family: var(--book);
    font-size: 11.5pt;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0;
  }

  .mood {
    display: inline-flex;
    align-items: center;
    padding: 1.4mm 3mm;
    border-radius: 20px;
    font-family: var(--sans);
    font-size: 7.5pt;
    font-weight: 600;
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
    margin: 0 0 3mm;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 22pt;
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: -0.03em;
    overflow-wrap: break-word;
    break-after: avoid;
    page-break-after: avoid;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2mm;
    margin: 0 0 4mm;
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
    page-break-after: avoid;
  }

  .tag {
    display: inline-block;
    padding: 1mm 2.5mm;
    background: #f0f1eb;
    border-radius: 3px;
    color: var(--sage-dark);
    font-family: var(--sans);
    font-size: 7pt;
    font-weight: 500;
  }

  .content {
    margin: 0;
    color: var(--body);
    font-family: var(--book);
    font-size: 10.5pt;
    line-height: 1.82;
    overflow-wrap: break-word;
    word-wrap: break-word;
    orphans: 3;
    widows: 3;
  }

  .content p {
    margin: 0 0 4.5mm;
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
    font-weight: 400;
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
    color: var(--sage-dark);
    font-family: var(--sans);
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.12em;
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
    border-radius: 3px;
    background: #f3f4ef;
    color: #6f7168;
    font-style: italic;
    line-height: 1.8;
  }

  .content hr {
    margin: 5.5mm 0;
    border: 0;
    border-top: 1px solid var(--line);
  }

  .content a {
    color: var(--sage-dark);
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

  .entry-endmark {
    margin-top: 5mm;
    color: #a1ad98;
    font-size: 8pt;
    text-align: center;
    break-before: avoid;
    page-break-before: avoid;
  }

  .empty {
    padding: 7mm;
    border-radius: 4px;
    background: #f3f4ef;
    color: var(--muted);
    font-style: italic;
    line-height: 1.8;
  }

  @media print {
    .cover {
      page-break-after: always;
      break-after: page;
    }

    .entry-meta,
    .entry-title,
    .tags,
    .content h2,
    .content h3,
    .content h4,
    .content h5,
    .content h6 {
      break-inside: avoid;
    }

    .content p,
    .content li,
    .content blockquote {
      orphans: 3;
      widows: 3;
    }
  }
`;

const renderJournalHtml = (entries, exportedOn) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const rangeLabel = buildRangeLabel(safeEntries);
  const countLabel = `${safeEntries.length} ${
    safeEntries.length === 1 ? "entry" : "entries"
  }`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="description" content="A personal collection of thoughts, moments and reflections.">
  <title>Chronicle — Personal Journal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400..600&family=Playfair+Display:ital,wght@0,400..700;1,400..600&display=swap" rel="stylesheet">
  <style>${journalStyles}</style>
</head>
<body>
  <section class="cover">
    <div class="brand">Chronicle</div>
    <div class="cover-copy">
      <span class="kicker">A personal journal</span>
      <p class="cover-title">Your days,<br>in your own words.</p>
      <p class="cover-deck">A collection of thoughts, moments, reflections, and little details that make life your own.</p>
    </div>
    <div class="cover-note">
      <span>${countLabel}</span>
      ${rangeLabel ? `<span>${escapeHtml(rangeLabel)}</span>` : ""}
      <span>Exported ${escapeHtml(exportedOn)}</span>
    </div>
  </section>

  <main class="journal">
    <header class="journal-head">
      <span class="kicker">Chronicle collection</span>
      <h1 class="journal-title">Your journal</h1>
      <p class="journal-deck">${countLabel}${rangeLabel ? ` · ${escapeHtml(rangeLabel)}` : ""}</p>
    </header>

    ${buildContentsHtml(safeEntries)}

    ${
      safeEntries.length
        ? safeEntries
            .map((entry, index) => buildEntryHtml(entry, index))
            .join("\n")
        : '<p class="empty">Your pages will gather here as you write.</p>'
    }
  </main>
</body>
</html>`;
};

module.exports = { renderJournalHtml };
