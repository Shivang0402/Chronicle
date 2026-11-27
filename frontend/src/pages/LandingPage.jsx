import ArchiveLedger from "../components/landing/ArchiveLedger";
import ClosingCTA from "../components/landing/ClosingCTA";
import EncryptionFeature from "../components/landing/EncryptionFeature";
import Hero from "../components/landing/Hero";
import Insights from "../components/landing/Insights";
import Preservation from "../components/landing/Preservation";
import WritingCanvas from "../components/landing/WritingCanvas";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function LandingPage() {
  useDocumentTitle("A Quiet Sanctuary for Your Thoughts");

  return (
    <div className="landing-static min-h-screen bg-ivory">
      <Navbar />
      <main>
        <Hero />
        <EncryptionFeature />
        <WritingCanvas />
        <ArchiveLedger />
        <Insights />
        <Preservation />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
