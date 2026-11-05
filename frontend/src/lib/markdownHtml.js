import { parseMarkdownBlocks } from "./markdown";

const INLINE_TOKEN =
  /(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`)/g;

const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DIV",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "UL",
]);

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const safeHref = (value) => {
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

export const markdownToHtml = (value) =>
  parseMarkdownBlocks(value)
    .map((block) => {
      if (block.type === "hr") return "<hr>";

      if (block.type === "heading") {
        return `<h${block.level}>${renderInline(block.text)}</h${block.level}>`;
      }

      if (block.type === "quote") {
        return `<blockquote>${block.lines
          .map(renderInline)
          .join("<br>")}</blockquote>`;
      }

      if (block.type === "ul" || block.type === "ol") {
        const items = block.items
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("");

        return `<${block.type}>${items}</${block.type}>`;
      }

      return `<p>${block.lines.map(renderInline).join("<br>")}</p>`;
    })
    .join("");

const serializeInline = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent.replaceAll("\u00a0", " ");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName;

  if (tag === "BR") return "\n";

  const inner = Array.from(node.childNodes).map(serializeInline).join("");

  if (tag === "STRONG" || tag === "B") {
    return inner.trim() ? `**${inner}**` : inner;
  }

  if (tag === "EM" || tag === "I") {
    return inner.trim() ? `*${inner}*` : inner;
  }

  if (tag === "U") {
    return inner.trim() ? `__${inner}__` : inner;
  }

  if (tag === "S" || tag === "STRIKE" || tag === "DEL") {
    return inner.trim() ? `~~${inner}~~` : inner;
  }

  if (tag === "CODE") {
    return inner.trim() ? `\`${inner}\`` : inner;
  }

  if (tag === "A") {
    const href = safeHref(node.getAttribute("href"));

    return href && inner.trim() ? `[${inner}](${href})` : inner;
  }

  return inner;
};

const serializeInlineChildren = (element) =>
  Array.from(element.childNodes).map(serializeInline).join("");

const serializeBlock = (element) => {
  const tag = element.tagName;

  if (tag === "HR") return "---";

  if (/^H[1-6]$/.test(tag)) {
    const level = Math.max(Number(tag[1]) - 1, 1);
    const text = serializeInlineChildren(element).trim();

    return text ? `${"#".repeat(level)} ${text}` : "";
  }

  if (tag === "BLOCKQUOTE") {
    const inner =
      serializeBlocks(element) || serializeInlineChildren(element).trim();

    return inner
      .split("\n")
      .map((line) => (line ? `> ${line}` : ">"))
      .join("\n");
  }

  if (tag === "UL" || tag === "OL") {
    const items = Array.from(element.children).filter(
      (child) => child.tagName === "LI",
    );

    return items
      .map((item, index) => {
        const prefix = tag === "OL" ? `${index + 1}. ` : "- ";
        const body =
          serializeBlocks(item) || serializeInlineChildren(item).trim();

        if (!body) return "";

        return body
          .split("\n")
          .map((line, lineIndex) =>
            lineIndex === 0 ? `${prefix}${line}` : `  ${line}`,
          )
          .join("\n");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (tag === "PRE") {
    const code = element.textContent.replace(/\n$/, "");

    return code ? `\`\`\`\n${code}\n\`\`\`` : "";
  }

  if (tag === "P" || tag === "DIV") {
    const hasBlockChildren = Array.from(element.children).some((child) =>
      BLOCK_TAGS.has(child.tagName),
    );

    if (hasBlockChildren) return serializeBlocks(element);

    return serializeInlineChildren(element).trim();
  }

  return serializeBlocks(element) || serializeInlineChildren(element).trim();
};

function serializeBlocks(parent) {
  const blocks = [];
  let buffer = "";

  const flush = () => {
    const text = buffer.replace(/\u00a0/g, " ").trim();
    buffer = "";

    if (text) blocks.push(text);
  };

  for (const child of parent.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      buffer += child.textContent.replaceAll("\u00a0", " ");
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    if (BLOCK_TAGS.has(child.tagName)) {
      flush();

      const block = serializeBlock(child);

      if (block) blocks.push(block);
    } else {
      buffer += serializeInline(child);
    }
  }

  flush();

  return blocks.join("\n\n");
}

export const htmlToMarkdown = (element) => {
  if (!element) return "";

  return serializeBlocks(element).replace(/\n{3,}/g, "\n\n").trim();
};
