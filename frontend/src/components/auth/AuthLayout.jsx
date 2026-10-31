import { ArrowLeft, Feather, Lock, Quote, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../ui/PageTransition";
import Wordmark from "../ui/Wordmark";

export default function AuthLayout({ children }) {
  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-ivory">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-sage-light/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-warm-beige/80 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex items-center justify-between">
            <Wordmark mark />
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-gray transition-colors hover:text-charcoal"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back to home
            </Link>
          </div>

          <div className="grid flex-1 overflow-hidden rounded-2xl border border-hairline bg-paper shadow-paper-lg lg:grid-cols-12">
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-warm-beige/70 p-8 lg:col-span-5 lg:flex lg:p-10">
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sage-light/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sage/15 blur-3xl" />

              <div className="relative z-10 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage-deep text-ivory shadow-sm">
                  <Feather className="h-4 w-4" />
                </span>
                <div>
                  <span className="block font-serif text-xl leading-tight tracking-tight text-charcoal">
                    Chronicle
                  </span>
                  <span className="block text-[9px] uppercase tracking-wide2 text-muted-gray">
                    Est. Archival MMXXIX
                  </span>
                </div>
              </div>

              <div className="relative z-10 my-10">
                <div className="group relative overflow-hidden rounded-xl shadow-paper">
                  <img
                    src="/images/auth-journal.jpg"
                    alt="A leather-bound Chronicle journal resting in soft window light"
                    className="h-60 w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-ivory">
                    <span className="block text-[9px] uppercase tracking-wide2 text-ivory/70">
                      Master folio #0482
                    </span>
                    <span className="mt-1 block font-serif text-xl">
                      Chronicle • Private Desk
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Quote className="mx-auto mb-2 h-5 w-5 text-sage/60" />
                  <blockquote className="font-serif text-[17px] italic leading-relaxed text-charcoal">
                    “To keep a journal is to live twice — once in the rush of
                    the moment, and once in the stillness of reflection.”
                  </blockquote>
                  <p className="mt-3 text-[9px] uppercase tracking-wide2 text-muted-gray">
                    Archival Journaling Anthology, Vol. IV
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-hairline bg-paper/60 px-4 py-3 text-[10px] text-charcoal-muted backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-sage" />
                  Private &amp; secure
                </span>
                <span className="h-1 w-1 rounded-full bg-hairline" />
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-sage" />
                  JWT sessions
                </span>
                <span className="h-1 w-1 rounded-full bg-hairline" />
                <span>No trackers</span>
              </div>
            </aside>

            <div className="flex flex-col justify-center bg-paper px-5 py-9 sm:px-10 sm:py-12 lg:col-span-7 lg:px-14">
              <div className="mx-auto w-full max-w-xl">{children}</div>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] uppercase tracking-wider text-muted-gray">
            A quiet space, built with care · Your words remain yours
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
