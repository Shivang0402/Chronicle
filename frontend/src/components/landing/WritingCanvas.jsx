import { CalendarDays, Feather } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

export default function WritingCanvas() {
  return (
    <section id="editor" className="scroll-mt-24 bg-warm-beige/35 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
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
            <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              An unhurried place to gather the details of an ordinary day.
            </p>
          </Reveal>
        </div>

        <Reveal variant="up" y={16} amount={0.12} delay={0.28} duration={0.8}>
          <article className="mx-auto max-w-4xl border border-hairline bg-paper px-7 py-9 shadow-paper-lg sm:px-14 sm:py-12 lg:px-20 lg:py-16">
            <div className="mx-auto max-w-2xl">
              <div className="mb-7 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-muted-gray sm:mb-9">
                A Friday morning, remembered
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-hairline py-4 text-[10px] uppercase tracking-wider text-muted-gray">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-sage" />
                  Friday, October 24, 2025 <span aria-hidden="true">·</span> 8:16 pm
                </span>
                <span className="rounded-full bg-sage-subtle px-3 py-1 font-medium normal-case tracking-normal text-sage-deep">
                  Reflective
                </span>
              </div>

              <div className="pb-2 pt-7 sm:pt-9">
              <h3 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl">
                The quiet architecture of morning
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-gray">
                <span>#Morning</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-sage/60" />
                <span>#SmallThings</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-sage/60" />
                <span>#Home</span>
              </div>

              <div className="mt-8 space-y-5 font-serif text-base font-light leading-[1.9] text-charcoal sm:mt-10 sm:space-y-6 sm:text-lg">
                <p>
                  I woke before the alarm today. For a few minutes I stayed
                  under the blanket and listened to the rain working its way
                  along the gutter. The room was blue with early light, the
                  kind that makes familiar things look as if they are waiting
                  to be noticed again.
                </p>
                <p>
                  I put the kettle on and opened the kitchen window. The air
                  smelled like wet pavement and the jasmine on the balcony.
                  While the tea steeped, I finally watered the little basil
                  plant I keep forgetting about. It has put out two new leaves.
                  I felt oddly proud of both of us.
                </p>
                <p>
                  The day filled up after that: messages, errands, the usual
                  small negotiations with the clock. But I kept returning to
                  that first quiet stretch. Maybe a slower morning does not
                  change the shape of a day; maybe it just gives you somewhere
                  steady to begin.
                </p>
              </div>

              <blockquote className="mt-8 border-y border-hairline py-5 font-serif text-lg italic leading-relaxed text-charcoal-muted sm:mt-10 sm:py-6 sm:text-xl">
                “A slower beginning gives the day somewhere steady to start.”
              </blockquote>

              <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5 text-[10px] uppercase tracking-wider text-muted-gray sm:mt-11">
                <span className="inline-flex items-center gap-2">
                  <Feather className="h-3 w-3 text-sage" />
                  Written slowly, kept here
                </span>
                <span>2 min read <span aria-hidden="true">·</span> Friday evening</span>
              </div>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
