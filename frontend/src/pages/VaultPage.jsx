import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DailyDesk from "../components/dashboard/DailyDesk";
import DailyPrompt from "../components/dashboard/DailyPrompt";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import EntryReader from "../components/dashboard/EntryReader";
import RecentEntries from "../components/dashboard/RecentEntries";
import PageTransition from "../components/ui/PageTransition";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import { getAccountId } from "../lib/cryptoSession.js";
import { exportNotice } from "../lib/exportFormats";
import { exportEntriesInBrowser } from "../lib/clientExport.js";
import { countWords, dayKey, greetingForNow } from "../lib/journal";

const fetchAllEntries = async (token, ownerId) => {
  const firstPage = await chronicleApi.getChronicles(
    token,
    { page: 1, limit: 20, sort: "oldest" },
    ownerId,
  );
  const totalPages = Math.max(Number(firstPage?.totalPages) || 1, 1);
  const entries = [...(firstPage?.chronicles || [])];

  for (let startPage = 2; startPage <= totalPages; startPage += 4) {
    const pageNumbers = Array.from(
      { length: Math.min(4, totalPages - startPage + 1) },
      (_, index) => startPage + index,
    );
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        chronicleApi.getChronicles(
          token,
          { page, limit: 20, sort: "oldest" },
          ownerId,
        ),
      ),
    );
    pages.forEach((result) => entries.push(...(result?.chronicles || [])));
  }

  return entries;
};

const buildDashboardData = (archiveEntries, activeTag) => {
  const newestFirst = [...archiveEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const tagCounts = new Map();
  const moodCounts = new Map();
  const activityByDay = new Map();

  for (const entry of archiveEntries) {
    const mood = typeof entry.mood === "string" ? entry.mood.trim() : "";
    if (mood) moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    const day = dayKey(entry.date);
    const activity = activityByDay.get(day) || { date: day, entries: 0, words: 0 };
    activity.entries += 1;
    activity.words += countWords(entry.content || "");
    activityByDay.set(day, activity);

    for (const rawTag of Array.isArray(entry.tags) ? entry.tags : []) {
      const tag = typeof rawTag === "string" ? rawTag.trim() : "";
      if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const dateKeys = [...activityByDay.keys()].sort();
  const lastDate = dateKeys.at(-1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let currentStreak = 0;
  if (lastDate === dayKey(new Date()) || lastDate === dayKey(yesterday)) {
    currentStreak = 1;
    for (let index = dateKeys.length - 1; index > 0; index -= 1) {
      const current = new Date(`${dateKeys[index]}T00:00:00`);
      const previous = new Date(`${dateKeys[index - 1]}T00:00:00`);
      if (Math.round((current - previous) / 86400000) !== 1) break;
      currentStreak += 1;
    }
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const filteredEntries = activeTag
    ? newestFirst.filter((entry) =>
        Array.isArray(entry.tags) && entry.tags.some((tag) => String(tag).trim() === activeTag),
      )
    : newestFirst;

  return {
    stats: {
      currentStreak,
      entriesThisMonth: archiveEntries.filter((entry) => new Date(entry.date) >= monthStart).length,
      mostCommonMood: [...moodCounts].sort((a, b) => b[1] - a[1])[0]?.[0] || "",
      activity: [...activityByDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
    },
    tags: [...tagCounts]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
    entries: filteredEntries.slice(0, 20),
    total: filteredEntries.length,
  };
};

export default function VaultPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const ownerId = getAccountId(user);
  const [archiveEntries, setArchiveEntries] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [readerEntry, setReaderEntry] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle("Dashboard");

  useEffect(() => {
    if (!token || !ownerId) return undefined;

    let active = true;
    setStatsLoading(true);
    setEntriesLoading(true);
    setArchiveEntries([]);
    setError("");

    fetchAllEntries(token, ownerId)
      .then((allEntries) => {
        if (!active) return;

        setArchiveEntries(allEntries);
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
  }, [token, ownerId, reloadKey]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const { stats, tags, entries, total: entriesTotal } = useMemo(
    () => buildDashboardData(archiveEntries, activeTag),
    [archiveEntries, activeTag],
  );

  const firstName = user?.name?.split(" ")[0] || "wanderer";
  const greeting = greetingForNow();

  const openEditor = (prompt = "") => {
    navigate("/journal/new", prompt ? { state: { prompt } } : undefined);
  };

  const handleSelectTag = (tag) => {
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

  const handleExport = () => {
    setExportError("");
    setExportDialogOpen(true);
  };

  const handleExportDownload = (filters, selectedEntries) => {
    if (!token || exporting) return;

    setExporting(true);

    try {
      const format = filters.format || "pdf";
      exportEntriesInBrowser(selectedEntries, format);
      setNotice(exportNotice(format));
      setExportDialogOpen(false);
    } catch (exportError) {
      setExportError(exportError?.message || "Could not export your journal.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageTransition variant="rise">
      <div className="min-h-screen bg-ivory">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag={activeTag}
          onSelectTag={handleSelectTag}
          onClearTag={() => handleSelectTag("")}
          onNewEntry={() => openEditor()}
          onExport={handleExport}
          onLogout={handleLogout}
          exporting={exporting}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          onOpenMenu={() => setMobileNavOpen(true)}
          onLogout={handleLogout}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen overflow-x-clip pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <section id="dashboard-top" className="scroll-mt-24">
                <Reveal
                  variant="down"
                  y={18}
                  blur={false}
                  className="max-w-2xl"
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
                </Reveal>
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

              <Reveal
                variant="scale"
                y={22}
                delay={0.08}
                amount={0.08}
                className="mt-8"
              >
                <DailyDesk
                  stats={stats}
                  entries={entries}
                  loading={statsLoading || entriesLoading}
                  onWrite={() => openEditor()}
                  onReadEntry={setReaderEntry}
                  onOpenJournal={() => navigate("/journal")}
                />
              </Reveal>

              <div className="mt-8 space-y-8">
                <Reveal variant="left" y={24} amount={0.08}>
                  <RecentEntries
                    entries={entries}
                    totalChronicles={entriesTotal}
                    loading={entriesLoading}
                    activeTag={activeTag}
                    onClearTag={() => handleSelectTag("")}
                    onOpenEntry={setReaderEntry}
                  />
                </Reveal>

                <Reveal variant="right" y={24} amount={0.08}>
                  <DailyPrompt onReflect={(prompt) => openEditor(prompt)} />
                </Reveal>
              </div>

              <Reveal
                as="footer"
                variant="fade"
                y={10}
                blur={false}
                className="mt-10 flex flex-col gap-3 border-t border-hairline pb-4 pt-6 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Your entries are encrypted in transit and at rest
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
                  <Link
                    to="/insights"
                    className="transition-colors hover:text-charcoal"
                  >
                    Insights
                  </Link>
                </div>
              </Reveal>
            </div>
          </main>
        </div>

        <EntryReader
          key={readerEntry?._id || "closed"}
          entry={readerEntry}
          onClose={() => setReaderEntry(null)}
        />

        <ExportDialog
          open={exportDialogOpen}
          token={token}
          ownerId={getAccountId(user)}
          exporting={exporting}
          exportError={exportError}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleExportDownload}
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
