import { CalendarDays } from "lucide-react";
import { formatEntryDate, formatMonth, dayKey } from "../../lib/journal";

const intensityClasses = [
  "bg-warm-beige",
  "bg-sage-light",
  "bg-sage/40",
  "bg-sage/70",
  "bg-sage",
];

const buildWeeks = (activity = [], weekCount = 12) => {
  const activityByDay = new Map(activity.map((item) => [item.date, item]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsetToMonday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - offsetToMonday - (weekCount - 1) * 7);

  const weeks = [];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const days = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + weekIndex * 7 + dayIndex);

      const key = dayKey(date);
      const record = activityByDay.get(key);

      days.push({
        key,
        date,
        entries: record?.entries || 0,
        words: record?.words || 0,
        future: date > today,
        today: key === dayKey(today),
      });
    }

    weeks.push({ days, label: formatMonth(days[0].date) });
  }

  return weeks;
};

export default function ActivityHeatmap({
  activity = [],
  loading = false,
  weeks = 12,
  title = "Writing rhythms",
  subtitle = "A 12-week archival habit tracker",
  id = "writing-rhythms",
}) {
  const builtWeeks = buildWeeks(activity, weeks);
  const gridStyle = {
    gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
  };
  const visibleDays = builtWeeks
    .flatMap((week) => week.days)
    .filter((day) => !day.future);
  const activeDays = visibleDays.filter((day) => day.entries > 0).length;
  const cadence = visibleDays.length
    ? Math.round((activeDays / visibleDays.length) * 100)
    : 0;
  const maxWords = Math.max(...visibleDays.map((day) => day.words), 0);

  const intensity = (day) => {
    if (day.future || !day.entries) return 0;
    if (!maxWords) return 1;

    const ratio = day.words / maxWords;

    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-hairline bg-paper p-6 shadow-paper sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-charcoal sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-gray">
            <CalendarDays className="h-3.5 w-3.5 text-sage" />
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-gray">
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {intensityClasses.map((className, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-[2px] ${className}`}
              />
            ))}
            <span>More</span>
          </div>
          <span className="h-1 w-1 rounded-full bg-hairline" />
          <span className="font-medium text-sage-deep">{cadence}% cadence</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-hairline/60" />
          <div className="h-[134px] w-full animate-pulse rounded-lg bg-warm-beige/70" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div
            className="min-w-[540px]"
            style={{ minWidth: `${Math.max(weeks * 16, 540)}px` }}
          >
            <div className="mb-2 flex pl-8">
              <div className="grid flex-1 gap-1.5" style={gridStyle}>
                {builtWeeks.map((week, index) => (
                  <span
                    key={week.days[0].key}
                    className="text-[9px] uppercase tracking-wider text-muted-gray"
                  >
                    {index === 0 ||
                    week.label !== builtWeeks[index - 1].label
                      ? week.label
                      : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex h-[134px] flex-col justify-between pr-1 text-[9px] text-muted-gray">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="grid flex-1 gap-1.5" style={gridStyle}>
                {builtWeeks.map((week) => (
                  <div
                    key={week.days[0].key}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {week.days.map((day) => {
                      const level = intensity(day);
                      const dayTitle = day.future
                        ? ""
                        : `${formatEntryDate(day.date)} · ${day.entries} ${
                            day.entries === 1 ? "entry" : "entries"
                          } · ${day.words.toLocaleString("en-US")} words`;

                      return (
                        <span
                          key={day.key}
                          title={dayTitle}
                          className={`h-3.5 w-3.5 justify-self-center rounded-[3px] ${intensityClasses[level]} ${
                            day.today
                              ? "ring-1 ring-sage ring-offset-1 ring-offset-paper"
                              : ""
                          } ${day.future ? "opacity-35" : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
