import { CalendarDays, Feather } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

export default function WritingCanvas() {
  return (
    <section id="editor" className="scroll-mt-24 bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-10 max-w-3xl md:mb-12">
          <Reveal variant="down" y={12} blur={false}>
            <span className="eyebrow mb-3 block">The Writing Canvas</span>
          </Reveal>
          <AnimatedText
            as="h2"
            mode="slide"
            once={false}
            delay={0.1}
            className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
            parts={[{ text: "Give your thoughts room to unfold." }]}
          />
          <Reveal variant="down" delay={0.24} y={14} blur={false}>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              A small glimpse of a page, kept just for you.
            </p>
          </Reveal>
        </div>

        <Reveal variant="up" y={16} amount={0.12} delay={0.28} duration={0.8}>
          <article className="relative mx-auto max-w-3xl border border-hairline bg-paper px-7 py-8 shadow-paper sm:px-12 sm:py-11 lg:px-16">
            <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-1 bg-sage/50" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4 text-[10px] uppercase tracking-wider text-muted-gray">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-sage" />
                October 24, 2025
              </span>
              <span className="rounded-full bg-sage-subtle px-3 py-1 font-medium normal-case tracking-normal text-sage-deep">
                Peaceful
              </span>
            </div>

            <div className="pb-2 pt-7 sm:pt-9">
              <h3 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                The quiet architecture of morning
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-gray">
                <span>#Morning</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-sage/60" />
                <span>#Reflection</span>
              </div>

              <div className="mt-7 space-y-4 font-serif text-base font-light leading-[1.85] text-charcoal sm:text-lg">
                <p>
                  Morning light moved slowly across the desk. I made tea and
                  listened to the rain ease against the window. The house felt
                  still, and my thoughts began to settle.
                </p>
                <p>
                  Nothing remarkable happened. Maybe that is what I want to
                  remember: a quiet start, a familiar cup, and a few minutes
                  that belonged only to me.
                </p>
              </div>

              <div className="mt-7 flex items-center gap-2 border-t border-hairline pt-4 text-[10px] uppercase tracking-wider text-muted-gray">
                <Feather className="h-3 w-3 text-sage" />
                A journal entry
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
