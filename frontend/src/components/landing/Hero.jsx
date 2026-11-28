import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

const WORDMARK = "Chronicle";

export default function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="pointer-events-none absolute inset-0 paper-texture opacity-80" />
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-sage-light/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-warm-beige/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none mb-6 select-none text-center font-serif text-[13vw] font-medium leading-none tracking-tight text-charcoal/[0.15] md:mb-0 lg:text-[150px]"
        >
          {WORDMARK.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="hero-wordmark-letter"
              style={{ animationDelay: `${0.12 + index * 0.07}s` }}
            >
              {letter}
            </span>
          ))}
          <span
            className="hero-wordmark-dot text-sage/65"
            style={{ animationDelay: "1.24s" }}
          >
            .
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex w-full max-w-4xl flex-col items-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-mega text-sage-deep"
            >
              <span className="h-px w-8 origin-left animate-draw-line bg-sage" />
              A private, end-to-end encrypted journal
            </motion.span>

            <AnimatedText
              onMount
              once={false}
              delay={0.22}
              stagger={0.045}
              lineStagger={0.16}
              mode="fade"
              as="h1"
              className="max-w-4xl text-center font-serif text-[42px] leading-[1.08] tracking-tight text-charcoal sm:text-6xl lg:text-[74px]"
              lines={[
                [{ text: "Make room for what" }],
                [
                  { text: "matters", italic: true, className: "text-sage" },
                  { text: "to you." },
                ],
              ]}
            />

            <Reveal
              delay={0.65}
              y={18}
              blur={false}
              className="mt-8 max-w-2xl"
            >
              <p className="text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                Give the day a place in your story. Reflect on what matters, and
                return to it knowing only you can read it.
              </p>
            </Reveal>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/auth?mode=register" className="btn-primary group">
                <span>Start your journal</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#privacy"
                className="group inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal"
              >
                <span>See how privacy works</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1 }} className="mt-8 max-w-sm text-sm font-light leading-relaxed text-charcoal-muted">
            A few quiet minutes can change how you remember an ordinary day.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-12 hidden justify-center md:flex"
        >
          <a
            href="#editor"
            className="group flex flex-col items-center gap-2 text-[10px] uppercase tracking-wide2 text-muted-gray transition-colors hover:text-charcoal"
          >
            Scroll to wander
            <span className="relative h-10 w-px overflow-hidden bg-hairline">
              <motion.span
                className="absolute inset-x-0 top-0 h-4 bg-sage"
                animate={reduce ? undefined : { y: [-16, 40] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
