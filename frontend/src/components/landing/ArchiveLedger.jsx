import { ArrowUpRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const entries = [
  {
    date: "Oct 22, 2025",
    mood: "Peaceful",
    title: "The cadence of autumn winds",
    excerpt: "A riverside walk at dusk, and the calm that came with the evening chill.",
    meta: "540 words · 3 min",
    tags: ["Walks", "Reflections"],
  },
  {
    date: "Oct 18, 2025",
    mood: "Inspired",
    title: "Pages from the second notebook",
    excerpt: "A return to Invisible Cities, and notes on the places memory builds.",
    meta: "820 words · 5 min",
    tags: ["Books", "Architecture"],
  },
  {
    date: "Oct 14, 2025",
    mood: "Grateful",
    title: "Quiet cup of morning tea",
    excerpt: "Morning light, a warm cup, and one unhurried hour to myself.",
    meta: "412 words · 2 min",
    tags: ["Morning", "Stillness"],
  },
];

export default function ArchiveLedger() {
  const totalWords = entries.reduce(
    (sum, entry) => sum + Number(entry.meta.split(" ")[0]),
    0,
  );

  return (
    <section id="features" className="scroll-mt-24 bg-warm-beige/40 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-8 grid gap-5 md:mb-9 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal variant="fade" y={12} blur={false}>
              <span className="eyebrow mb-3 block">A sample archive</span>
            </Reveal>
            <AnimatedText
              as="h2"
              mode="scale"
              once={false}
              delay={0.1}
              className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
              parts={[{ text: "The days you wrote down, gathered in one place." }]}
            />
          </div>
          <Reveal variant="right" className="md:col-span-4 md:justify-self-end" delay={0.2} y={20} blur={false}>
            <p className="max-w-none text-sm leading-relaxed text-charcoal-muted sm:max-w-xs md:text-right">
              Revisit a feeling or follow a thought back to where it began.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="border-t border-charcoal/15" stagger={0.1} delay={0.2} amount={0.1}>
          {entries.map((entry) => (
            <RevealItem key={entry.title} variant="right" x={26} y={12}>
              <article key={entry.title} className="group grid gap-3 border-b border-charcoal/10 py-4 sm:py-5 md:grid-cols-12 md:gap-8">
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
                  <p className="mt-1.5 max-w-2xl text-sm font-light leading-relaxed text-charcoal-muted">
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

        <Reveal variant="fade" delay={0.2} y={10} blur={false} className="mt-4 flex flex-col gap-3 border-t border-charcoal/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs font-light leading-relaxed text-charcoal-muted">
            Each entry keeps its date, mood, and tags for easy browsing.
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-gray">
            Sample ledger · {entries.length} entries · {totalWords.toLocaleString("en-US")} words
          </p>
        </Reveal>
      </div>
    </section>
  );
}
