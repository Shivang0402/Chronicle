import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealImage } from "../ui/Reveal";

export default function Hero() {
  const imageRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-4%", "5%"],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1.06, 1.01],
  );

  return (
    <section className="relative overflow-hidden pb-20 pt-8 md:pb-32 md:pt-12">
      <div className="pointer-events-none absolute inset-0 paper-texture opacity-80" />
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-sage-light/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-warm-beige/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none mb-6 select-none text-center font-serif text-[13vw] font-medium uppercase leading-none tracking-[0.12em] text-charcoal/[0.11] md:mb-0 md:text-left lg:text-[150px]"
        >
          CHRONICLE
        </motion.div>

        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col justify-end lg:col-span-8">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-mega text-sage-deep"
            >
              <span className="h-px w-8 origin-left animate-draw-line bg-sage" />
              A journal for the life you’re living
            </motion.span>

            <AnimatedText
              onMount
              once={false}
              delay={0.22}
              stagger={0.045}
              lineStagger={0.16}
              as="h1"
              className="max-w-4xl font-serif text-[42px] leading-[1.08] tracking-tight text-charcoal sm:text-6xl lg:text-[74px]"
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
                Give the day a place in your story. Find room to reflect, notice
                what matters, and return to the moments you want to keep.
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
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link to="/auth?mode=register" className="btn-primary group">
                <span>Start your journal</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#experience"
                className="group inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal"
              >
                <span>Explore Chronicle</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </div>

          <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 1 }} className="max-w-xs text-sm font-light leading-relaxed text-charcoal-muted lg:col-span-4 lg:justify-self-end lg:text-right">
            A few quiet minutes can change how you remember an ordinary day.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch overflow-hidden border border-hairline bg-paper shadow-paper md:mt-16 lg:grid-cols-12">
          <div
            className="group relative lg:col-span-7"
            ref={imageRef}
          >
            <RevealImage
              variant="fade"
              onMount
              delay={0.75}
              y={0}
              duration={1}
              className="h-full"
            >
              <div className="aspect-[16/10] overflow-hidden bg-hairline">
                <motion.img
                  src="/images/hero-journal.jpg"
                  alt="Open linen journal on a sunlit wooden writing desk"
                  style={{ y: imageY, scale: imageScale }}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.035]"
                />
              </div>
            </RevealImage>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.15 }}
              className="flex items-center justify-between gap-4 px-4 py-3 text-[11px] text-muted-gray sm:px-6"
            >
              <span className="font-serif italic text-charcoal">
                Study of morning light and desk journal
              </span>
              <span className="uppercase tracking-wider">October 14th</span>
            </motion.div>
          </div>

          <RevealImage
            onMount
            delay={0.95}
            y={24}
            duration={1.05}
            className="relative z-10 flex items-center lg:col-span-5"
          >
            <div className="relative w-full p-7 sm:p-9 lg:p-10">
              <div className="mb-7 flex items-center gap-2 text-[10px] uppercase tracking-wider text-sage-deep">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sage" />
                A page from the journal
              </div>

              <div className="flex items-center justify-between border-b border-hairline pb-6 text-[11px]">
                <span className="uppercase tracking-widest text-muted-gray">
                  October 14 • 8:15 PM
                </span>
                <span className="font-medium tracking-wide text-sage-deep">
                  #Peaceful
                </span>
              </div>

              <h2 className="mt-8 font-serif text-2xl leading-snug text-charcoal sm:text-3xl">
                October evening by the window
              </h2>
              <p className="mt-5 text-sm font-light leading-relaxed text-charcoal-muted sm:text-base">
                The morning light was a soft reminder to slow down. The tea
                steeped quietly as thoughts began to settle. There is a deep,
                quiet gratitude found in this unhurried space.
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5 text-[11px] text-muted-gray">
                <div className="flex items-center gap-3">
                  <span>412 words</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-gray" />
                  <span>3 min read</span>
                </div>
                <span className="flex items-center gap-1.5 text-sage-deep">
                  <BookOpen className="h-3 w-3" />
                  Entry
                </span>
              </div>
            </div>

          </RevealImage>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-12 hidden justify-center md:flex"
        >
          <a
            href="#experience"
            className="group flex flex-col items-center gap-2 text-[10px] uppercase tracking-wide2 text-muted-gray transition-colors hover:text-charcoal"
          >
            Scroll to wander
            <span className="relative h-10 w-px overflow-hidden bg-hairline">
              <motion.span
                className="absolute inset-x-0 top-0 h-4 bg-sage"
                animate={{ y: [-16, 40] }}
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
