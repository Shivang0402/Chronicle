import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Feather,
  Hash,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import CountUp from "../components/ui/CountUp";
import Wordmark from "../components/ui/Wordmark";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";

const emptyStats = {
  totalChronicles: 0,
  totalWords: 0,
  currentStreak: 0,
  mostCommonMood: "",
};

export default function VaultPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);

  useDocumentTitle("Your private desk");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    chronicleApi
      .getStats(token)
      .then((data) => {
        if (!active || !data) return;
        setStats({
          totalChronicles: data.totalChronicles ?? 0,
          totalWords: data.totalWords ?? 0,
          currentStreak: data.currentStreak ?? 0,
          mostCommonMood: data.mostCommonMood || "",
        });
      })
      .catch(() => {
        // A quiet empty state is better than an error for a brand-new journal.
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const firstName = user?.name?.split(" ")[0] || "wanderer";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const statCards = [
    {
      label: "Entries preserved",
      value: stats.totalChronicles,
      suffix: "",
      icon: BookOpen,
    },
    {
      label: "Words written",
      value: stats.totalWords,
      suffix: "",
      icon: Feather,
    },
    {
      label: "Current streak",
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? " day" : " days",
      icon: Sparkles,
    },
    {
      label: "Reflective state",
      value: stats.mostCommonMood || "—",
      suffix: "",
      icon: Hash,
      isText: true,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <header className="border-b border-hairline bg-ivory/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 sm:px-10">
            <Wordmark />
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden text-[12px] text-charcoal-muted transition-colors hover:text-charcoal sm:block"
              >
                Home
              </Link>
              <span className="hidden h-5 w-px bg-hairline sm:block" />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-subtle font-serif text-sm text-sage-deep">
                {(user?.name || user?.email || "C").charAt(0).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted transition-colors hover:border-sage/40 hover:text-charcoal"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
          <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-6 py-14 sm:px-10 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow mb-4 block">Your private desk</span>
              <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-charcoal sm:text-6xl">
                Welcome back,{" "}
                <span className="italic text-sage">{firstName}</span>.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-charcoal-muted">
                Your sanctuary is exactly as you left it. The writing desk is
                being prepared; for now, your account and archive are safe here.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.15 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border border-hairline bg-paper p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-gray">
                        {card.label}
                      </span>
                      <Icon className="h-3.5 w-3.5 text-sage" />
                    </div>
                    <div className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-14 animate-pulse rounded bg-hairline/70" />
                      ) : card.isText ? (
                        <span className="text-xl sm:text-2xl">{card.value}</span>
                      ) : (
                        <>
                          <CountUp value={card.value} duration={1.4} />
                          <span className="text-sm text-muted-gray">
                            {card.suffix}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="border border-hairline bg-paper p-7 shadow-sm lg:col-span-7 sm:p-9"
              >
                <div className="flex items-center justify-between border-b border-hairline pb-5">
                  <div>
                    <h2 className="font-serif text-2xl text-charcoal">
                      Account &amp; privacy
                    </h2>
                    <p className="mt-1 text-xs text-muted-gray">
                      The quiet details of your private folio.
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-sage" />
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-4 w-4 text-sage" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-gray">
                        Name
                      </dt>
                      <dd className="mt-1 text-sm text-charcoal">
                        {user?.name || "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="mt-0.5 h-4 w-4 text-sage" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-gray">
                        Username
                      </dt>
                      <dd className="mt-1 text-sm text-charcoal">
                        @{user?.username || "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-sage" />
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-gray">
                        Email
                      </dt>
                      <dd className="mt-1 truncate text-sm text-charcoal">
                        {user?.email || "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-sage" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-gray">
                        Journal opened
                      </dt>
                      <dd className="mt-1 text-sm text-charcoal">
                        {memberSince}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-7 flex items-center gap-2 rounded-lg bg-sage-subtle/60 px-4 py-3 text-[11px] text-sage-deep">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Email verified. Your session is secured with a private JWT.
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative overflow-hidden border border-hairline bg-warm-beige/60 p-7 lg:col-span-5 sm:p-9"
              >
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-sage-light/40 blur-2xl" />
                <span className="eyebrow mb-4 block">The next page</span>
                <h2 className="relative font-serif text-3xl leading-tight tracking-tight text-charcoal">
                  Your first blank page is waiting.
                </h2>
                <p className="relative mt-3 text-sm font-light leading-relaxed text-charcoal-muted">
                  The full writing desk, archive, and insights are being bound
                  into the next chapter. Your account is ready for them.
                </p>
                <div className="relative mt-7 flex items-center gap-3">
                  <Link
                    to="/#editor"
                    className="btn-sage !px-5 !py-2.5 text-[10px]"
                  >
                    Visit the canvas
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/"
                    className="text-[11px] text-charcoal-muted transition-colors hover:text-charcoal"
                  >
                    Back home
                  </Link>
                </div>
              </motion.section>
            </div>

            <p className="mt-10 text-center text-[10px] uppercase tracking-wide2 text-muted-gray">
              Private by default · No algorithms · Yours forever
            </p>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
