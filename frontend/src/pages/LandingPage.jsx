import ArchiveLedger from "../components/landing/ArchiveLedger";
import ClosingCTA from "../components/landing/ClosingCTA";
import Hero from "../components/landing/Hero";
import Insights from "../components/landing/Insights";
import Philosophy from "../components/landing/Philosophy";
import Preservation from "../components/landing/Preservation";
import WritingCanvas from "../components/landing/WritingCanvas";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function LandingPage() {
  useDocumentTitle("A Quiet Sanctuary for Your Thoughts");

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <Navbar />
        <main>
          <Hero />
          <Philosophy />
          <WritingCanvas />
          <ArchiveLedger />
          <Insights />
          <Preservation />
          <ClosingCTA />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
