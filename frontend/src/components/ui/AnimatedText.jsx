import { motion } from "framer-motion";

const easing = [0.16, 1, 0.3, 1];

const wordVariants = {
  hidden: { y: "112%", opacity: 0, rotate: 1.5 },
  visible: {
    y: "0%",
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.9, ease: easing },
  },
};

export default function AnimatedText({
  parts,
  as: Tag = "h1",
  className = "",
  delay = 0,
  stagger = 0.045,
  once = true,
  onMount = false,
  amount = 0.45,
}) {
  const normalized = Array.isArray(parts) ? parts : [{ text: parts }];
  const words = [];

  normalized.forEach((part, partIndex) => {
    const pieces = String(part.text).split(/\s+/).filter(Boolean);

    pieces.forEach((word, wordIndex) => {
      words.push({
        id: `${partIndex}-${wordIndex}-${word}`,
        text: word,
        className: part.className || "",
        italic: Boolean(part.italic),
      });
    });
  });

  const viewProps = onMount
    ? { initial: "hidden", animate: "visible" }
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once, amount },
      };

  return (
    <Tag
      className={className}
      aria-label={normalized.map((part) => part.text).join(" ")}
    >
      <motion.span
        aria-hidden="true"
        className="inline"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
        {...viewProps}
      >
        {words.map((word, index) => (
          <span
            key={word.id}
            className="inline-flex overflow-hidden pb-[0.12em] align-bottom"
            style={{
              marginBottom: "-0.12em",
              marginRight: index === words.length - 1 ? 0 : "0.26em",
            }}
          >
            <motion.span
              variants={wordVariants}
              className={[
                "inline-block",
                word.italic ? "font-serif italic font-normal" : "",
                word.className,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {word.text}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
