import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../ui/PageTransition";
import Reveal from "../ui/Reveal";
import ThemeToggle from "../ui/ThemeToggle";
import Wordmark from "../ui/Wordmark";
import Footer from "./Footer";

export function ContentSection({ title, children, className = "" }) {
  return (
    <Reveal
      as="section"
      variant="up"
      y={16}
      blur={false}
      className={className}
    >
      <h2 className="font-serif text-2xl tracking-tight text-charcoal sm:text-[28px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] font-light leading-[1.85] text-charcoal-muted">
        {children}
      </div>
    </Reveal>
  );
}

export default function ContentPage({
  eyebrow,
  title,
  intro,
  updated,
  updatedLabel = "Last updated",
  children,
}) {
  return (
    <PageTransition variant="soft">
      <div className="flex min-h-screen flex-col bg-ivory">
        <header className="border-b border-hairline bg-ivory/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
            <Wordmark />
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wide2 text-charcoal-muted transition-colors hover:border-sage/40 hover:text-charcoal"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 paper-texture opacity-40" />
          <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-6 py-14 sm:px-10 md:py-20 lg:px-0">
            <Reveal variant="right" y={18} blur={false}>
              <span className="eyebrow block">{eyebrow}</span>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-charcoal sm:text-5xl lg:text-[56px]">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-light leading-[1.9] text-charcoal-muted sm:text-lg">
                {intro}
              </p>
              {updated && (
                <p className="mt-6 text-[10px] uppercase tracking-wide2 text-muted-gray">
                  {updatedLabel} {updated}
                </p>
              )}
            </Reveal>

            <div className="mt-10 h-px bg-hairline" />

            <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
              {children}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
