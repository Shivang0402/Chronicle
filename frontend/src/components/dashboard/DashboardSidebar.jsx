import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Download,
  LayoutDashboard,
  LogOut,
  PenLine,
  X,
} from "lucide-react";
import { useEffect } from "react";
import Wordmark from "../ui/Wordmark";

const navItems = [
  { label: "Dashboard", href: "#dashboard-top", icon: LayoutDashboard },
  { label: "My Journal", href: "#recent-entries", icon: BookOpen },
  { label: "Insights", href: "#writing-rhythms", icon: BarChart3 },
];

const dotColors = [
  "bg-sage",
  "bg-sage-deep",
  "bg-sage/60",
  "bg-charcoal-muted",
  "bg-warm-beige",
];

function SidebarContent({
  user,
  tags,
  activeTag,
  onSelectTag,
  onClearTag,
  onNewEntry,
  onExport,
  onLogout,
  exporting,
  onNavigate,
}) {
  const initial = (user?.name || user?.email || "C").charAt(0).toUpperCase();
  const displayTags = tags.slice(0, 5);

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div className="p-6">
        <div className="mb-9 flex flex-col gap-1">
          <Wordmark to="/dashboard" mark size="sm" />
          <span className="pl-[46px] text-[9px] uppercase tracking-wide2 text-muted-gray">
            Personal journal
          </span>
        </div>

        <button
          type="button"
          onClick={onNewEntry}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-sage px-4 py-3 text-[11px] font-medium uppercase tracking-wide2 text-white shadow-sm transition-colors hover:bg-sage-deep"
        >
          <PenLine className="h-4 w-4" />
          New Entry
        </button>

        <span className="mb-3 block px-2 text-[9px] font-medium uppercase tracking-wide2 text-muted-gray">
          Journal navigation
        </span>
        <nav className="mb-8 flex flex-col gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  index === 0
                    ? "bg-paper font-medium text-charcoal shadow-sm"
                    : "text-charcoal-muted hover:bg-paper/70 hover:text-charcoal"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-charcoal-muted transition-colors hover:bg-paper/70 hover:text-charcoal disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Preparing export..." : "Export"}
          </button>
        </nav>

        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[9px] font-medium uppercase tracking-wide2 text-muted-gray">
            Collections
          </span>
          {activeTag && (
            <button
              type="button"
              onClick={onClearTag}
              className="text-[10px] text-sage transition-colors hover:text-sage-deep"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {displayTags.length === 0 ? (
            <p className="px-2 py-1 text-[11px] leading-relaxed text-muted-gray">
              Tags you add to entries will gather here.
            </p>
          ) : (
            displayTags.map((item, index) => {
              const isActive = activeTag === item.tag;

              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onSelectTag(isActive ? "" : item.tag)}
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors ${
                    isActive
                      ? "bg-sage-subtle text-charcoal"
                      : "text-charcoal-muted hover:bg-paper/70 hover:text-charcoal"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      dotColors[index % dotColors.length]
                    }`}
                  />
                  <span className="truncate">#{item.tag}</span>
                  <span className="ml-auto text-[10px] text-muted-gray">
                    {item.count}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-hairline p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-subtle font-serif text-sm text-sage-deep">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-charcoal">
              {user?.name || "Chronicle writer"}
            </p>
            <p className="truncate text-[10px] text-muted-gray">
              {user?.email || "Private folio"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-charcoal-muted transition-colors hover:bg-paper hover:text-charcoal"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSidebar(props) {
  const { mobileOpen, onClose } = props;

  useEffect(() => {
    if (!mobileOpen) return undefined;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-hairline bg-warm-beige/60 backdrop-blur-xl lg:block">
        <SidebarContent {...props} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-charcoal/25 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-hairline bg-ivory shadow-paper-lg lg:hidden"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent {...props} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
