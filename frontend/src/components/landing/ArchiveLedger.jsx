import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const entries = [
  {
    date: "Oct 22, 2025",
    mood: "Peaceful",
    title: "The cadence of autumn winds",
    excerpt:
      "Walked down by the river canal right as dusk began falling. The maple leaves are turning that deep burnt ochre. A sudden sense of peace accompanied the evening chill.",
    meta: "540 words · 3 min",
    tags: ["#Walks", "#Reflections"],
  },
  {
    date: "Oct 18, 2025",
    mood: "Inspired",
    title: "Pages from the second notebook",
    excerpt:
      "Finished reading Calvino’s Invisible Cities again. Made extensive notes on how memory shapes the physical contours of spaces we inhabit and return to.",
    meta: "820 words · 5 min",
    tags: ["#Books", "#Architecture"],
  },
  {
    date: "Oct 14, 2025",
    mood: "Grateful",
    title: "Quiet cup of morning tea",
    excerpt:
      "Morning light filters past the curtains. Steaming mug, zero notifications for an hour. Relearning how pleasant it is to just hear the kettle whistle on the stove.",
    meta: "412 words · 2 min",
    tags: ["#Morning", "#Stillness"],
  },
  {
    date: "Oct 08, 2025",
    mood: "Contemplative",
    title: "Letters unposted, thoughts preserved",
    excerpt:
      "Sorting old correspondence in the cedar chest. There is something profoundly tactile in dated handwriting that modern communication will never quite replicate.",
    meta: "615 words · 4 min",
    tags: ["#Memory", "#Letters"],
  },
];

export default function ArchiveLedger() {
  return (
    <section
      id="features"
      className="border-b border-hairline bg-warm-beige/40 py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Reveal y={14} blur={false}>
              <span className="eyebrow mb-3 block">Archive &amp; Ledger</span>
            </Reveal>
            <AnimatedText
              as="h2"
              className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
              parts={[{ text: "Every entry has its place." }]}
            />
          </div>
          <Reveal delay={0.15} y={12} blur={false}>
            <p className="text-sm text-charcoal-muted">
              <span className="font-medium text-charcoal">52 entries</span>{" "}
              archived in Volume 2025
            </p>
          </Reveal>
        </div>

        <div className="border-t border-hairline">
          <RevealGroup className="divide-y divide-hairline" stagger={0.12}>
            {entries.map((entry) => (
              <RevealItem key={entry.title}>
                <article className="group -mx-4 grid grid-cols-1 gap-5 px-4 py-9 transition-colors duration-300 hover:bg-black/[0.012] lg:grid-cols-12 lg:items-baseline lg:gap-6 lg:py-10">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-gray lg:col-span-3">
                    <span>{entry.date}</span>
                    <span className="h-1 w-1 rounded-full bg-sage" />
                    <span className="font-medium text-charcoal-muted">
                      {entry.mood}
                    </span>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-2xl leading-snug text-charcoal transition-colors duration-300 group-hover:text-sage sm:text-[28px]">
                        {entry.title}
                      </h3>
                      <ArrowUpRight className="mt-1.5 h-4 w-4 shrink-0 -translate-x-1 text-sage opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-charcoal-muted">
                      {entry.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11px] text-muted-gray lg:col-span-3 lg:flex-col lg:items-end lg:gap-2 lg:text-right">
                    <span>{entry.meta}</span>
                    <div className="flex items-center gap-1.5">
                      {entry.tags.map((tag, index) => (
                        <span key={tag} className="flex items-center gap-1.5">
                          {index > 0 && (
                            <span className="h-0.5 w-0.5 rounded-full bg-muted-gray/60" />
                          )}
                          <span className="text-charcoal-muted">{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal
          delay={0.1}
          y={14}
          blur={false}
          className="flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 text-[10px] uppercase tracking-wide2 text-muted-gray sm:flex-row sm:items-center"
        >
          <span>Displaying 4 of 52 ledger entries</span>
          <Link
            to="/auth"
            className="group flex items-center gap-2 font-medium text-charcoal transition-colors hover:text-sage"
          >
            <span>Open your full archive</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
