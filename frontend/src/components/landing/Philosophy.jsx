import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealImage } from "../ui/Reveal";

export default function Philosophy() {
  return (
    <section
      id="experience"
      className="relative -mt-8 scroll-mt-24 bg-ivory pb-16 pt-12 md:-mt-12 md:pb-20 md:pt-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-6 sm:px-10 md:grid-cols-2 md:gap-12 lg:gap-20 lg:px-16">
        <div className="relative">
          <RevealImage y={14} amount={0.12} delay={0.05} duration={1}>
            <div className="relative overflow-hidden bg-warm-beige">
              <img
                src="/images/philosophy-journal.jpg"
                alt="An open journal and pen on a wooden desk in warm window light"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 right-4 font-serif text-sm italic text-charcoal/75 sm:bottom-6 sm:right-6"
              >
                a thought, kept
              </span>
            </div>
          </RevealImage>
        </div>

        <div className="max-w-xl md:justify-self-end">
          <Reveal y={10} blur={false}>
            <span className="eyebrow mb-8 block">The experience</span>
          </Reveal>
          <AnimatedText
            as="blockquote"
            once={false}
            delay={0.12}
            lineStagger={0.16}
            className="mb-9 font-serif text-3xl leading-[1.28] tracking-tight text-charcoal sm:text-4xl lg:text-[46px]"
            lines={[
              [{ text: "Not everything needs to be shared." }],
              [
                { text: "Some things are" },
                { text: "worth keeping.", italic: true, className: "text-sage" },
              ],
            ]}
          />
          <Reveal delay={0.26} y={12} blur={false}>
            <p className="max-w-lg text-base font-light leading-[1.95] text-charcoal-muted sm:text-lg">
              The day moves quickly. Writing gives you a moment to notice what
              stayed with you, and a place to leave it for tomorrow.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
