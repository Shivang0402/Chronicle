import { Fragment } from "react";
import { useEffect, useState } from "react";
import { parseMarkdownBlocks } from "../../lib/markdown";

function EncryptedImage({ reference, alt, resolveImage, className }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (!resolveImage) return undefined;
    resolveImage(reference).then((url) => {
      objectUrl = url;
      if (active) setSrc(url);
      else URL.revokeObjectURL(url);
    }).catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reference, resolveImage]);
  return src ? <img src={src} alt={alt} loading="lazy" className={className} /> : <span className="my-4 block rounded-xl border border-hairline bg-warm-beige/60 p-4 text-xs text-charcoal-muted">{alt || "Encrypted image"} is loading or unavailable.</span>;
}

const INLINE_TOKEN =
  /(!\[[^\]\n]*\]\([^)\s]+\)|\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`)/g;

const safeHref = (value) => {
  const href = String(value || "").trim();

  if (/^(https?:|mailto:)/i.test(href)) return href;

  return "#";
};

const safeImageSrc = (value) => {
  const src = String(value || "").trim();

  return /^https?:/i.test(src) ? src : "";
};

const renderInline = (text, keyPrefix, resolveImage) =>
  String(text)
    .split(INLINE_TOKEN)
    .filter((part) => part !== "")
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      const image = part.match(/^!\[([^\]\n]*)\]\(([^)\s]+)\)$/);

      if (image) {
        const src = safeImageSrc(image[2]);

        if (!src) return null;

        if (src.startsWith("chronicle-e2ee:")) {
          return <EncryptedImage key={key} reference={src} alt={image[1]} resolveImage={resolveImage} className="my-4 max-h-[28rem] w-full rounded-xl border border-hairline object-cover" />;
        }

        return (
          <img
            key={key}
            src={src}
            alt={image[1]}
            loading="lazy"
            className="my-4 max-h-[28rem] w-full rounded-xl border border-hairline object-cover"
          />
        );
      }

      const link = part.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);

      if (link) {
        return (
          <a
            key={key}
            href={safeHref(link[2])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-deep underline decoration-sage/50 underline-offset-2 transition-colors hover:text-charcoal"
          >
            {link[1]}
          </a>
        );
      }

      if (/^\*\*[\s\S]+\*\*$/.test(part)) {
        return (
          <strong key={key} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (/^__[\s\S]+__$/.test(part)) {
        return <u key={key}>{part.slice(2, -2)}</u>;
      }

      if (/^\*[\s\S]+\*$/.test(part)) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }

      if (/^_[\s\S]+_$/.test(part)) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }

      if (/^~~[\s\S]+~~$/.test(part)) {
        return <del key={key}>{part.slice(2, -2)}</del>;
      }

      if (/^`[\s\S]+`$/.test(part)) {
        return (
          <code
            key={key}
            className="rounded bg-warm-beige px-1 py-0.5 font-mono text-[0.88em]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      const lines = part.split("\n");

      if (lines.length > 1) {
        return (
          <Fragment key={key}>
            {lines.map((line, lineIndex) => (
              <Fragment key={`${key}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Fragment>
        );
      }

      return <Fragment key={key}>{part}</Fragment>;
    });

const HEADING_CLASSES = {
  2: "mb-3 font-serif text-2xl leading-snug tracking-tight text-charcoal",
  3: "mb-2.5 font-serif text-xl leading-snug tracking-tight text-charcoal",
  4: "mb-2 font-serif text-lg leading-snug text-charcoal",
  5: "mb-2 font-sans text-sm font-medium text-charcoal",
  6: "mb-2 font-sans text-[11px] font-medium uppercase tracking-wider text-muted-gray",
};

const renderLines = (lines, keyPrefix, resolveImage) =>
  lines.map((line, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {index > 0 && <br />}
      {renderInline(line, `${keyPrefix}-${index}`, resolveImage)}
    </Fragment>
  ));

export default function FormattedContent({ content, className = "", resolveImage }) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.type === "hr") {
          return <hr key={key} className="my-6 border-hairline" />;
        }

        if (block.type === "heading") {
          const Tag = `h${block.level}`;

          return (
            <Tag key={key} className={HEADING_CLASSES[block.level]}>
              {renderInline(block.text, key, resolveImage)}
            </Tag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="my-5 border-l-2 border-sage/50 pl-4 italic text-charcoal-muted"
            >
              {renderLines(block.lines, key, resolveImage)}
            </blockquote>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={key} className="mb-4 list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>
                  {renderInline(item, `${key}-${itemIndex}`, resolveImage)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={key} className="mb-4 list-decimal space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>
                  {renderInline(item, `${key}-${itemIndex}`, resolveImage)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={key} className="mb-4 last:mb-0">
            {renderLines(block.lines, key, resolveImage)}
          </p>
        );
      })}
    </div>
  );
}
