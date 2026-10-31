import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RotatingWord({
  words,
  interval = 2800,
  className = "",
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={`relative inline-grid overflow-hidden align-bottom ${className}`}
      style={{ height: "1.3em" }}
      aria-label={words[index]}
    >
      {words.map((word, wordIndex) => {
        const active = wordIndex === index;

        return (
          <motion.span
            key={word}
            aria-hidden="true"
            initial={false}
            animate={{
              y: active ? "0%" : wordIndex < index ? "-115%" : "115%",
              opacity: active ? 1 : 0,
            }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="col-start-1 row-start-1 inline-block whitespace-nowrap"
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}
