import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Wordmark from "../ui/Wordmark";

const links = [
  { label: "The Experience", href: "#experience" },
  { label: "Archive", href: "#features" },
  { label: "Insights", href: "#insights" },
  { label: "Preservation", href: "#export" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-hairline/80 bg-ivory/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500 sm:px-10 lg:px-16 ${
          scrolled ? "h-[70px]" : "h-20"
        }`}
      >
        <Wordmark />

        <nav className="hidden items-center gap-9 text-[13px] tracking-wide text-charcoal-muted lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 transition-colors hover:text-charcoal"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-sage transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[13px] font-medium text-charcoal-muted transition-colors hover:text-charcoal"
              >
                Sign out
              </button>
              <Link to="/vault" className="btn-primary !px-5 !py-2.5">
                Open Journal
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-[13px] font-medium text-charcoal-muted transition-colors hover:text-charcoal"
              >
                Sign In
              </Link>
              <Link to="/auth?mode=register" className="btn-primary !px-5 !py-2.5">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-paper/70 text-charcoal md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full border-b border-hairline bg-ivory/95 px-6 pb-8 pt-4 shadow-paper backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col divide-y divide-hairline/70">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between py-4 font-serif text-xl text-charcoal"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-sage" />
                </a>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/vault"
                    onClick={closeMenu}
                    className="btn-primary w-full"
                  >
                    Open Journal
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-ghost w-full border border-hairline"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth?mode=register"
                    onClick={closeMenu}
                    className="btn-primary w-full"
                  >
                    Begin your journal
                  </Link>
                  <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="btn-ghost w-full border border-hairline"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
