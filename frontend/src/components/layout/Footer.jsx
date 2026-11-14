import { Link, useLocation } from "react-router-dom";
import Reveal from "../ui/Reveal";
import Wordmark from "../ui/Wordmark";

const exploreLinks = [
  { label: "The Experience", href: "#experience" },
  { label: "Archive & Ledger", href: "#features" },
  { label: "Insights", href: "#insights" },
  { label: "Preservation", href: "#export" },
];

const resourceLinks = [
  { label: "About Chronicle", to: "/about" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  {
    label: "Contact & Feedback",
    href: "mailto:support.chroniclejournal@gmail.com?subject=Chronicle%20feedback",
  },
];

const linkClass =
  "text-sm text-charcoal-muted transition-colors hover:text-charcoal";

export default function Footer() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <footer className="border-t border-hairline bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 md:py-12 lg:px-16">
        <div className="grid grid-cols-2 gap-8 pb-8 md:grid-cols-12 md:gap-10">
          <Reveal variant="left" y={20} amount={0.1} className="col-span-2 md:col-span-5">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-charcoal-muted">
              A thoughtful home for the moments, ideas, and little details you want to remember.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-wide2 text-muted-gray">
              A quiet space · Calming by design
            </p>
          </Reveal>

          <Reveal variant="down" y={18} delay={0.06} amount={0.1} className="col-span-1 md:col-span-3">
            <p className="mb-5 text-[11px] uppercase tracking-wide2 text-muted-gray">
              Explore
            </p>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={isLanding ? link.href : `/${link.href}`}
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="right" y={20} delay={0.12} amount={0.1} className="col-span-1 md:col-span-4">
            <p className="mb-5 text-[11px] uppercase tracking-wide2 text-muted-gray">
              Resources
            </p>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal variant="fade" y={10} amount={0.1} className="flex flex-col items-center justify-between gap-3 border-t border-hairline pt-8 text-[11px] text-muted-gray sm:flex-row">
          <p>© 2026 Chronicle. All rights reserved.</p>
          <p className="uppercase tracking-wide2">
            MAKE SPACE FOR YOUR STORY
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
