import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown, ChevronUp, Feather } from "lucide-react";
import { useState } from "react";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

const pages = [
  {
    date: "Friday, October 24, 2025",
    time: "8:16 pm",
    mood: "Reflective",
    title: "A slower morning",
    tags: ["Morning", "SmallThings", "Home"],
    paragraphs: [
      "I woke before the alarm and listened to rain move along the gutter. The room was blue with early light, and for once I did not reach for my phone.",
      "I made tea and opened the kitchen window. Wet pavement and jasmine drifted in from the balcony. The basil had grown two new leaves while I was busy looking elsewhere.",
      "The day grew busy, but I kept returning to that quiet beginning. It did not change my plans. It changed the pace at which I met them.",
    ],
    reading: "2 min read",
  },
  {
    date: "Wednesday, October 22, 2025",
    time: "6:42 pm",
    mood: "Peaceful",
    title: "The river kept its own time",
    tags: ["Walks", "Evening", "Autumn"],
    paragraphs: [
      "I took the long way home beside the river. The path was scattered with copper leaves, and the water carried the last light without seeming to hurry.",
      "A dog kept circling the same patch of grass while its person read on a bench. We all seemed content to be going nowhere in particular.",
      "By the time I reached the bridge, the air had turned cool. I brought that calm home with me, folded into the pockets of my coat.",
    ],
    reading: "2 min read",
  },
  {
    date: "Sunday, October 19, 2025",
    time: "9:03 pm",
    mood: "Grateful",
    title: "A table full of small things",
    tags: ["Friends", "Sunday", "Home"],
    paragraphs: [
      "We pushed the table against the window to make room for everyone. Dinner was late, one chair wobbled, and the bread came out darker than I meant it to.",
      "Nobody minded. The conversation wandered from old school stories to what we might plant when spring comes. Someone wrapped the extra bread for the walk home.",
      "After the door closed, the kitchen was a small kind of mess. I left the cups until morning and let the warmth of the evening stay a little longer.",
    ],
    reading: "3 min read",
  },
];

