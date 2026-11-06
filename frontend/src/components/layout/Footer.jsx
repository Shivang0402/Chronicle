import { Link } from "react-router-dom";
import Wordmark from "../ui/Wordmark";

const currentYear = new Date().getFullYear();

const exploreLinks = [
  { label: "The Experience", href: "#experience" },
  { label: "Archive & Ledger", href: "#features" },
  { label: "Insights", href: "#insights" },
  { label: "Preservation", href: "#export" },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 md:py-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-muted">
              A journal for the moments, thoughts, and small details worth keeping.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-wide2 text-muted-gray">
              A quiet space · Calming by design
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="mb-5 text-[11px] uppercase tracking-wide2 text-muted-gray">
              Explore
            </p>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="mb-5 text-[11px] uppercase tracking-wide2 text-muted-gray">
              Account
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/auth"
                  className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                >
                  Sign in to your journal
                </Link>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                >
                  Reset your password
                </Link>
              </li>
            </ul>
            <p className="mt-6 max-w-xs text-xs font-light leading-relaxed text-muted-gray">
              Private by design. Take your writing with you as a PDF, Markdown
              file, or JSON archive.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline pt-8 text-[11px] text-muted-gray sm:flex-row">
          <p>© {currentYear} Chronicle Journaling Co.</p>
          <p className="uppercase tracking-wide2">
            A journal for everyday life
          </p>
        </div>
      </div>
    </footer>
  );
}
