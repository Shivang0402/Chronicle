import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuTransition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] };

export default function AccountMenu({
  user,
  onLogout,
  onNavigate,
  variant = "sidebar",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const { pathname } = useLocation();

  const initial = (user?.name || user?.email || "C").charAt(0).toUpperCase();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Chronicle writer";
  const email = user?.email || "Private folio";
  const isProfile = pathname === "/profile";

  const closeMenu = () => setOpen(false);

  const handleNavigate = () => {
    closeMenu();
    onNavigate?.();
  };

  const handleLogout = () => {
    closeMenu();
    onLogout?.();
    onNavigate?.();
  };

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

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          id={menuId}
          role="menu"
          initial={{
            opacity: 0,
            y: variant === "sidebar" ? 6 : -6,
            scale: 0.98,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: variant === "sidebar" ? 6 : -6,
            scale: 0.98,
          }}
          transition={menuTransition}
          className={`absolute z-50 overflow-hidden rounded-2xl border border-hairline bg-paper p-1.5 shadow-paper-lg ${
            variant === "sidebar"
              ? "bottom-full left-0 right-0 mb-2"
              : "right-0 top-full mt-3 w-64"
          }`}
        >
          {variant === "topbar" && (
            <div className="border-b border-hairline/70 px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-charcoal">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-muted-gray">
                {email}
              </p>
            </div>
          )}

          {variant === "topbar" && (
            <Link
              to="/profile"
              role="menuitem"
              onClick={handleNavigate}
              className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] text-charcoal-muted transition-colors hover:bg-warm-beige/60 hover:text-charcoal focus-visible:bg-warm-beige/60 focus-visible:text-charcoal"
            >
              <User className="h-3.5 w-3.5" />
              View profile
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] text-danger transition-colors hover:bg-danger/5 focus-visible:bg-danger/5 ${
              variant === "sidebar" ? "mt-0" : "mt-1"
            }`}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === "topbar") {
    return (
      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`grid h-8 w-8 place-items-center rounded-full bg-sage-subtle font-serif text-sm text-sage-deep transition-all hover:bg-sage hover:text-white ${
            open ? "ring-2 ring-sage/30" : ""
          }`}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
        >
          {initial}
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-1">
        <Link
          to="/profile"
          onClick={handleNavigate}
          aria-current={isProfile ? "page" : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
            isProfile
              ? "bg-paper text-charcoal shadow-sm"
              : "text-charcoal hover:bg-paper/70"
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-subtle font-serif text-sm text-sage-deep">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-charcoal">
              {user?.name || displayName}
            </span>
            <span className="block truncate text-[10px] text-muted-gray">
              {email}
            </span>
          </span>
        </Link>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-charcoal-muted transition-colors ${
            open
              ? "bg-paper text-charcoal"
              : "hover:bg-paper hover:text-charcoal"
          }`}
          aria-label="Account options"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {menu}
    </div>
  );
}
