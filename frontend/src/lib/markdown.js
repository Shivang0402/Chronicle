const HORIZONTAL_RULE = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+\.\s+(.*)$/;

const stripInline = (text) =>
  text
    .replace(/!\[[^\]]*\]\([^)\s]+\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

export const stripMarkdown = (value) => {
  const text = String(value || "");

  if (!text) return "";

  return stripInline(
    text
      .split("\n")
      .map((line) => {
        if (HORIZONTAL_RULE.test(line)) return "";
        return line
          .replace(/^\s*#{1,6}\s+/, "")
          .replace(/^\s*>\s?/, "")
          .replace(/^\s*[-*+]\s+/, "")
          .replace(/^\s*\d+\.\s+/, "");
      })
      .join(" "),
  )
    .replace(/\s+/g, " ")
    .trim();
};

export const parseMarkdownBlocks = (value) => {
  const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (HORIZONTAL_RULE.test(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const heading = line.match(HEADING);

    if (heading) {
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length + 1, 6),
        text: heading[2],
      });
      index += 1;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const quoteLines = [];

      while (index < lines.length && BLOCKQUOTE.test(lines[index])) {
        quoteLines.push(lines[index].match(BLOCKQUOTE)[1]);
        index += 1;
      }

      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    if (BULLET.test(line)) {
      const items = [];

      while (index < lines.length && BULLET.test(lines[index])) {
        items.push(lines[index].match(BULLET)[1]);
        index += 1;
      }

      blocks.push({ type: "ul", items });
      continue;
    }

    if (ORDERED.test(line)) {
      const items = [];

      while (index < lines.length && ORDERED.test(lines[index])) {
        items.push(lines[index].match(ORDERED)[1]);
        index += 1;
      }

      blocks.push({ type: "ol", items });
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

    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraph });
    } else {
      index += 1;
    }
  }

  return blocks;
};