export default function WritingCanvas() {
  const [activePage, setActivePage] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const page = pages[activePage];

  const turnPage = (nextDirection) => {
    setDirection(nextDirection);
    setActivePage((current) => (current + nextDirection + pages.length) % pages.length);
  };

  const handleRailWheel = (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    turnPage(event.deltaY > 0 ? 1 : -1);
  };

  return (
    <section id="editor" className="scroll-mt-24 bg-ivory py-10 sm:py-14 lg:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 sm:px-10 lg:grid-cols-12 lg:gap-12 lg:px-16">
        <div className="lg:col-span-4">
          <Reveal variant="down" y={12} blur={false}>
            <span className="eyebrow mb-3 block">The Writing Canvas</span>
          </Reveal>
          <AnimatedText
            as="h2"
            mode="slide"
            once={false}
            delay={0.1}
            className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
            parts={[{ text: "Give your thoughts room to unfold." }]}
          />
          <Reveal variant="down" delay={0.24} y={14} blur={false}>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-charcoal-muted sm:text-base">
              A quiet place to catch the detail you almost missed, then return to it when the day has softened around the edges.
            </p>
          </Reveal>
          <Reveal variant="fade" delay={0.3} y={8} blur={false}>
            <p className="mt-6 border-l border-sage/50 pl-4 font-serif text-sm italic leading-relaxed text-charcoal-muted">
              One page at a time. One ordinary day, made worth remembering.
            </p>
          </Reveal>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem] items-stretch gap-5 sm:grid-cols-[minmax(0,1fr)_3rem] sm:gap-7 lg:col-span-8">
          <div className="relative min-w-0 [perspective:1800px]">
            <div aria-hidden="true" className="journal-sheet journal-stack-back absolute inset-0 border border-hairline/70 bg-warm-beige" />
            <div aria-hidden="true" className="journal-sheet journal-stack-middle absolute inset-0 border border-hairline/70 bg-paper" />
            <div aria-hidden="true" className="journal-sheet journal-stack-front absolute inset-0 border border-hairline/70 bg-paper" />

            <div className="relative z-10 min-h-[620px] sm:min-h-[560px] lg:min-h-[520px]">
            <AnimatePresence mode="sync" initial={false} custom={direction}>
              <motion.article
                key={activePage}
                custom={direction}
                initial={reduce ? { opacity: 1, x: -3, y: 3, rotate: -0.8, scale: 1, zIndex: 2 } : { opacity: 1, x: direction > 0 ? 30 : -30, y: direction > 0 ? -4 : 4, rotate: direction > 0 ? 2.2 : -2.2, scale: 0.985, zIndex: 2 }}
                animate={{ opacity: 1, x: -3, y: 3, rotate: -0.8, scale: 1, zIndex: 2 }}
                exit={{ opacity: 0.995, x: -3, y: 3, rotate: -0.8, zIndex: 1 }}
                transition={{ duration: reduce ? 0.12 : 0.62, ease: [0.2, 0.75, 0.25, 1] }}
                style={{ transformOrigin: "4% 96%" }}
                className="page-turn-card journal-sheet absolute inset-0 border border-hairline bg-paper px-4 py-5 sm:px-8 sm:py-8 lg:px-10"
                aria-live="polite"
              >
                <div className="mx-auto max-w-2xl">
                  <div className="mb-3 flex items-center justify-between gap-3 text-[8px] font-medium uppercase tracking-[0.18em] text-muted-gray sm:mb-5 sm:text-[9px]">
                    <span>Chronicle · Personal journal</span>
                    <span>{String(activePage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-y border-hairline py-3 text-[8px] uppercase tracking-wider text-muted-gray sm:gap-3 sm:py-4 sm:text-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-sage" />
                      {page.date} <span aria-hidden="true">·</span> {page.time}
                    </span>
                    <span className="rounded-full bg-sage-subtle px-2.5 py-1 font-medium normal-case tracking-normal text-sage-deep sm:px-3">{page.mood}</span>
                  </div>

                  <div className="pb-1 pt-5 sm:pt-7">
                    <h3 className="font-serif text-2xl leading-tight tracking-tight text-charcoal sm:text-4xl">{page.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-muted-gray sm:text-[10px]">
                      {page.tags.map((tag, index) => (
                        <span key={tag} className="inline-flex items-center gap-2">
                          {index > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-sage/60" />}
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3 font-serif text-[13px] font-light leading-[1.75] text-charcoal sm:mt-6 sm:space-y-4 sm:text-base sm:leading-[1.85]">
                      {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3 text-[8px] uppercase tracking-wider text-muted-gray sm:mt-6 sm:pt-4 sm:text-[9px]">
                      <span className="inline-flex items-center gap-2"><Feather className="h-3 w-3 text-sage" />Written slowly, kept here</span>
                      <span>{page.reading} <span aria-hidden="true">·</span> Kept in your journal</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
            </div>
          </div>

          <div
            onWheel={handleRailWheel}
            className="relative z-20 flex flex-col items-center justify-center gap-3 rounded-full border border-hairline/80 bg-warm-beige/75 py-3 text-charcoal-muted sm:gap-4 sm:py-4"
            aria-label="Journal page controls. Scroll here to turn pages."
          >
            <button type="button" onClick={() => turnPage(-1)} aria-label="Previous journal page" className="grid h-7 w-7 place-items-center rounded-full bg-paper text-sage-deep shadow-sm hover:text-charcoal sm:h-8 sm:w-8">
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="[writing-mode:vertical-rl] text-[8px] uppercase tracking-[0.16em] sm:text-[9px]">Turn the page</span>
            <button type="button" onClick={() => turnPage(1)} aria-label="Next journal page" className="grid h-7 w-7 place-items-center rounded-full bg-paper text-sage-deep shadow-sm hover:text-charcoal sm:h-8 sm:w-8">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
