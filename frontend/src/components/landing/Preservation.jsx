import { FileJson, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealImage, RevealItem } from "../ui/Reveal";

const formats = [
  { label: "PDF", description: "For reading", icon: FileText },
  { label: "Markdown", description: "For writing tools", icon: FileText },
  { label: "JSON", description: "For your records", icon: FileJson },
];

export default function Preservation() {
  return (
    <section id="export" className="scroll-mt-24 bg-warm-beige/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16">
        <div className="lg:col-span-5">
          <Reveal y={12} blur={false}>
            <span className="eyebrow mb-3 block">Keep what you write</span>
          </Reveal>
          <AnimatedText
            as="h2"
            once={false}
            delay={0.1}
            lineStagger={0.14}
            className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
            lines={[
              [{ text: "Your words" }],
              [{ text: "stay yours.", italic: true, className: "text-sage" }],
            ]}
          />
          <Reveal delay={0.22} y={12} blur={false}>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              Take your journal with you. Export it as a PDF, Markdown file, or JSON archive.
            </p>
          </Reveal>
          <Reveal delay={0.32} y={10} blur={false}>
            <Link to="/auth?mode=register" className="link-underline mt-6 text-sm font-medium">
              Start writing
            </Link>
          </Reveal>
        </div>

        <RevealImage className="lg:col-span-7" y={14} delay={0.18} amount={0.15}>
          <div className="relative mx-auto max-w-2xl py-5 sm:py-8">
            <div aria-hidden="true" className="absolute bottom-0 right-0 top-10 w-[82%] border border-sage/20 bg-sage-subtle/60 sm:right-4" />
            <div className="relative mr-8 border border-hairline bg-paper p-6 shadow-paper sm:mr-12 sm:p-10">
              <div className="flex items-center justify-between border-b border-hairline pb-4 text-[10px] uppercase tracking-wider text-muted-gray">
                <span>Chronicle · Your journal</span>
                <span>Export formats</span>
              </div>
              <div className="py-3">
                <RevealGroup stagger={0.1} delay={0.16}>
                  {formats.map(({ label, description, icon: Icon }, index) => (
                    <RevealItem key={label} y={8}>
                      <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-hairline/80 py-4 last:border-0 sm:grid-cols-[2.5rem_1fr_auto]">
                        <span className="font-serif text-xs italic text-sage-deep">0{index + 1}</span>
                        <span className="flex items-center gap-3 font-serif text-lg text-charcoal sm:text-xl">
                          <Icon className="h-4 w-4 text-sage" />
                          {label}
                        </span>
                        <span className="text-right text-[10px] text-muted-gray sm:text-xs">{description}</span>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
              <div className="border-t border-hairline pt-4 font-serif text-sm italic text-charcoal-muted">
                A copy to keep, in a format that fits your life.
              </div>
            </div>
          </div>
        </RevealImage>
      </div>
    </section>
  );
}
