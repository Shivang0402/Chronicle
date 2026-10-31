import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

export default function ClosingCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 paper-texture opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-sage-light/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-warm-beige/80 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-10">
        <Reveal y={12} blur={false}>
          <span className="eyebrow mb-6 block">Your Private Harbor</span>
        </Reveal>

        <AnimatedText
          as="h2"
          className="mx-auto max-w-3xl font-serif text-4xl leading-[1.12] tracking-tight text-charcoal sm:text-6xl"
          parts={[{ text: "Your story deserves" }, { text: "a place.", italic: true, className: "text-sage" }]}
        />

        <Reveal delay={0.15} y={18} blur={false}>
          <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
            Begin capturing the thoughts and moments you don’t want to lose.
            Private by default, calming by design, archival by nature.
          </p>
        </Reveal>

        <Reveal delay={0.28} y={16} blur={false}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/auth?mode=register" className="btn-primary w-full sm:w-auto">
              Begin your journal
            </Link>
            <a
              href="#experience"
              className="btn-ghost w-full justify-center border border-hairline bg-paper/50 sm:w-auto"
            >
              Read our philosophy
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4} y={10} blur={false}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-wider text-muted-gray">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-sage" />
              Private and untracked
            </span>
            <span className="h-1 w-1 rounded-full bg-hairline" />
            <span>Zero social streams</span>
            <span className="h-1 w-1 rounded-full bg-hairline" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sage" />
              Yours forever
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
