import { Link } from "react-router-dom";
import ContentPage, { ContentSection } from "../components/layout/ContentPage";
import useDocumentTitle from "../hooks/useDocumentTitle";

const principles = [
  {
    title: "Reflection over performance",
    body: "Chronicle is not a social feed. There is no audience to write for, no follower count to check, and no pressure to turn a private thought into a public post.",
  },
  {
    title: "Room to return",
    body: "Entries are easy to find again, whether you search by words, browse by mood, or follow the tags that gather across your pages.",
  },
  {
    title: "A copy you can keep",
    body: "Your journal can be exported as a print-ready PDF, so the record you build here is not trapped inside the app.",
  },
];

export default function AboutPage() {
  useDocumentTitle("About");

  return (
    <ContentPage
      eyebrow="About Chronicle"
      title="A quiet home for a life in words."
      intro="Chronicle is a personal journaling space for the moments, ideas, and little details that make up a life. It is built for reflection rather than performance — a place to write honestly, return often, and keep what matters."
    >
      <ContentSection title="Why Chronicle exists">
        <p>
          Most of the day moves past faster than we can hold it. A few written
          lines can help us notice what mattered, make sense of it, and leave it
          somewhere safe for later.
        </p>
        <p>
          Chronicle exists to make that habit feel calm and uncomplicated. The
          design stays out of the way, the language stays warm, and the
          experience is centred on the page in front of you rather than the
          things you are expected to share.
        </p>
      </ContentSection>

      <ContentSection title="What you can do">
        <ul className="space-y-3">
          {[
            "Write daily entries with a title, date, mood, and tags.",
            "Search, filter, and revisit the pages you have written.",
            "See simple statistics and insights drawn from your own journal.",
            "Export your entries as a print-ready PDF keepsake.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection title="What guides the design">
        <div className="grid gap-4 sm:grid-cols-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-hairline bg-paper/80 p-5 shadow-paper"
            >
              <h3 className="font-serif text-lg leading-snug tracking-tight text-charcoal">
                {principle.title}
              </h3>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-charcoal-muted">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="A personal space, not a public one">
        <p>
          Your journal belongs to your account. Entries are stored so that they
          can be displayed, searched, and exported for you; they are not
          published to a public profile or shared with other Chronicle users.
        </p>
        <p>
          You can read more about how data is handled in our{" "}
          <Link to="/privacy" className="link-underline">
            Privacy Policy
          </Link>
          , or review the rules for using the service in our{" "}
          <Link to="/terms" className="link-underline">
            Terms of Service
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection title="Get in touch">
        <p>
          Chronicle is a small, thoughtful project, and feedback helps it stay
          that way. If you have a question, a suggestion, or a problem to
          report, write to us at{" "}
          <a
            href="mailto:support.chroniclejournal@gmail.com?subject=Chronicle%20feedback"
            className="link-underline"
          >
            support.chroniclejournal@gmail.com
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
