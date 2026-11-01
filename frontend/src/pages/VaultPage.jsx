import { motion } from "framer-motion";
import {
  BookOpen,
  Feather,
  Flame,
  PenLine,
  Smile,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import DailyPrompt from "../components/dashboard/DailyPrompt";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import EntryComposer from "../components/dashboard/EntryComposer";
import EntryReader from "../components/dashboard/EntryReader";
import RecentEntries from "../components/dashboard/RecentEntries";
import StatCard from "../components/dashboard/StatCard";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import { greetingForNow } from "../lib/journal";

const emptyStats = {
  totalChronicles: 0,
  totalWords: 0,
  averageWords: 0,
  entriesThisMonth: 0,
  entriesThisYear: 0,
  mostCommonMood: "",
  currentStreak: 0,
  longestStreak: 0,
  activity: [],
  moodBreakdown: [],
  trend: [],
};

const fetchDashboard = async (token, activeTag) => {
  const [statsData, entriesData, tagsData] = await Promise.all([
    chronicleApi.getStats(token, { range: "all" }),
    chronicleApi.getChronicles(token, {
      limit: 20,
      ...(activeTag ? { tag: activeTag } : {}),
    }),
    chronicleApi.getTags(token),
  ]);

  return { statsData, entriesData, tagsData };
};

export default function VaultPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(emptyStats);
  const [entries, setEntries] = useState([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [tags, setTags] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerPrompt, setComposerPrompt] = useState("");
  const [readerEntry, setReaderEntry] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle("Dashboard");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    fetchDashboard(token, activeTag)
      .then(({ statsData, entriesData, tagsData }) => {
        if (!active) return;

        setStats({ ...emptyStats, ...(statsData || {}) });
        setEntries(entriesData?.chronicles || []);
        setEntriesTotal(entriesData?.totalChronicles || 0);
        setTags(Array.isArray(tagsData) ? tagsData : []);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError?.message ||
            "Could not open your dashboard. Please try again.",
        );
      })
      .finally(() => {
        if (!active) return;
        setStatsLoading(false);
        setEntriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, activeTag, reloadKey]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const firstName = user?.name?.split(" ")[0] || "wanderer";
  const greeting = greetingForNow();
  const topMood = stats.moodBreakdown?.[0];

  const statCards = [
    {
      label: "Total entries",
      value: stats.totalChronicles,
      icon: BookOpen,
      footerLabel: "This month",
      footerValue: `${stats.entriesThisMonth} ${
        stats.entriesThisMonth === 1 ? "entry" : "entries"
      }`,
    },
    {
      label: "Total words",
      value: stats.totalWords,
      icon: Feather,
      footerLabel: "Average per entry",
      footerValue: `${stats.averageWords} words`,
    },
    {
      label: "Current streak",
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? " day" : " days",
      icon: Flame,
      footerLabel: "Longest streak",
      footerValue: `${stats.longestStreak} ${
        stats.longestStreak === 1 ? "day" : "days"
      }`,
    },
    {
      label: "Most common mood",
      value: stats.mostCommonMood || "—",
      icon: Smile,
      isText: true,
      footerLabel: "Mood patterns",
      footerValue: topMood
        ? `${topMood.count} ${topMood.count === 1 ? "entry" : "entries"}`
        : "No mood yet",
    },
  ];

  const openComposer = () => {
    setComposerPrompt("");
    setComposerOpen(true);
  };

  const handleSelectTag = (tag) => {
    setEntriesLoading(true);
    setActiveTag(tag);
  };

  const handleRetry = () => {
    setStatsLoading(true);
    setEntriesLoading(true);
    setReloadKey((value) => value + 1);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCreated = () => {
    setNotice("Entry preserved in your archive.");
    setReloadKey((value) => value + 1);
  };

  const handleExport = async () => {
    if (!token || exporting) return;

    setExporting(true);

    try {
      const blob = await chronicleApi.exportEntries(token, { format: "json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `chronicles-${date}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice("Your archive has been exported.");
    } catch (exportError) {
      setError(exportError?.message || "Could not export your archive.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag={activeTag}
          onSelectTag={handleSelectTag}
          onClearTag={() => handleSelectTag("")}
          onNewEntry={openComposer}
          onExport={handleExport}
          onLogout={handleLogout}
          exporting={exporting}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          onOpenMenu={() => setMobileNavOpen(true)}
          onNewEntry={openComposer}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <section id="dashboard-top" className="scroll-mt-24">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="eyebrow mb-3 block">Your private desk</span>
                    <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl">
                      {greeting},{" "}
                      <span className="italic text-sage">{firstName}</span>.
                    </h1>
                    <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-charcoal-muted sm:text-[15px]">
                      Welcome to your private journal. Every page here belongs
                      only to you — take a breath and begin wherever you are.
                    </p>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={openComposer}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="btn-sage self-start !px-5 !py-3 sm:self-auto"
                  >
                    <PenLine className="h-4 w-4" />
                    Write Entry
                  </motion.button>
                </div>
              </section>

              {error && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[12px] text-danger sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="self-start font-medium underline decoration-danger/40 underline-offset-4 sm:self-auto"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card, index) => (
                  <StatCard
                    key={card.label}
                    {...card}
                    loading={statsLoading}
                    delay={0.15 + index * 0.06}
                  />
                ))}
              </div>

              <div className="mt-8 space-y-8">
                <ActivityHeatmap
                  activity={stats.activity}
                  loading={statsLoading}
                />

                <RecentEntries
                  entries={entries}
                  totalChronicles={entriesTotal}
                  loading={entriesLoading}
                  activeTag={activeTag}
                  onClearTag={() => handleSelectTag("")}
                  onOpenEntry={setReaderEntry}
                  onNewEntry={openComposer}
                />

                <DailyPrompt
                  onReflect={(prompt) => {
                    setComposerPrompt(prompt);
                    setComposerOpen(true);
                  }}
                />
              </div>

              <footer className="mt-10 flex flex-col gap-3 border-t border-hairline pb-4 pt-6 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  All entries encrypted in transit via JWT/HTTPS
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="transition-colors hover:text-charcoal"
                  >
                    Home
                  </Link>
                  <span>•</span>
                  <a
                    href="#recent-entries"
                    className="transition-colors hover:text-charcoal"
                  >
                    My Journal
                  </a>
                  <span>•</span>
                  <a
                    href="#writing-rhythms"
                    className="transition-colors hover:text-charcoal"
                  >
                    Insights
                  </a>
                </div>
              </footer>
            </div>
          </main>
        </div>

        <EntryComposer
          key={composerOpen ? composerPrompt || "blank" : "closed"}
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          token={token}
          onCreated={handleCreated}
          initialPrompt={composerPrompt}
        />

        <EntryReader
          key={readerEntry?._id || "closed"}
          entry={readerEntry}
          onClose={() => setReaderEntry(null)}
        />

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 right-5 z-[70] rounded-xl border border-hairline bg-paper px-4 py-3 text-[12px] text-charcoal shadow-paper-lg"
          >
            {notice}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
