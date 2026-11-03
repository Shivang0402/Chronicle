import { motion } from "framer-motion";
import {
  AlignLeft,
  BookOpen,
  CalendarDays,
  Download,
  Feather,
  Flame,
  Loader2,
  Smile,
  Sparkles,
  Tags,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import StatCard from "../components/dashboard/StatCard";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import { formatEntryDate } from "../lib/journal";

const emptyStats = {
  totalChronicles: 0,
  totalWords: 0,
  averageWords: 0,
  entriesThisMonth: 0,
  entriesThisYear: 0,
  mostCommonMood: "",
  currentStreak: 0,
  longestStreak: 0,
  range: "year",
  rangeStart: null,
  activity: [],
  moodBreakdown: [],
  trend: [],
};

const RANGE_OPTIONS = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All time" },
];

const CURRENT_YEAR = new Date().getFullYear();

const MOOD_COLORS = [
  "#50614B",
  "#7D9177",
  "#A9BFA1",
  "#C9D6C2",
  "#5C5C57",
  "#A8A8A0",
  "#D8C9B5",
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

const formatTrendLabel = (label) => {
  if (!label) return "";

  if (/^\d{4}-\d{2}$/.test(label)) {
    return new Date(`${label}-01T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }

  return new Date(`${label}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getScopeLabel = (range, rangeStart) => {
  if (range === "all" || !rangeStart) return "All preserved entries";

  return `${formatEntryDate(rangeStart)} – ${formatEntryDate(new Date())}`;
};

function MoodDonut({ moodBreakdown = [], mostCommonMood = "", loading }) {
  const total = moodBreakdown.reduce((sum, item) => sum + item.count, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const segments = [];
  let cursor = 0;

  moodBreakdown.forEach((item, index) => {
    const length = total ? (item.count / total) * circumference : 0;

    segments.push({
      ...item,
      color: MOOD_COLORS[index % MOOD_COLORS.length],
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -cursor,
    });

    cursor += length;
  });

  const topMood = moodBreakdown[0];
  const topPercent = total ? Math.round((topMood.count / total) * 100) : 0;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 shadow-paper transition-shadow duration-300 hover:shadow-paper-lg sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-charcoal">
            Mood distribution
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-gray">
            <Smile className="h-3.5 w-3.5 text-sage" />
            Breakdown of moods tagged in your entries
          </p>
        </div>
        <span className="rounded-full bg-warm-beige px-2.5 py-1 text-[9px] uppercase tracking-wider text-muted-gray">
          {loading ? "—" : `${total} tagged`}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row">
          <div className="h-44 w-44 animate-pulse rounded-full bg-warm-beige/70" />
          <div className="w-full space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-3 animate-pulse rounded bg-hairline/60"
              />
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-hairline bg-warm-beige/30 px-5 py-10 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
            <Smile className="h-4 w-4" />
          </span>
          <p className="mt-3 max-w-[220px] text-[12px] leading-relaxed text-charcoal-muted">
            Add a mood to an entry and your emotional weather will begin to
            take shape here.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-44 w-44 shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#EDE9DF"
                strokeWidth="18"
              />
              {segments.map((segment) => (
                <circle
                  key={segment.mood}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="18"
                  strokeDasharray={segment.dasharray}
                  strokeDashoffset={segment.dashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-serif text-3xl leading-none text-charcoal">
                  {topPercent}%
                </p>
                <p className="mx-auto mt-1 max-w-[86px] truncate text-[9px] uppercase tracking-wide2 text-muted-gray">
                  {topMood?.mood || mostCommonMood || "No mood"}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            {segments.map((segment) => (
              <div
                key={segment.mood}
                className="flex items-center gap-2.5 text-[11px]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="min-w-0 flex-1 truncate text-charcoal-muted">
                  {segment.mood}
                </span>
                <span className="font-medium text-charcoal">
                  {segment.count}
                </span>
                <span className="w-9 text-right text-muted-gray">
                  {Math.round((segment.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 border-t border-hairline/70 pt-3 text-[10px] leading-relaxed text-muted-gray">
        Moods are self-assigned when you complete an entry.
      </p>
    </section>
  );
}

function TrendChart({ trend = [], loading }) {
  const maxWords = Math.max(...trend.map((item) => item.words), 1);
  const totalWords = trend.reduce((sum, item) => sum + item.words, 0);
  const totalEntries = trend.reduce((sum, item) => sum + item.entries, 0);
  const peak = trend.length
    ? trend.reduce(
        (best, item) => (item.words > best.words ? item : best),
        trend[0],
      )
    : null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-hairline bg-paper p-6 shadow-paper transition-shadow duration-300 hover:shadow-paper-lg sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-charcoal">
            Writing volume trends
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-gray">
            <TrendingUp className="h-3.5 w-3.5 text-sage" />
            Words and entries across the selected range
          </p>
        </div>
        <span className="rounded-full bg-warm-beige px-2.5 py-1 text-[9px] uppercase tracking-wider text-muted-gray">
          {loading ? "—" : `${trend.length} periods`}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 space-y-3">
          <div className="h-44 w-full animate-pulse rounded-lg bg-warm-beige/70" />
          <div className="h-3 w-48 animate-pulse rounded bg-hairline/60" />
        </div>
      ) : trend.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-hairline bg-warm-beige/30 px-5 py-10 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="mt-3 max-w-[240px] text-[12px] leading-relaxed text-charcoal-muted">
            No entries fall inside this range yet. Try a wider scope or write a
            new page.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-end">
          <div className="overflow-x-auto pb-1">
            <div style={{ minWidth: `${Math.max(trend.length * 28, 280)}px` }}>
              <div className="flex h-44 items-end gap-1.5 border-b border-hairline pb-2">
                {trend.map((item) => {
                  const height = Math.max(
                    4,
                    Math.round((item.words / maxWords) * 100),
                  );

                  return (
                    <div
                      key={item.label}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-sage-light transition-colors group-hover:bg-sage"
                        style={{ height: `${height}%` }}
                        title={`${formatTrendLabel(item.label)} · ${
                          item.entries
                        } ${
                          item.entries === 1 ? "entry" : "entries"
                        } · ${formatNumber(item.words)} words`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex gap-1.5">
                {trend.map((item) => (
                  <span
                    key={item.label}
                    className="flex-1 text-center text-[8px] uppercase tracking-wider text-muted-gray"
                  >
                    {formatTrendLabel(item.label)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-hairline/70 pt-3 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between">
            <span>
              {formatNumber(totalEntries)} entries ·{" "}
              {formatNumber(totalWords)} words
            </span>
            <span className="font-medium text-sage-deep">
              Peak:{" "}
              {peak
                ? `${formatTrendLabel(peak.label)} · ${formatNumber(
                    peak.words,
                  )} words`
                : "—"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function TagCloud({ tags = [], loading }) {
  return (
    <section className="rounded-2xl border border-hairline bg-paper p-6 shadow-paper transition-shadow duration-300 hover:shadow-paper-lg sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-charcoal">
            Frequent topics &amp; tags
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-gray">
            <Tags className="h-3.5 w-3.5 text-sage" />
            The themes that keep returning to your pages
          </p>
        </div>
        <span className="rounded-full bg-warm-beige px-2.5 py-1 text-[9px] uppercase tracking-wider text-muted-gray">
          {loading ? "—" : `${tags.length} themes`}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <span
              key={item}
              className="h-8 w-24 animate-pulse rounded-full bg-hairline/60"
            />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline bg-warm-beige/30 px-5 py-10 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
            <Tags className="h-4 w-4" />
          </span>
          <p className="mt-3 max-w-[280px] text-[12px] leading-relaxed text-charcoal-muted">
            Tags will gather here as you name the themes in your entries. Add a
            few to see what keeps returning.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 12).map((item, index) => (
            <Link
              key={item.tag}
              to={`/journal?tag=${encodeURIComponent(item.tag)}`}
              className={`rounded-full border border-transparent px-3 py-1.5 text-[11px] transition-colors hover:border-sage/30 ${
                index < 3
                  ? "bg-sage-subtle text-sage-deep"
                  : "bg-warm-beige text-charcoal-muted hover:text-charcoal"
              }`}
            >
              #{item.tag}
              <span className="ml-1 text-[9px] opacity-70">{item.count}</span>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 border-t border-hairline/70 pt-3 text-[10px] leading-relaxed text-muted-gray">
        Gathered from every entry in your archive.
      </p>
    </section>
  );
}

function ReflectionCard({ stats, loading }) {
  const hasEntries = stats.totalChronicles > 0;
  const heading = hasEntries
    ? "Your archive has a rhythm."
    : "Your story is just beginning.";
  const body = hasEntries
    ? `You have preserved ${formatNumber(stats.totalChronicles)} ${
        stats.totalChronicles === 1 ? "entry" : "entries"
      } and ${formatNumber(stats.totalWords)} words. ${
        stats.mostCommonMood
          ? `“${stats.mostCommonMood}” appears most often in your pages.`
          : "Your moods are still taking shape."
      } Your longest streak is ${formatNumber(stats.longestStreak)} ${
        stats.longestStreak === 1 ? "day" : "days"
      }.`
    : "Write a first entry to begin noticing patterns in your mood, volume, and cadence. Every page adds a little more shape to the story.";

  return (
    <section className="rounded-2xl border border-hairline bg-sage-subtle/60 p-6 shadow-paper transition-shadow duration-300 hover:shadow-paper-lg sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <span className="eyebrow">A quiet observation</span>
          {loading ? (
            <>
              <div className="mt-3 h-7 w-56 animate-pulse rounded bg-hairline/60" />
              <div className="mt-3 h-3 w-full max-w-xl animate-pulse rounded bg-hairline/60" />
              <div className="mt-2 h-3 w-2/3 max-w-md animate-pulse rounded bg-hairline/60" />
            </>
          ) : (
            <>
              <h2 className="mt-2 font-serif text-2xl tracking-tight text-charcoal">
                {heading}
              </h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-charcoal-muted sm:text-[13px]">
                {body}
              </p>
              <p className="mt-4 border-t border-sage/15 pt-3 text-[10px] uppercase tracking-wider text-muted-gray">
                All analytics are computed directly from your saved
                reflections.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function InsightsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(emptyStats);
  const [allStats, setAllStats] = useState(emptyStats);
  const [tags, setTags] = useState([]);
  const [range, setRange] = useState("year");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle("Insights");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    const loadInsights = async () => {
      const [statsData, allStatsData, tagsData] = await Promise.all([
        chronicleApi.getStats(token, { range }),
        range === "all"
          ? Promise.resolve(null)
          : chronicleApi.getStats(token, { range: "all" }),
        chronicleApi.getTags(token),
      ]);

      return { statsData, allStatsData, tagsData };
    };

    loadInsights()
      .then(({ statsData, allStatsData, tagsData }) => {
        if (!active) return;

        setStats({ ...emptyStats, ...(statsData || {}) });
        setAllStats({ ...emptyStats, ...(allStatsData || statsData || {}) });
        setTags(Array.isArray(tagsData) ? tagsData : []);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError?.message ||
            "Could not open your insights. Please try again.",
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, range, reloadKey]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const statCards = [
    {
      label: "Total entries",
      value: stats.totalChronicles,
      icon: BookOpen,
      footerLabel: "This year",
      footerValue: `${formatNumber(stats.entriesThisYear)} ${
        stats.entriesThisYear === 1 ? "entry" : "entries"
      }`,
    },
    {
      label: "Total words",
      value: stats.totalWords,
      icon: Feather,
      footerLabel: "Approx. pages",
      footerValue: `${formatNumber(Math.round(stats.totalWords / 250))} pages`,
    },
    {
      label: "Average entry",
      value: stats.averageWords,
      suffix: " words",
      icon: AlignLeft,
      footerLabel: "This month",
      footerValue: `${formatNumber(stats.entriesThisMonth)} ${
        stats.entriesThisMonth === 1 ? "entry" : "entries"
      }`,
    },
    {
      label: "Current streak",
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? " day" : " days",
      icon: Flame,
      footerLabel: "Longest streak",
      footerValue: `${formatNumber(stats.longestStreak)} ${
        stats.longestStreak === 1 ? "day" : "days"
      }`,
    },
    {
      label: "Longest streak",
      value: stats.longestStreak,
      suffix: stats.longestStreak === 1 ? " day" : " days",
      icon: Trophy,
      footerLabel: "Most common mood",
      footerValue: stats.mostCommonMood || "No mood yet",
    },
  ];

  const changeRange = (nextRange) => {
    if (nextRange === range) return;

    setRange(nextRange);
    setLoading(true);
    setError("");
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const handleNewEntry = () => {
    navigate("/journal/new");
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleTagNavigate = (nextTag) => {
    navigate(nextTag ? `/journal?tag=${encodeURIComponent(nextTag)}` : "/journal");
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
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `chronicles-${today}.pdf`;
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

  const scopeLabel = getScopeLabel(range, stats.rangeStart);
  const allActivity = allStats.activity?.length
    ? allStats.activity
    : stats.activity;

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag=""
          onSelectTag={handleTagNavigate}
          onClearTag={() => navigate("/journal")}
          onNewEntry={handleNewEntry}
          onExport={handleExport}
          onLogout={handleLogout}
          exporting={exporting}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          title="Insights"
          onOpenMenu={() => setMobileNavOpen(true)}
          onNewEntry={handleNewEntry}
          onLogout={handleLogout}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen overflow-x-clip pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/4 top-1/3 h-[28rem] w-[28rem] rounded-full bg-sage-light/10 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
              >
                <div className="max-w-2xl">
                  <span className="eyebrow mb-3 block">
                    Personal reflections &amp; archive metrics
                  </span>
                  <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl">
                    Your Journey
                  </h1>
                  <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-charcoal-muted sm:text-[15px]">
                    A calm perspective on your writing rhythms, emotional
                    cadence, and evolving thoughts across time.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="inline-flex w-fit flex-wrap gap-1 rounded-full border border-hairline bg-warm-beige/60 p-1">
                    {RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeRange(option.value)}
                        className={`rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                          range === option.value
                            ? "bg-paper text-charcoal shadow-sm"
                            : "text-charcoal-muted hover:text-charcoal"
                        }`}
                      >
                        {option.value === "year"
                          ? `Year (${CURRENT_YEAR})`
                          : option.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="btn-ghost self-start border border-hairline !px-4 !py-2.5 text-[11px] sm:self-auto"
                  >
                    {exporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {exporting ? "Preparing..." : "Export archive"}
                  </button>
                </div>
              </motion.div>

              <div className="mt-7 flex flex-col gap-2 rounded-xl border border-hairline bg-paper px-4 py-3 text-[11px] text-muted-gray shadow-paper sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sage" />
                  <span className="font-medium uppercase tracking-wide2 text-charcoal">
                    Active scope
                  </span>
                  <span className="h-1 w-1 rounded-full bg-hairline" />
                  <span>
                    {loading ? "Gathering your pages..." : scopeLabel}
                  </span>
                </div>
                <span className="uppercase tracking-wider">
                  Private ledger · {formatNumber(stats.totalChronicles)}{" "}
                  {stats.totalChronicles === 1 ? "entry" : "entries"}
                </span>
              </div>

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

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((card, index) => (
                  <StatCard
                    key={card.label}
                    {...card}
                    loading={loading}
                    delay={0.1 + index * 0.05}
                  />
                ))}
              </div>

              <div className="mt-8 space-y-6">
                <ActivityHeatmap
                  activity={allActivity}
                  loading={loading}
                  weeks={52}
                  title="Writing cadence heatmap"
                  subtitle="A year of preserved pages"
                  id="writing-rhythms"
                  lessLabel="Fewer entries"
                  moreLabel="More entries"
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <MoodDonut
                    moodBreakdown={stats.moodBreakdown}
                    mostCommonMood={stats.mostCommonMood}
                    loading={loading}
                  />
                  <TrendChart trend={stats.trend} loading={loading} />
                </div>

                <TagCloud tags={tags} loading={loading} />

                <ReflectionCard stats={stats} loading={loading} />
              </div>

              <footer className="mt-10 flex flex-col gap-3 border-t border-hairline pb-4 pt-6 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  A private record, kept only for you
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="transition-colors hover:text-charcoal"
                  >
                    Dashboard
                  </Link>
                  <span>•</span>
                  <Link
                    to="/journal"
                    className="transition-colors hover:text-charcoal"
                  >
                    My Journal
                  </Link>
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
            className="fixed bottom-5 right-5 z-[70] rounded-xl border border-hairline bg-paper px-4 py-3 text-[12px] text-charcoal shadow-paper-lg"
          >
            {notice}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
