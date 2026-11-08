import { motion, useReducedMotion } from "framer-motion";
import useInViewOnce from "../../hooks/useInViewOnce";

const easing = [0.16, 1, 0.3, 1];

const wordHidden = (mode, reduce) => {
  if (reduce) return { opacity: 0 };

  switch (mode) {
    case "fade":
      return { opacity: 0, filter: "blur(8px)" };
    case "scale":
      return { opacity: 0, scale: 0.82 };
    case "slide":
      return { opacity: 0, x: -18 };
    case "blur":
      return { opacity: 0, filter: "blur(12px)" };
    case "tilt":
      return { opacity: 0, y: "70%", rotate: 3 };
    case "drop":
      return { opacity: 0, y: "-90%", rotate: -1.5 };
    default:
      return { y: "112%", opacity: 0, rotate: 1.5 };
  }
};

const wordVisible = (mode, reduce) => {
  if (reduce) {
    return { opacity: 1, transition: { duration: 0.01, ease: "easeOut" } };
  }

  return {
    y: ["rise", "drop", "tilt"].includes(mode) ? "0%" : 0,
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: easing },
  };
};

const toParts = (value) => (Array.isArray(value) ? value : [{ text: value }]);

const buildWords = (parts) => {
  const words = [];

  toParts(parts).forEach((part, partIndex) => {
    String(part.text)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, wordIndex) => {
        words.push({
          id: `${partIndex}-${wordIndex}-${word}`,
          text: word,
          className: part.className || "",
          italic: Boolean(part.italic),
        });
      });
  });

  return words;
};

export default function AnimatedText({
  parts = [],
  lines,
  as: Tag = "h1",
  className = "",
  delay = 0,
  stagger = 0.04,
  lineStagger = 0.14,
  mode = "rise",
  once = true,
  onMount = false,
  amount = 0.15,
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const show = onMount || reduce || inView;
  const lineWords = lines
    ? lines.map((line) => buildWords(line))
    : [buildWords(parts)];
  const label = lineWords
    .map((words) => words.map((word) => word.text).join(" "))
    .join(" ");

  return (
    <Tag className={className} aria-label={label}>
      <motion.span
        ref={ref}
        aria-hidden="true"
        className="block"
        initial="hidden"
        animate={show ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduce ? 0 : lineStagger,
              delayChildren: reduce ? 0 : delay,
            },
          },
        }}
      >
        {lineWords.map((words, lineIndex) => (
          <motion.span
            key={lineIndex}
            className="block"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduce ? 0 : stagger },
              },
            }}
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
                  variants={{
                    hidden: wordHidden(mode, reduce),
                    visible: wordVisible(mode, reduce),
                  }}
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
        ))}
      </motion.span>
    </Tag>
  );
}
