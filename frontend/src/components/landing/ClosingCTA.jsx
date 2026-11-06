import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

export default function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-hairline/70 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sage-light/25 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-10">
        <Reveal y={10} blur={false}>
          <span className="eyebrow mb-5 block">A page of your own</span>
        </Reveal>
        <AnimatedText
          as="h2"
          once={false}
          delay={0.1}
          lineStagger={0.16}
          className="mx-auto max-w-3xl font-serif text-4xl leading-[1.12] tracking-tight text-charcoal sm:text-6xl"
          lines={[
            [{ text: "Start with today." }],
            [{ text: "Keep what matters.", italic: true, className: "text-sage" }],
          ]}
        />
        <Reveal delay={0.24} y={14} blur={false}>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
            A few honest lines are enough to begin.
          </p>
        </Reveal>
        <Reveal delay={0.36} y={12} blur={false}>
          <div className="mt-8 flex flex-col items-center">
            <Link
              to="/auth?mode=register"
              className="btn-primary w-full sm:w-auto"
            >
              Begin your journal
            </Link>
            <p className="mt-5 text-xs text-muted-gray">
              Already keeping a journal?{" "}
              <Link
                to="/auth"
                className="font-medium text-charcoal underline decoration-hairline underline-offset-4 transition-colors hover:text-sage-deep"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
