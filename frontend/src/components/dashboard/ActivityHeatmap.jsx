import { CalendarDays } from "lucide-react";
import { formatEntryDate, formatMonth, dayKey } from "../../lib/journal";

const intensityClasses = [
  "bg-warm-beige",
  "bg-sage-light",
  "bg-sage/40",
  "bg-sage/70",
  "bg-sage-deep",
];

const buildWeeks = (activity = [], weekCount = 12, startDate = null) => {
  const activityByDay = new Map(activity.map((item) => [item.date, item]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rangeStart = null;
  let start = null;
  let weeksToBuild = weekCount;

  if (startDate) {
    rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);

    start = new Date(rangeStart);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const days =
      Math.floor((today - start) / (24 * 60 * 60 * 1000)) + 1;
    weeksToBuild = Math.max(1, Math.ceil(days / 7));
  } else {
    const offsetToMonday = (today.getDay() + 6) % 7;
    start = new Date(today);
    start.setDate(today.getDate() - offsetToMonday - (weekCount - 1) * 7);
  }

  const weeks = [];

  for (let weekIndex = 0; weekIndex < weeksToBuild; weekIndex += 1) {
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
        outside: Boolean(rangeStart && date < rangeStart),
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
  startDate = null,
  onSelectDay,
  title = "Writing rhythms",
  subtitle = "A 12-week archival habit tracker",
  id = "writing-rhythms",
  lessLabel = "Less",
  moreLabel = "More",
}) {
  const builtWeeks = buildWeeks(activity, weeks, startDate);
  const gridStyle = {
    gridTemplateColumns: `repeat(${builtWeeks.length}, 16px)`,
  };
  const visibleDays = builtWeeks
    .flatMap((week) => week.days)
    .filter((day) => !day.future && !day.outside);
  const activeDays = visibleDays.filter((day) => day.entries > 0).length;
  const cadence = visibleDays.length
    ? Math.round((activeDays / visibleDays.length) * 100)
    : 0;
  const maxWords = Math.max(...visibleDays.map((day) => day.words), 0);

  const intensity = (day) => {
    if (day.future || day.outside || !day.entries) return 0;
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
            <span>{lessLabel}</span>
            {intensityClasses.map((className, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-[3px] ${className}`}
              />
            ))}
            <span>{moreLabel}</span>
          </div>
          <span className="h-1 w-1 rounded-full bg-hairline" />
          <span className="font-medium text-sage-deep">
            <span className="stat-number mr-1.5">{cadence}%</span> cadence
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-hairline/60" />
          <div className="h-[148px] w-full animate-pulse rounded-lg bg-warm-beige/70" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="w-max">
            <div className="mb-2 flex pl-8">
              <div className="grid gap-1.5" style={gridStyle}>
                {builtWeeks.map((week, index) => (
                  <span
                    key={week.days[0].key}
                    className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-gray"
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
              <div className="grid h-[148px] grid-rows-[repeat(7,1fr)] gap-1.5 pr-1 text-[9px] text-muted-gray">
                {["Mon", "", "Wed", "", "Fri", "", "Sun"].map(
                  (label, index) => (
                    <span
                      key={index}
                      className="flex h-4 items-center justify-end"
                    >
                      {label}
                    </span>
                  ),
                )}
              </div>

              <div className="grid gap-1.5" style={gridStyle}>
                {builtWeeks.map((week) => (
                  <div
                    key={week.days[0].key}
                    className="grid h-[148px] grid-rows-[repeat(7,1fr)] gap-1.5"
                  >
                    {week.days.map((day) => {
                      const level = intensity(day);
                      const interactive =
                        Boolean(onSelectDay) &&
                        day.entries > 0 &&
                        !day.future &&
                        !day.outside;
                      const dayTitle = day.future || day.outside
                        ? ""
                        : `${formatEntryDate(day.date)} - ${day.entries} ${
                            day.entries === 1 ? "entry" : "entries"
                          } - ${day.words.toLocaleString("en-US")} words`;

                      return (
                        <span
                          key={day.key}
                          title={dayTitle}
                          className="flex h-4 w-4 items-center justify-center justify-self-center"
                        >
                          <button
                            type="button"
                            disabled={!interactive}
                            onClick={() => onSelectDay?.(day.key)}
                            aria-label={dayTitle}
                            className={`h-4 w-4 rounded-[3px] transition-transform ${intensityClasses[level]} ${
                              day.today
                                ? "ring-1 ring-sage ring-offset-1 ring-offset-paper"
                                : ""
                            } ${
                              day.future || day.outside ? "opacity-30" : ""
                            } ${
                              interactive
                                ? "cursor-pointer hover:scale-110 hover:ring-1 hover:ring-sage/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1 focus-visible:ring-offset-paper"
                                : "pointer-events-none cursor-default"
                            }`}
                          />
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 border-t border-hairline/70 pt-3 text-[10px] leading-relaxed text-muted-gray">
        {onSelectDay
          ? "Select a day with entries to open that date in your journal."
          : "Each square represents one day. Darker squares hold more words."}
      </p>
    </section>
  );
}
