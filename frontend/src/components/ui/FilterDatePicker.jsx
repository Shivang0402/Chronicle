import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  { short: "Jan", long: "January" },
  { short: "Feb", long: "February" },
  { short: "Mar", long: "March" },
  { short: "Apr", long: "April" },
  { short: "May", long: "May" },
  { short: "Jun", long: "June" },
  { short: "Jul", long: "July" },
  { short: "Aug", long: "August" },
  { short: "Sep", long: "September" },
  { short: "Oct", long: "October" },
  { short: "Nov", long: "November" },
  { short: "Dec", long: "December" },
];
const YEARS_PER_PAGE = 10;
const panelHeight = 350;
const menuTransition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] };

const pad = (value) => String(value).padStart(2, "0");

const toDateValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDateValue = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateLabel = (value, emptyLabel) => {
  const date = parseDateValue(value);

  if (!date) return emptyLabel;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const clampDate = (date, minDate, maxDate) => {
  if (minDate && date < minDate) return minDate;
  if (maxDate && date > maxDate) return maxDate;
  return date;
};

const isOutsideRange = (date, minDate, maxDate) =>
  Boolean(
    (minDate && date < minDate) || (maxDate && date > maxDate),
  );

export default function FilterDatePicker({
  value,
  onChange,
  label = "Date",
  placeholder = "Any date",
  min,
  max,
  variant = "filter",
  align = "left",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("calendar");
  const [viewDate, setViewDate] = useState(() => {
    const minDate = parseDateValue(min);
    const maxDate = parseDateValue(max);
    return clampDate(parseDateValue(value) || new Date(), minDate, maxDate);
  });
  const [panelPlacement, setPanelPlacement] = useState("down");
  const [todayValue] = useState(() => toDateValue(new Date()));
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  const minDate = parseDateValue(min);
  const maxDate = parseDateValue(max);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openPicker = () => {
    setViewDate(
      clampDate(
        parseDateValue(value) || parseDateValue(todayValue),
        minDate,
        maxDate,
      ),
    );
    setView("calendar");
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setPanelPlacement(
        spaceBelow < panelHeight && rect.top > panelHeight ? "up" : "down",
      );
    }
    setOpen(true);
  };

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - monthStart.getDay());

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  const decadeStart = Math.floor(viewDate.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const decadeLabel = `${decadeStart}–${decadeStart + YEARS_PER_PAGE - 1}`;
  const monthLabel = MONTHS[viewDate.getMonth()].long;
  const yearLabel = viewDate.getFullYear();
  const isTodayDisabled = isOutsideRange(
    parseDateValue(todayValue),
    minDate,
    maxDate,
  );
  const displayLabel = formatDateLabel(value, placeholder);

  const chooseDate = (date) => {
    if (isOutsideRange(date, minDate, maxDate)) return;
    onChange(toDateValue(date));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const movePeriod = (offset) => {
    setViewDate((current) => {
      if (view === "years") {
        return new Date(
          current.getFullYear() + offset * YEARS_PER_PAGE,
          current.getMonth(),
          1,
        );
      }

      if (view === "months") {
        return new Date(current.getFullYear() + offset, current.getMonth(), 1);
      }

      return new Date(
        current.getFullYear(),
        current.getMonth() + offset,
        1,
      );
    });
  };

  const selectMonth = (monthIndex) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), monthIndex, 1),
    );
    setView("calendar");
  };

  const selectYear = (year) => {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setView("calendar");
  };

  const clearDate = () => {
    onChange("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const periodLabel =
    view === "years" ? "decade" : view === "months" ? "year" : "month";

  const triggerClassName =
    variant === "field"
      ? `field-input flex items-center justify-between gap-2 text-left ${
          open ? "border-sage/70 bg-paper ring-4 ring-sage/15" : ""
        } ${className}`
      : `inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] transition-all duration-300 ${
          open || value
            ? "border-sage/50 bg-paper text-charcoal shadow-sm"
            : "border-hairline bg-warm-beige/60 text-charcoal-muted hover:border-sage/30 hover:bg-paper"
        } ${className}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) setOpen(false);
          else openPicker();
        }}
        className={triggerClassName}
        aria-label={`${label}: ${displayLabel}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sage" />
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? "text-charcoal" : "text-muted-gray"
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-sage-deep" : "text-muted-gray"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-label={`${label} picker`}
            initial={{ opacity: 0, y: panelPlacement === "up" ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: panelPlacement === "up" ? 4 : -4, scale: 0.98 }}
            transition={menuTransition}
            className={`absolute z-50 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-hairline bg-paper shadow-paper-lg ${
              panelPlacement === "up" ? "bottom-full mb-2" : "top-full mt-2"
            } ${align === "right" ? "right-0" : "left-0"}`}
          >
            <div className="flex items-center justify-between border-b border-hairline/70 px-3 py-2.5">
              <button
                type="button"
                onClick={() => movePeriod(-1)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                aria-label={`Previous ${periodLabel}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex min-w-0 items-center gap-1">
                {view !== "years" && (
                  <button
                    type="button"
                    onClick={() =>
                      setView(view === "months" ? "calendar" : "months")
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-serif text-sm tracking-tight text-charcoal transition-colors hover:bg-warm-beige ${
                      view === "months" ? "bg-warm-beige" : ""
                    }`}
                    aria-label={`Choose month, currently ${monthLabel}`}
                    aria-pressed={view === "months"}
                  >
                    {monthLabel}
                    <ChevronDown className="h-3 w-3 text-muted-gray" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setView(view === "years" ? "calendar" : "years")
                  }
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-serif text-sm tracking-tight text-charcoal transition-colors hover:bg-warm-beige ${
                    view === "years" ? "bg-warm-beige" : ""
                  }`}
                  aria-label={
                    view === "years"
                      ? `Show calendar for ${decadeLabel}`
                      : `Choose year, currently ${yearLabel}`
                  }
                  aria-pressed={view === "years"}
                >
                  {view === "years" ? decadeLabel : yearLabel}
                  <ChevronDown
                    className={`h-3 w-3 text-muted-gray transition-transform ${
                      view === "years" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => movePeriod(1)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                aria-label={`Next ${periodLabel}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {view === "calendar" && (
              <div className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((weekday) => (
                    <span
                      key={weekday}
                      className="grid h-7 place-items-center text-[9px] font-medium uppercase tracking-wider text-muted-gray"
                    >
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                  {days.map((date) => {
                    const dateValue = toDateValue(date);
                    const isSelected = value === dateValue;
                    const isToday = dateValue === todayValue;
                    const inMonth = date.getMonth() === viewDate.getMonth();
                    const disabled = isOutsideRange(date, minDate, maxDate);

                    return (
                      <button
                        key={dateValue}
                        type="button"
                        onClick={() => chooseDate(date)}
                        disabled={disabled}
                        className={`grid h-8 place-items-center rounded-full text-[11px] transition-colors ${
                          isSelected
                            ? "bg-sage-deep font-medium text-on-primary shadow-sm"
                            : disabled
                              ? "cursor-not-allowed text-muted-gray/30"
                              : inMonth
                                ? "text-charcoal hover:bg-warm-beige"
                                : "text-muted-gray/45 hover:bg-warm-beige/60"
                        } ${
                          isToday && !isSelected
                            ? "ring-1 ring-inset ring-sage/40"
                            : ""
                        }`}
                        aria-label={date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "months" && (
              <div className="grid grid-cols-3 gap-1.5 p-3">
                {MONTHS.map((month, index) => {
                  const monthStartDate = new Date(yearLabel, index, 1);
                  const monthEndDate = new Date(yearLabel, index + 1, 0);
                  const disabled =
                    (minDate && monthEndDate < minDate) ||
                    (maxDate && monthStartDate > maxDate);
                  const selected = viewDate.getMonth() === index;

                  return (
                    <button
                      key={month.short}
                      type="button"
                      onClick={() => selectMonth(index)}
                      disabled={disabled}
                      className={`relative flex h-10 items-center justify-center rounded-xl text-[11px] transition-colors ${
                        selected
                          ? "bg-sage-deep font-medium text-on-primary shadow-sm"
                          : disabled
                            ? "cursor-not-allowed text-muted-gray/30"
                            : "text-charcoal-muted hover:bg-warm-beige hover:text-charcoal"
                      }`}
                      aria-label={month.long}
                      aria-pressed={selected}
                    >
                      {month.short}
                      {selected && (
                        <Check className="absolute right-1.5 top-1.5 h-2.5 w-2.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {view === "years" && (
              <div className="grid grid-cols-5 gap-1 p-3">
                {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
                  const year = decadeStart + index;
                  const yearStartDate = new Date(year, 0, 1);
                  const yearEndDate = new Date(year, 11, 31);
                  const disabled =
                    (minDate && yearEndDate < minDate) ||
                    (maxDate && yearStartDate > maxDate);
                  const selected = viewDate.getFullYear() === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => selectYear(year)}
                      disabled={disabled}
                      className={`relative flex h-10 items-center justify-center rounded-xl text-[11px] transition-colors ${
                        selected
                          ? "bg-sage-deep font-medium text-on-primary shadow-sm"
                          : disabled
                            ? "cursor-not-allowed text-muted-gray/30"
                            : "text-charcoal-muted hover:bg-warm-beige hover:text-charcoal"
                      }`}
                      aria-label={String(year)}
                      aria-pressed={selected}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-hairline/70 bg-warm-beige/30 px-4 py-2.5">
              <button
                type="button"
                onClick={() => chooseDate(parseDateValue(todayValue))}
                disabled={isTodayDisabled}
                className="text-[10px] font-medium uppercase tracking-wide2 text-sage-deep transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:text-muted-gray/40 disabled:hover:text-muted-gray/40"
              >
                Today
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={clearDate}
                  className="inline-flex items-center gap-1 text-[10px] text-danger transition-colors hover:text-charcoal"
                >
                  <X className="h-3 w-3" />
                  Clear date
                </button>
              ) : (
                <span className="text-[10px] text-muted-gray">
                  Choose a day
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
