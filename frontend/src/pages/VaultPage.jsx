import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DailyDesk from "../components/dashboard/DailyDesk";
import DailyPrompt from "../components/dashboard/DailyPrompt";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import EntryComposer from "../components/dashboard/EntryComposer";
import EntryReader from "../components/dashboard/EntryReader";
import RecentEntries from "../components/dashboard/RecentEntries";
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState("");
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

  const handleExport = () => {
    setExportError("");
    setExportDialogOpen(true);
  };

  const handleExportDownload = async (filters) => {
    if (!token || exporting) return;

    setExporting(true);

    try {
      const blob = await chronicleApi.exportEntries(token, { ...filters, format: "pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `chronicles-${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Your PDF is ready.");
      setExportDialogOpen(false);
    } catch (exportError) {
      setExportError(exportError?.message || "Could not export your PDF.");
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
          onLogout={handleLogout}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen overflow-x-clip pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <section id="dashboard-top" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                </motion.div>
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

              <div className="mt-8">
                <DailyDesk
                  stats={stats}
                  entries={entries}
                  loading={statsLoading || entriesLoading}
                  onWrite={openComposer}
                  onReadEntry={setReaderEntry}
                  onOpenJournal={() => navigate("/journal")}
                />
              </div>

              <div className="mt-8 space-y-8">
                <RecentEntries
                  entries={entries}
                  totalChronicles={entriesTotal}
                  loading={entriesLoading}
                  activeTag={activeTag}
                  onClearTag={() => handleSelectTag("")}
                  onOpenEntry={setReaderEntry}
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
                  <Link
                    to="/insights"
                    className="transition-colors hover:text-charcoal"
                  >
                    Insights
                  </Link>
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
          user={user}
          onCreated={handleCreated}
          initialPrompt={composerPrompt}
        />

        <EntryReader
          key={readerEntry?._id || "closed"}
          entry={readerEntry}
          onClose={() => setReaderEntry(null)}
        />

        <ExportDialog
          open={exportDialogOpen}
          token={token}
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
