import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

const formatDateLabel = (value) => {
  const date = parseDateValue(value);

  if (!date) return "Any date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function FilterDatePicker({ value, onChange, label = "Date" }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    () => parseDateValue(value) || new Date(),
  );
  const [todayValue] = useState(() => toDateValue(new Date()));
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

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
    setViewDate(parseDateValue(value) || new Date());
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

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const chooseDate = (date) => {
    onChange(toDateValue(date));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveMonth = (offset) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const clearDate = () => {
    onChange("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) setOpen(false);
          else openPicker();
        }}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] transition-all duration-300 ${
          open || value
            ? "border-sage/50 bg-paper text-charcoal shadow-sm"
            : "border-hairline bg-warm-beige/60 text-charcoal-muted hover:border-sage/30 hover:bg-paper"
        }`}
        aria-label={`${label}: ${formatDateLabel(value)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sage" />
        <span className="max-w-36 truncate">{formatDateLabel(value)}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-sage-deep" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-label={`${label} picker`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={menuTransition}
            className="absolute left-0 top-full z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-hairline bg-paper shadow-paper-lg"
          >
            <div className="flex items-center justify-between border-b border-hairline/70 px-3 py-2.5">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="font-serif text-sm tracking-tight text-charcoal">
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

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

                  return (
                    <button
                      key={dateValue}
                      type="button"
                      onClick={() => chooseDate(date)}
                      className={`grid h-8 place-items-center rounded-full text-[11px] transition-colors ${
                        isSelected
                          ? "bg-sage font-medium text-white shadow-sm"
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
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline/70 bg-warm-beige/30 px-4 py-2.5">
              <button
                type="button"
                onClick={() => chooseDate(new Date())}
                className="text-[10px] font-medium uppercase tracking-wide2 text-sage-deep transition-colors hover:text-charcoal"
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
