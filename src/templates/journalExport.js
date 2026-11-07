const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// ==========================================
// MARKDOWN PARSING
// ==========================================

const HORIZONTAL_RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;

const INLINE_TOKEN =
  /(\[[^\]\n]+\]\([^\s)]+\)|\*\*[^\*\n]+\*\*|__[^\_\n]+__|\*[^\*\n]+\*|_[^\_\n]+_|\~\~[^\~\n]+\~\~|`[^`\n]+`)/g;

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

// ==========================================
// MARKDOWN BLOCK RENDERER
// ==========================================

const renderMarkdown = (value) => {
  const lines = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");

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
      const level = Math.min(heading[1].length + 2, 6);

      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);

      index += 1;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const quote = [];

      while (index < lines.length && BLOCKQUOTE.test(lines[index])) {
        quote.push(lines[index].match(BLOCKQUOTE)[1]);
        index += 1;
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
        index += 1;
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
      index += 1;
    }

    blocks.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
  }

  return blocks.join("\n");
};

// ==========================================
// MOOD STYLING
// ==========================================

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

// ==========================================
// JOURNAL ENTRY HTML
// ==========================================

const buildEntryHtml = (entry, index) => {
  const heading = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tags = (entry.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="entry">

      <div class="entry-topline">

        <div class="entry-date">
          <span class="entry-number">
            ${String(index + 1).padStart(2, "0")}
          </span>

          <time>${escapeHtml(heading)}</time>
        </div>

        ${
          entry.mood
            ? `
              <span class="mood mood-${moodTone(entry.mood)}">
                <span class="emoji">${moodEmoji(entry.mood)}</span>
                ${escapeHtml(entry.mood)}
              </span>
            `
            : ""
        }

      </div>

      <h2 class="entry-title">
        ${escapeHtml(entry.title || "Untitled entry")}
      </h2>

      ${tags ? `<div class="tags">${tags}</div>` : ""}

      <div class="content">
        ${renderMarkdown(entry.content)}
      </div>

      <div class="entry-endmark">✦</div>

    </article>
  `;
};

// ==========================================
// CHRONICLE PDF STYLES
// ==========================================

