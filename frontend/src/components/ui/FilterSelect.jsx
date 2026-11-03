import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const menuTransition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] };

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  const selectedIndex = options.findIndex((item) => item.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const chooseOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(options.length - 1, current + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[activeIndex]) chooseOption(options[activeIndex].value);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] transition-all duration-300 ${
          open
            ? "border-sage/50 bg-paper text-charcoal shadow-sm"
            : "border-hairline bg-warm-beige/60 text-charcoal-muted hover:border-sage/30 hover:bg-paper"
        }`}
        aria-label={`${label}: ${selected?.label || "All"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-sage" />}
        <span className="max-w-36 truncate">{selected?.label || label}</span>
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
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={menuTransition}
            className={`absolute top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-hairline bg-paper p-1.5 shadow-paper-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[9px] font-medium uppercase tracking-wide2 text-muted-gray">
              {label}
            </p>
            <div className="max-h-64 overflow-y-auto">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => chooseOption(option.value)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] transition-colors ${
                      isSelected
                        ? "bg-sage-subtle font-medium text-charcoal"
                        : isActive
                          ? "bg-warm-beige/70 text-charcoal"
                          : "text-charcoal-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isSelected ? "bg-sage-deep" : "bg-hairline"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {option.meta !== undefined && (
                      <span className="shrink-0 text-[10px] text-muted-gray">
                        {option.meta}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
