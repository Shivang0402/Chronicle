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
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-muted">
              A quiet sanctuary for reflective thinkers, unhurried clarity, and
              the timeless ritual of prose.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-wide2 text-muted-gray">
              Private by default · Calming by design
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
              Begin
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
                  to="/auth?mode=register"
                  className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                >
                  Create an account
                </Link>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                >
                  Recover a passphrase
                </Link>
              </li>
            </ul>
            <p className="mt-6 max-w-xs text-xs font-light leading-relaxed text-muted-gray">
              Your words remain yours. Export in open formats, at any time.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline pt-8 text-[11px] text-muted-gray sm:flex-row">
          <p>© {currentYear} Chronicle Journaling Co.</p>
          <p className="uppercase tracking-wide2">
            Archival quality digital canvas
          </p>
        </div>
      </div>
    </footer>
  );
}