const journalStyles = `

  :root {
    --paper: #fcfbf8;
    --paper-deep: #f4f2ec;

    --ink: #292b27;
    --body: #454740;
    --muted: #85877d;

    --sage: #687a61;
    --sage-dark: #46583f;
    --sage-light: #edf0e9;

    --gold-light: #f5f0e4;
    --clay-light: #f4ebe5;
    --blue-light: #eaf0f2;

    --line: #e8e6df;
  }

  * {
    box-sizing: border-box;
  }

  @page {
    size: A4;
    margin: 19mm 21mm 20mm;
  }

  @page :first {
    margin: 0;
  }

  html {
    background: var(--paper);
  }

  body {
    margin: 0;
    padding: 0;

    background: var(--paper);
    color: var(--body);

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 10.5pt;
    line-height: 1.8;

    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;

    font-kerning: normal;
    text-rendering: optimizeLegibility;
  }

  /* COVER PAGE */

  .cover {
    width: 100%;
    min-height: 297mm;

    padding: 25mm 23mm 21mm;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    position: relative;
    overflow: hidden;

    page-break-after: always;
    break-after: page;

    color: var(--ink);

    background:
      radial-gradient(
        circle at 88% 13%,
        rgba(104, 122, 97, 0.13) 0,
        rgba(104, 122, 97, 0.13) 34mm,
        transparent 34.5mm
      ),
      linear-gradient(
        145deg,
        #fcfbf8 0%,
        #f7f6f0 65%,
        #efeee6 100%
      );
  }

  .cover::before {
    content: "";

    position: absolute;
    top: 0;
    left: 23mm;

    width: 1px;
    height: 100%;

    background: rgba(104, 122, 97, 0.12);
  }

  .cover::after {
    content: "";

    position: absolute;
    right: -35mm;
    bottom: 10mm;

    width: 110mm;
    height: 110mm;

    border: 1px solid rgba(104, 122, 97, 0.22);
    border-radius: 50%;

    box-shadow:
      0 0 0 13mm rgba(104, 122, 97, 0.035),
      0 0 0 26mm rgba(104, 122, 97, 0.025);
  }

  .brand {
    position: relative;
    z-index: 1;

    color: var(--sage-dark);

    font-family: Arial, sans-serif;
    font-size: 11pt;
    font-weight: 700;

    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .cover-copy {
    position: relative;
    z-index: 1;

    margin-top: 15mm;
    margin-bottom: 20mm;
  }

  .kicker {
    display: block;

    color: var(--sage);

    font-family: Arial, sans-serif;
    font-size: 8pt;
    font-weight: 600;

    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .cover h1 {
    max-width: 145mm;

    margin: 10mm 0 7mm;

    color: var(--ink);

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 39pt;
    font-weight: 400;

    line-height: 1.16;
    letter-spacing: -0.045em;
  }

  .cover-deck {
    max-width: 105mm;

    margin: 0;

    color: #73766c;

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 13pt;
    line-height: 1.8;
  }

  .cover-note {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: center;

    flex-wrap: wrap;
    gap: 4mm 8mm;

    padding-top: 5mm;

    border-top: 1px solid rgba(104, 122, 97, 0.35);

    color: var(--muted);

    font-family: Arial, sans-serif;
    font-size: 7.5pt;

    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* JOURNAL HEADER */

  .journal {
    width: 100%;
  }

  .contents-head {
    margin: 0 0 11mm;
    padding-bottom: 6mm;

    border-bottom: 1px solid var(--line);

    break-after: avoid;
    page-break-after: avoid;
  }

  .contents-head .kicker {
    margin-bottom: 3mm;
  }

  .contents-head h2 {
    margin: 0;

    color: var(--ink);

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 25pt;
    font-weight: 400;

    line-height: 1.3;
    letter-spacing: -0.025em;
  }

  /* JOURNAL ENTRY */

  .entry {
    position: relative;

    padding: 0 0 9mm;
    margin: 0 0 9mm;

    border-bottom: 1px solid var(--line);

    break-inside: auto;
    page-break-inside: auto;
  }

  .entry-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;

    flex-wrap: wrap;
    gap: 3mm 6mm;

    margin-bottom: 4mm;

    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
  }

  .entry-date {
    display: flex;
    align-items: center;
    gap: 3mm;

    color: var(--sage-dark);

    font-family: Arial, sans-serif;
    font-size: 8pt;
    font-weight: 600;

    letter-spacing: 0.055em;
  }

  .entry-number {
    color: #a0a995;

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 12pt;
    font-style: italic;
    font-weight: 400;
  }

  /* MOOD */

  .mood {
    display: inline-block;

    padding: 1.5mm 3mm;

    border-radius: 20px;

    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    font-weight: 600;

    letter-spacing: 0.015em;

    white-space: nowrap;
  }

  .emoji {
    margin-right: 1mm;

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

  /* ENTRY TITLE */

  .entry-title {
    margin: 0 0 3mm;

    color: var(--ink);

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 22pt;
    font-weight: 400;

    line-height: 1.3;
    letter-spacing: -0.025em;

    break-after: avoid;
    page-break-after: avoid;

    overflow-wrap: break-word;
  }

  /* TAGS */

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2mm;

    margin: 0 0 5mm;

    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
  }

  .tag {
    display: inline-block;

    padding: 1mm 2.5mm;

    background: #f0f1eb;
    border-radius: 3px;

    color: var(--sage-dark);

    font-family: Arial, sans-serif;
    font-size: 7pt;
    font-weight: 500;

    letter-spacing: 0.015em;
  }

  /* JOURNAL CONTENT */

  .content {
    margin: 0;

    color: var(--body);

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-size: 10.5pt;
    font-weight: 400;

    line-height: 1.85;

    overflow-wrap: break-word;
    word-wrap: break-word;

    orphans: 3;
    widows: 3;
  }

  .content p {
    margin: 0 0 4mm;
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

    font-family:
      Georgia,
      "Times New Roman",
      serif;

    font-weight: 400;
    line-height: 1.35;

    break-after: avoid;
    page-break-after: avoid;
  }

  .content h2 {
    font-size: 17pt;
  }

  .content h3 {
    font-size: 15pt;
  }

  .content h4 {
    font-size: 13pt;
  }

  .content h5 {
    font-size: 11.5pt;
    font-style: italic;
  }

  .content h6 {
    color: var(--sage-dark);

    font-family: Arial, sans-serif;
    font-size: 8pt;
    font-weight: 600;

    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  /* LISTS */

  .content ul,
  .content ol {
    margin: 2mm 0 4mm;
    padding-left: 7mm;
  }

  .content li {
    padding-left: 1mm;
    margin-bottom: 1.5mm;
  }

  .content li::marker {
    color: var(--sage);
  }

  /* QUOTES */

  .content blockquote {
    margin: 5mm 0;

    padding: 2mm 0 2mm 5mm;

    border-left: 2px solid #9eac95;

    color: #73776d;

    font-style: italic;
  }

  /* INLINE ELEMENTS */

  .content hr {
    margin: 6mm 0;

    border: 0;
    border-top: 1px solid var(--line);
  }

  .content a {
    color: var(--sage-dark);
    text-decoration: underline;
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

  /* ENTRY END MARK */

  .entry-endmark {
    margin-top: 6mm;

    color: #a1ad98;

    font-size: 9pt;
    text-align: center;
  }

  /* EMPTY JOURNAL */

  .empty {
    margin-top: 12mm;
    padding: 5mm 6mm;

    border-left: 2px solid #a1ad98;

    background: #f3f4ef;

    color: var(--muted);

    font-style: italic;
    line-height: 1.8;
  }

  /* PRINT OPTIMIZATION */

  @media print {

    body {
      background: var(--paper);
    }

    .cover {
      page-break-after: always;
      break-after: page;
    }

    .entry-topline,
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

    a {
      color: inherit;
    }
  }

`;

