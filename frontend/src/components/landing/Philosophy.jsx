import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealImage, RevealItem } from "../ui/Reveal";

export default function Philosophy() {
  return (
    <section
      id="experience"
      className="relative -mt-8 scroll-mt-24 bg-ivory pb-16 pt-12 md:-mt-12 md:pb-20 md:pt-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-6 sm:px-10 md:grid-cols-2 md:gap-12 lg:gap-20 lg:px-16">
        <div className="relative">
          <RevealImage onMount y={14} amount={0.12} delay={0.05} duration={1}>
            <div className="relative overflow-hidden bg-warm-beige">
              <img
                src="/images/philosophy-journal.jpg"
                alt="An open journal and pen on a wooden desk in warm window light"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 right-4 font-serif text-sm italic text-charcoal/75 sm:bottom-6 sm:right-6"
              >
                a thought, kept
              </span>
            </div>
          </RevealImage>
          <div className="mt-4 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-4 sm:gap-6">
            <RevealImage onMount y={10} amount={0.12} delay={0.12} duration={0.8}>
              <img
                src="/images/hero-journal.jpg"
                alt="Handwritten journal page and pen beside a cup of tea"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
              />
            </RevealImage>
            <Reveal delay={0.22} y={8} blur={false}>
              <p className="max-w-[15rem] font-serif text-sm italic leading-relaxed text-charcoal-muted sm:text-base">
                A page begins with whatever is on your mind.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="max-w-xl md:justify-self-start md:pl-5 lg:pl-8">
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
          <RevealGroup
            className="mt-8 border-t border-hairline/80 pt-5"
            delay={0.34}
            stagger={0.1}
          >
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-gray">
              If you need a place to begin
            </p>
            <div className="grid gap-3">
              <RevealItem y={8}>
                <p className="grid grid-cols-[2rem_1fr] items-baseline font-serif text-base leading-snug text-charcoal sm:text-lg">
                  <span className="font-sans text-[10px] text-sage">01</span>
                  What stayed with you today?
                </p>
              </RevealItem>
              <RevealItem y={8}>
                <p className="grid grid-cols-[2rem_1fr] items-baseline font-serif text-base leading-snug text-charcoal sm:text-lg">
                  <span className="font-sans text-[10px] text-sage">02</span>
                  What do you want to remember?
                </p>
              </RevealItem>
            </div>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
