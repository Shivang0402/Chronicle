import { CalendarDays, Menu } from "lucide-react";
import { todayLabel } from "../../lib/journal";
import ThemeToggle from "../ui/ThemeToggle";
import AccountMenu from "./AccountMenu";

export default function DashboardTopbar({
  user,
  onOpenMenu,
  onLogout,
  title = "Dashboard",
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-hairline bg-ivory/85 backdrop-blur-xl lg:left-72">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="font-serif text-lg tracking-tight text-charcoal">
            {title}
          </h1>
          <span className="hidden h-4 w-px bg-hairline sm:block" />
          <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-gray sm:flex">
            <CalendarDays className="h-3 w-3 text-sage" />
            {todayLabel()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AccountMenu user={user} onLogout={onLogout} variant="topbar" />
        </div>
      </div>
    </header>
  );
}
