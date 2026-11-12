import { BookOpen, CalendarDays, Download, FileText, ListChecks, Lock } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealImage } from "../ui/Reveal";

const pdfBenefits = [
  {
    title: "Your whole journal",
    description: "Gather every entry into one print-ready keepsake.",
    icon: BookOpen,
  },
  {
    title: "A time of your choosing",
    description: "Export by year or narrow it to a date range.",
    icon: CalendarDays,
  },
  {
    title: "Only the pages you want",
    description: "Select individual entries for a more personal copy.",
    icon: ListChecks,
  },
];

export default function Preservation() {
  return (
    <section id="export" className="overflow-hidden bg-warm-beige/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16">
        <div className="lg:col-span-5">
          <Reveal variant="right" y={18} blur={false}>
            <span className="eyebrow mb-3 block">Keep what you write</span>
          </Reveal>
          <AnimatedText
            as="h2"
            mode="blur"
            once={false}
            delay={0.1}
            lineStagger={0.14}
            className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
            lines={[
              [{ text: "Your words" }],
              [{ text: "stay yours.", italic: true, className: "text-sage" }],
            ]}
          />
          <Reveal variant="right" delay={0.22} y={16} blur={false}>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              Turn your entries into a beautifully typeset PDF journal—ready to
              print, revisit, and keep. Export your whole collection or choose
              entries by date, year, or selection.
            </p>
          </Reveal>
          <Reveal variant="fade" delay={0.32} y={10} blur={false}>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-charcoal/15 pt-5 text-[10px] uppercase tracking-wider text-muted-gray">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sage-deep" />
                Private by design
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-sage-deep" />
                Ready to print
              </span>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <div className="relative mx-auto grid max-w-2xl items-center gap-5 py-5 sm:grid-cols-[1.05fr_0.95fr] sm:gap-6 sm:py-8">
            <div aria-hidden="true" className="absolute bottom-8 left-2 top-0 w-[45%] rotate-3 border border-sage/25 bg-sage-subtle/70 sm:left-5" />

            <RevealImage
              variant="clip-right"
              className="relative z-10"
              y={14}
              delay={0.18}
              amount={0.15}
              onMount
            >
              <article className="ml-2 border border-hairline bg-paper p-5 shadow-paper-lg sm:ml-5 sm:p-7">
              <header className="flex items-center justify-between gap-2 border-b border-hairline pb-3">
                <span className="font-serif text-base tracking-tight text-charcoal sm:text-lg">
                  Chronicle<span className="text-sage">.</span>
                </span>
                <span className="rounded-full border border-sage/30 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.14em] text-sage-deep sm:text-[9px]">
                  PDF journal
                </span>
              </header>

              <div className="py-7 sm:py-9">
                <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-sage-deep sm:text-[9px]">
                  A personal journal
                </span>
                <h3 className="mt-3 font-serif text-2xl leading-tight tracking-tight text-charcoal sm:text-3xl">
                  Your days, in your own words.
                </h3>
                <p className="mt-3 text-xs font-light leading-relaxed text-charcoal-muted sm:text-sm">
                  Thoughts, moments, and small details gathered into a keepsake
                  you can hold onto.
                </p>
              </div>

              <div className="border-t border-hairline pt-3">
                <div className="mb-3 flex items-center justify-between text-[8px] uppercase tracking-wider text-muted-gray">
                  <span>Pages to return to</span>
                  <FileText className="h-3.5 w-3.5 text-sage-deep" />
                </div>
                <div className="space-y-2.5">
                  {["The cadence of autumn winds", "Pages from the second notebook", "Quiet cup of morning tea"].map((title, index) => (
                    <div key={title} className="flex items-center gap-2">
                      <span className="font-serif text-[10px] italic text-sage-deep">0{index + 1}</span>
                      <span className="h-px flex-1 bg-hairline" />
                      <span className="max-w-[70%] text-right font-serif text-[10px] text-charcoal sm:text-xs">{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="mt-5 border-t border-hairline pt-3 text-[8px] uppercase tracking-wider text-muted-gray">
                A keepsake to print and revisit
              </footer>
              </article>
            </RevealImage>

            <div className="relative grid gap-3 pl-2 sm:pl-0">
              <p className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.17em] text-sage-deep">
                One journal, your way
              </p>
              {pdfBenefits.map(({ title, description, icon: Icon }, index) => (
                <article key={title} className="flex items-start gap-3 border border-hairline bg-paper/90 p-3.5 shadow-paper sm:p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage-subtle text-sage-deep">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm leading-snug text-charcoal sm:text-base">{title}</h3>
                    <p className="mt-1 text-[10px] leading-relaxed text-charcoal-muted sm:text-xs">{description}</p>
                  </div>
                  <span className="ml-auto hidden font-serif text-[10px] italic text-sage sm:block">0{index + 1}</span>
                </article>
              ))}
              <span className="inline-flex items-center gap-2 pl-1 pt-1 text-[9px] font-medium uppercase tracking-wider text-muted-gray">
                <Download className="h-3 w-3 text-sage-deep" />
                Save a print-ready PDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
