import { ShieldCheck } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealImage } from "../ui/Reveal";

export default function Philosophy() {
  return (
    <section
      id="experience"
      className="relative -mt-8 scroll-mt-24 bg-ivory pb-16 pt-12 md:-mt-12 md:pb-20 md:pt-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-6 sm:px-10 md:grid-cols-2 md:gap-12 lg:gap-20 lg:px-16">
        <div className="relative mb-8 pr-7 pb-7 sm:pr-12 md:mb-0">
          <RevealImage variant="clip-left" amount={0.12} delay={0.05} duration={1} onMount>
            <div className="relative overflow-hidden border border-white/70 bg-warm-beige shadow-paper-lg">
              <img
                src="/images/philosophy-journal.jpg"
                alt="An open journal and pen on a wooden desk in warm window light"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 font-serif text-lg italic text-ivory sm:bottom-7 sm:left-7 sm:text-xl">
                A quieter place to return to.
              </p>
            </div>
          </RevealImage>
          <RevealImage
            variant="clip-right"
            delay={0.22}
            y={12}
            amount={0.12}
            onMount
            className="absolute -bottom-7 right-0 z-10 w-[38%] border-[5px] border-paper bg-paper p-1 shadow-paper-lg sm:-bottom-8 sm:w-[34%]"
          >
            <img
              src="/images/auth-journal.jpg"
              alt="A leather-bound journal resting on linen beside a window"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <p className="px-1 pb-1 pt-2 text-center text-[9px] uppercase tracking-wider text-muted-gray sm:text-[10px]">
              Your words, your own
            </p>
          </RevealImage>
        </div>

        <div className="max-w-xl md:justify-self-start md:pl-5 lg:pl-8">
          <Reveal variant="right" y={22} blur={false}>
            <span className="eyebrow mb-5 block">The experience</span>
          </Reveal>
          <AnimatedText
            as="blockquote"
            mode="fade"
            once={false}
            delay={0.12}
            lineStagger={0.16}
            className="mb-7 font-serif text-3xl leading-[1.28] tracking-tight text-charcoal sm:text-4xl lg:text-[46px]"
            lines={[
              [{ text: "Not everything needs to be shared." }],
              [
                { text: "Some things are" },
                { text: "worth keeping.", italic: true, className: "text-sage" },
              ],
            ]}
          />
          <Reveal variant="right" delay={0.26} y={18} blur={false}>
            <p className="max-w-lg text-base font-light leading-[1.95] text-charcoal-muted sm:text-lg">
              The day moves quickly. A few lines can help you notice what
              mattered, make sense of it, and leave it somewhere safe for
              tomorrow.
            </p>
          </Reveal>
          <Reveal variant="fade" delay={0.34} y={8} blur={false}>
            <div className="mt-7 flex items-start gap-3 border-t border-hairline/80 pt-5 text-sm text-charcoal-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
              <p>Private by design. Write at your own pace, and return whenever you like.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
