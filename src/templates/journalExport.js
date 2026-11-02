const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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

  return `<article class="entry">
    <div class="entry-heading">
      <div class="entry-date"><span class="entry-number">${String(index + 1).padStart(2, "0")}</span><time>${escapeHtml(heading)}</time></div>
      ${entry.mood ? `<span class="mood mood-${moodTone(entry.mood)}"><span class="emoji">${moodEmoji(entry.mood)}</span>${escapeHtml(entry.mood)}</span>` : ""}
    </div>
    <h2 class="title">${escapeHtml(entry.title || "Untitled entry")}</h2>
    ${tags ? `<div class="tags">${tags}</div>` : ""}
    <p class="content">${escapeHtml(entry.content)}</p>
  </article>`;
};

const journalStyles = `
  :root { --ivory: #f8f7f3; --paper: #fdfcf9; --ink: #252622; --muted: #66685f; --sage: #50614b; --sage-pale: #e8efe6; --hairline: #e5e3dc; }
  * { box-sizing: border-box; }
  @page { size: A4; margin: 24mm 18mm 22mm; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: Georgia, "Times New Roman", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", serif; line-height: 1.7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover { min-height: 246mm; padding: 18mm 12mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; background: radial-gradient(circle at 88% 12%, #e8efe6 0, #e8efe6 18%, transparent 18.2%), linear-gradient(145deg, #fdfcf9 0%, #f8f7f3 72%, #f0eee7 100%); position: relative; overflow: hidden; }
  .cover::after { content: ""; position: absolute; right: -30mm; bottom: 12mm; width: 95mm; height: 95mm; border: 1px solid rgba(80,97,75,.2); border-radius: 50%; box-shadow: 0 0 0 12mm rgba(80,97,75,.035), 0 0 0 24mm rgba(80,97,75,.025); }
  .brand { color: var(--sage); font: 600 9pt Arial, sans-serif; letter-spacing: .28em; text-transform: uppercase; }
  .cover-copy { position: relative; z-index: 1; margin-top: 24mm; }
  .kicker { color: var(--sage); font: 600 8pt Arial, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
  h1 { max-width: 145mm; margin: 8mm 0 5mm; font-size: 40pt; font-weight: 400; line-height: 1.12; letter-spacing: -.035em; }
  .cover-deck { max-width: 110mm; color: var(--muted); font-size: 13pt; line-height: 1.7; }
  .cover-note { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12mm; border-top: 1px solid rgba(80,97,75,.3); padding-top: 5mm; color: var(--muted); font: 8pt Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; }
  .contents-head { margin: 0 0 8mm; padding-bottom: 5mm; border-bottom: 1px solid var(--hairline); }
  .contents-head .kicker { display: block; margin-bottom: 2mm; }
  .contents-head h2 { margin: 0; font-size: 23pt; font-weight: 400; }
  .entry { padding: 7mm 0 8mm; border-bottom: 1px solid var(--hairline); break-inside: auto; }
  .entry-heading { display: flex; align-items: center; justify-content: space-between; gap: 8mm; margin-bottom: 3mm; break-after: avoid; }
  .entry-date { display: flex; align-items: center; gap: 3mm; color: var(--sage); font: 600 8pt Arial, sans-serif; letter-spacing: .08em; }
  .entry-number { color: #9ba995; font: italic 11pt Georgia, serif; }
  .mood { border-radius: 99px; padding: 1.5mm 3mm; font: 600 7.5pt Arial, sans-serif; }
  .emoji { margin-right: 1.5mm; font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
  .mood-sage { background: var(--sage-pale); color: #40513b; }
  .mood-gold { background: #f4ecd9; color: #806331; }
  .mood-clay { background: #f4e5dc; color: #915e43; }
  .mood-blue { background: #e5edf0; color: #4c6873; }
  .title { margin: 0 0 2mm; color: var(--ink); font-size: 21pt; font-weight: 400; line-height: 1.28; break-after: avoid; }
  .tags { display: flex; flex-wrap: wrap; gap: 2mm; margin-bottom: 4mm; break-after: avoid; }
  .tag { color: var(--sage); background: #f1f3ee; border-radius: 2px; padding: 1mm 2mm; font: 7pt Arial, sans-serif; }
  .content { margin: 0; color: #41433d; font-size: 11pt; line-height: 1.85; white-space: pre-wrap; overflow-wrap: anywhere; }
  .empty { margin-top: 12mm; border-left: 2px solid #a6b19f; padding: 4mm 5mm; color: var(--muted); background: #f6f7f3; font-style: italic; }
`;

const renderJournalHtml = (entries, exportedOn) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light">
<style>${journalStyles}</style>
</head>
<body>
  <section class="cover">
    <div class="brand">Chronicle</div>
    <div class="cover-copy">
      <span class="kicker">A personal journal</span>
      <h1>Your days,<br>in your own words.</h1>
      <p class="cover-deck">A collection of thoughts, moments, and small details worth keeping.</p>
    </div>
    <div class="cover-note"><span>${entries.length} ${entries.length === 1 ? "entry" : "entries"}</span><span>Exported ${escapeHtml(exportedOn)}</span></div>
  </section>
  <header class="contents-head"><span class="kicker">Your journal</span><h2>Pages to return to</h2></header>
  ${entries.length ? entries.map(buildEntryHtml).join("\n") : '<p class="empty">Your pages will gather here as you write.</p>'}
</body>
</html>`;

module.exports = { renderJournalHtml };
