import { motion, useReducedMotion } from "framer-motion";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const reflections = [
  ["Writing rhythm", "See how your entries gather across days and seasons."],
  ["Moods", "Notice the feelings you choose to mark in your pages."],
  ["Returning themes", "Find the topics and tags that appear again and again."],
];

export default function Insights() {
  const reduce = useReducedMotion();

  return (
    <section id="insights" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal y={12} blur={false}>
              <span className="eyebrow mb-3 block">Looking back</span>
            </Reveal>
            <AnimatedText
              as="h2"
              once={false}
              delay={0.1}
              className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
              parts={[{ text: "Notice what returns." }]}
            />
          </div>
          <Reveal className="md:col-span-4 md:justify-self-end" delay={0.18} y={10} blur={false}>
            <p className="max-w-sm text-sm leading-relaxed text-charcoal-muted md:text-right">
              A little distance can reveal the shape of your writing: its pace, its moods, and the themes you return to.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-12">
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: reduce ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-4 hidden h-px origin-left bg-sage/30 md:block"
          />
          <RevealGroup className="grid gap-8 md:grid-cols-3 md:gap-10" delay={0.16} stagger={0.12}>
            {reflections.map(([title, body], index) => (
              <RevealItem key={title} y={14}>
                <div className="relative flex items-center gap-3 md:mb-6 md:block">
                  <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-sage/30 bg-ivory font-serif text-xs italic text-sage-deep">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-gray">In your pages</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal md:text-2xl">{title}</h3>
                <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-charcoal-muted">{body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
