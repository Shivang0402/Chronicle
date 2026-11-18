import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-transparent text-charcoal-muted transition-all duration-200 hover:border-hairline hover:bg-warm-beige/70 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
    </button>
  );
}