// ==========================================
// COMPLETE JOURNAL HTML GENERATOR
// ==========================================

const renderJournalHtml = (entries, exportedOn) => `
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <meta name="color-scheme" content="light">

  <title>Chronicle — Personal Journal</title>

  <style>
    ${journalStyles}
  </style>
</head>

<body>

  <!-- COVER PAGE -->

  <section class="cover">

    <div class="brand">
      Chronicle
    </div>

    <div class="cover-copy">

      <span class="kicker">
        A personal journal
      </span>

      <h1>
        Your days,<br>
        in your own words.
      </h1>

      <p class="cover-deck">
        A collection of thoughts, moments, reflections,
        and little details that make life your own.
      </p>

    </div>

    <div class="cover-note">

      <span>
        ${entries.length}
        ${entries.length === 1 ? "entry" : "entries"}
      </span>

      <span>
        Exported ${escapeHtml(exportedOn)}
      </span>

    </div>

  </section>

  <!-- JOURNAL CONTENT -->

  <main class="journal">

    <header class="contents-head">

      <span class="kicker">
        Chronicle collection
      </span>

      <h2>
        Pages to return to.
      </h2>

    </header>

    ${
      entries.length
        ? entries.map(buildEntryHtml).join("\n")
        : `
          <p class="empty">
            Your pages will gather here as you write.
          </p>
        `
    }

  </main>

</body>
</html>
`;

// ==========================================
// MODULE EXPORT
// ==========================================

module.exports = {
  renderJournalHtml,
};
