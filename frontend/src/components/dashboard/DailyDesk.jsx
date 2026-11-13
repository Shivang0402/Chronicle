import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Feather,
  Flame,
  PenLine,
  Sparkles,
} from "lucide-react";
import { dayKey, todayLabel } from "../../lib/journal";

const buildWeek = (activity = []) => {
  const activityByDay = new Map(activity.map((item) => [item.date, item]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsetToMonday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - offsetToMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const key = dayKey(date);
    const record = activityByDay.get(key);

    return {
      key,
      date,
      label: date.toLocaleDateString("en-US", { weekday: "narrow" }),
      dayNumber: date.getDate(),
      entries: record?.entries || 0,
      words: record?.words || 0,
      today: key === dayKey(today),
      future: date > today,
    };
  });
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

export default function DailyDesk({
  stats,
  entries = [],
  loading = false,
  onWrite,
  onReadEntry,
  onOpenJournal,
}) {
  const week = buildWeek(stats.activity);
  const today = week.find((day) => day.today);
  const todayEntries = today
    ? entries.filter((entry) => dayKey(entry.date) === today.key)
    : [];
  const latestToday = todayEntries[0];
  const hasWrittenToday = (today?.entries || 0) > 0;
  const visibleWeek = week.filter((day) => !day.future);
  const weekEntries = visibleWeek.reduce((sum, day) => sum + day.entries, 0);
  const weekWords = visibleWeek.reduce((sum, day) => sum + day.words, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-hairline bg-paper shadow-paper"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sage-light/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-warm-beige/70 blur-3xl" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col justify-between">
          <div>
            <span className="eyebrow flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Today · {todayLabel()}
            </span>

            {loading ? (
              <div className="mt-5 space-y-3">
                <div className="h-9 w-4/5 animate-pulse rounded bg-hairline/60" />
                <div className="h-4 w-full animate-pulse rounded bg-hairline/50" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-hairline/50" />
              </div>
            ) : (
              <>
                <h2 className="mt-4 max-w-lg font-serif text-2xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                  {hasWrittenToday
                    ? "Today is already part of your story."
                    : "Your day has a blank page."}
                </h2>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-charcoal-muted sm:text-[14px]">
                  {hasWrittenToday
                    ? `You have preserved ${formatNumber(today.entries)} ${
                        today.entries === 1 ? "entry" : "entries"
                      } and ${formatNumber(
                        today.words,
                      )} words today. Add another thought whenever it arrives.`
                    : "A few quiet lines are enough to begin. Start with what you noticed, felt, or want to remember."}
                </p>
              </>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onWrite}
                disabled={loading}
                className="btn-sage !px-5 !py-3 disabled:cursor-wait"
              >
                <PenLine className="h-4 w-4" />
                {hasWrittenToday ? "Add another thought" : "Begin today's page"}
              </button>

              {hasWrittenToday && latestToday ? (
                <button
                  type="button"
                  onClick={() => onReadEntry(latestToday)}
                  className="btn-ghost border border-hairline !px-4 !py-2.5 text-[11px]"
                >
                  Read today's page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenJournal}
                  className="btn-ghost border border-hairline !px-4 !py-2.5 text-[11px]"
                >
                  Browse your archive
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline/70 pt-4 text-[10px] uppercase tracking-wider text-muted-gray">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-sage" />
              <span className="stat-number mr-1.5">
                {formatNumber(stats.currentStreak)}
              </span>{" "}
              day streak
            </span>
            <span className="flex items-center gap-1.5">
              <Feather className="h-3.5 w-3.5 text-sage" />
              <span className="stat-number mr-1.5">
                {formatNumber(stats.entriesThisMonth)}
              </span>{" "}
              this month
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sage" />
              {stats.mostCommonMood || "No mood yet"}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-hairline bg-warm-beige/40 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-wide2 text-muted-gray">
                This week
              </p>
              <p className="mt-1 font-serif text-lg text-charcoal">
                Your writing rhythm
              </p>
            </div>
            <span className="rounded-full bg-paper px-2.5 py-1 text-[9px] uppercase tracking-wider text-muted-gray">
              <span className="stat-number mr-1.5">{weekEntries}</span>{" "}
              {weekEntries === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1">
            {week.map((day) => (
              <div
                key={day.key}
                title={`${formatNumber(day.entries)} ${
                  day.entries === 1 ? "entry" : "entries"
                } · ${formatNumber(day.words)} words`}
                className={`flex flex-col items-center gap-1.5 rounded-lg py-2 ${
                  day.today ? "bg-paper shadow-sm" : ""
                }`}
              >
                <span className="text-[8px] uppercase tracking-wider text-muted-gray">
                  {day.label}
                </span>
                <span
                  className={`stat-number grid h-7 w-7 place-items-center rounded-full text-[10px] font-medium ${
                    day.entries
                      ? "bg-sage-deep text-on-primary"
                      : day.future
                        ? "bg-paper/40 text-muted-gray/40"
                        : "border border-hairline bg-paper/70 text-charcoal-muted"
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span
                  className={`h-1 w-1 rounded-full ${
                    day.entries ? "bg-sage-deep" : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-hairline/70 pt-3 text-[10px] text-muted-gray">
            <span className="stat-number mr-1.5">
              {formatNumber(weekWords)}
            </span>{" "}
            words across{" "}
            <span className="stat-number mr-1.5">
              {formatNumber(weekEntries)}
            </span>{" "}
            {weekEntries === 1 ? "entry" : "entries"} this week
          </p>
        </div>
      </div>
    </motion.section>
  );
}
