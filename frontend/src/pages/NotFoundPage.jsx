import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import Wordmark from "../components/ui/Wordmark";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");

  return (
    <PageTransition>
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ivory px-6">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
        <div className="relative text-center">
          <Wordmark className="mb-10 justify-center" mark />
          <span className="font-serif text-[110px] leading-none text-sage/25 sm:text-[160px]">
            404
          </span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
            This page wandered off.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal-muted">
            The folio you’re looking for doesn’t live here. Return to the quiet
            sanctuary and begin again.
          </p>
          <Link to="/" className="btn-primary mt-8">
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
