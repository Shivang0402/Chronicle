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
    tags: ["Walks", "Reflections"],
  },
  {
    date: "Oct 18, 2025",
    mood: "Inspired",
    title: "Pages from the second notebook",
    excerpt:
      "Finished reading Calvino’s Invisible Cities again. Made extensive notes on how memory shapes the physical contours of spaces we inhabit and return to.",
    meta: "820 words · 5 min",
    tags: ["Books", "Architecture"],
  },
  {
    date: "Oct 14, 2025",
    mood: "Grateful",
    title: "Quiet cup of morning tea",
    excerpt:
      "Morning light filters past the curtains. Steaming mug, zero notifications for an hour. Relearning how pleasant it is to just hear the kettle whistle on the stove.",
    meta: "412 words · 2 min",
    tags: ["Morning", "Stillness"],
  },
  {
    date: "Oct 08, 2025",
    mood: "Contemplative",
    title: "Letters unposted, thoughts preserved",
    excerpt:
      "Sorting old correspondence in the cedar chest. There is something profoundly tactile in dated handwriting that modern communication will never quite replicate.",
    meta: "615 words · 4 min",
    tags: ["Memory", "Letters"],
  },
];

export default function ArchiveLedger() {
  return (
    <section id="features" className="scroll-mt-24 bg-warm-beige/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-10 grid gap-5 md:mb-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal y={12} blur={false}>
              <span className="eyebrow mb-3 block">A sample archive</span>
            </Reveal>
            <AnimatedText
              as="h2"
              once={false}
              delay={0.1}
              className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
              parts={[{ text: "The days you wrote down, gathered in one place." }]}
            />
          </div>
          <Reveal className="md:col-span-4 md:justify-self-end" delay={0.2} y={10} blur={false}>
            <p className="max-w-xs text-sm leading-relaxed text-charcoal-muted md:text-right">
              Browse by date, revisit a feeling, and follow a thought back to where it began.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="border-t border-charcoal/15" stagger={0.1} delay={0.2} amount={0.1}>
          {entries.map((entry) => (
            <RevealItem key={entry.title} y={12}>
              <article className="group grid gap-3 border-b border-charcoal/10 py-6 sm:py-7 md:grid-cols-12 md:gap-8">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-gray md:col-span-3 md:block">
                  <time>{entry.date}</time>
                  <span className="h-1 w-1 rounded-full bg-sage md:my-3 md:block" />
                  <span className="text-charcoal-muted">{entry.mood}</span>
                </div>
                <div className="md:col-span-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-xl leading-snug text-charcoal transition-colors group-hover:text-sage-deep sm:text-2xl">
                      {entry.title}
                    </h3>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-sage opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-charcoal-muted">
                    {entry.excerpt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-gray md:col-span-2 md:flex-col md:items-end md:justify-center md:text-right">
                  <span>{entry.meta}</span>
                  <span className="hidden h-px w-5 bg-hairline md:block" />
                  <span>{entry.tags.map((tag) => `#${tag}`).join("  ")}</span>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.2} y={10} blur={false} className="pt-6 text-right">
          <Link to="/auth" className="group inline-flex items-center gap-2 text-xs font-medium text-charcoal transition-colors hover:text-sage-deep">
            Begin your own archive
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
