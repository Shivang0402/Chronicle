import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealImage } from "../ui/Reveal";

export default function Philosophy() {
  return (
    <section id="experience" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16">
        <div className="relative lg:col-span-5">
          <RevealImage y={12} amount={0.15} delay={0.05}>
            <div className="overflow-hidden bg-warm-beige">
              <img
                src="/images/philosophy-journal.jpg"
                alt="An open journal beside a sunlit window"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
          </RevealImage>
          <Reveal delay={0.2} y={8} blur={false}>
            <p className="mt-3 flex items-center gap-3 text-xs text-muted-gray">
              <span className="h-px w-8 bg-sage/60" />
              A little room to hear your own thoughts.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pl-4">
          <Reveal y={12} blur={false}>
            <span className="eyebrow mb-6 block">The experience</span>
          </Reveal>
          <AnimatedText
            as="blockquote"
            once={false}
            delay={0.12}
            lineStagger={0.16}
            className="mb-7 max-w-2xl font-serif text-3xl leading-[1.16] tracking-tight text-charcoal sm:text-4xl lg:text-[46px]"
            lines={[
              [{ text: "Not everything needs to be shared." }],
              [
                { text: "Some things are" },
                { text: "worth keeping.", italic: true, className: "text-sage" },
              ],
            ]}
          />
          <Reveal delay={0.3} y={12} blur={false}>
            <p className="max-w-xl border-l border-sage/50 pl-5 text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              The day moves quickly. Writing gives you a moment to notice what
              stayed with you, and a place to leave it for tomorrow.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
