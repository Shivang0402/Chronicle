import { Link } from "react-router-dom";
import ContentPage, { ContentSection } from "../components/layout/ContentPage";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function TermsPage() {
  useDocumentTitle("Terms of Service");

  return (
    <ContentPage
      eyebrow="Terms of Service"
      title="The terms that govern your use of Chronicle."
      intro="These terms explain the rules for using Chronicle. By creating an account or using the service, you agree to them. If you do not agree, please do not use Chronicle."
      updated="November 10, 2026"
    >
      <ContentSection title="The service">
        <p>
          Chronicle is a personal journaling application for writing, organising,
          revisiting, and exporting journal entries. The service includes the
          website, the journal tools, and any related features made available
          through it.
        </p>
      </ContentSection>

      <ContentSection title="Your account">
        <p>
          You are responsible for providing accurate account information, keeping
          your password confidential, and for activity that happens through your
          account. If you believe someone else has accessed your account, change
          your password and contact us promptly.
        </p>
      </ContentSection>

      <ContentSection title="Your content">
        <p>
          You retain ownership of the journal entries and other content you
          create. By using Chronicle, you give us permission to store, process,
          display, search, and export that content as needed to provide the
          service to you.
        </p>
        <p>
          You are responsible for the content you write and for making sure you
          have the right to share any material you include in your journal. Do
          not use Chronicle to store content that you are not permitted to keep
          or process.
        </p>
      </ContentSection>

      <ContentSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="space-y-3">
          {[
            "Use Chronicle for unlawful, infringing, harmful, or abusive purposes.",
            "Attempt to access another person's account, data, or private information.",
            "Interfere with the service, bypass security measures, or introduce malicious code.",
            "Scrape, overload, or automate access to the service in a way that disrupts it for others.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          We may suspend or stop access to Chronicle if we reasonably believe
          these rules have been broken or if needed to protect the service and
          its users.
        </p>
      </ContentSection>

      <ContentSection title="Intellectual property">
        <p>
          Chronicle's name, design, interface, and underlying code are owned by
          Chronicle or its licensors and are protected by applicable
          intellectual-property laws. These terms do not give you the right to
          copy, modify, or redistribute the service except as allowed by law or
          with permission. Your own journal content remains yours.
        </p>
      </ContentSection>

      <ContentSection title="Availability and changes">
        <p>
          We aim to keep Chronicle available and working, but we cannot promise
          uninterrupted or error-free access. Features may be changed, suspended,
          or discontinued, and the service may occasionally be unavailable for
          maintenance or other reasons.
        </p>
      </ContentSection>

      <ContentSection title="Third-party services">
        <p>
          Chronicle relies on third-party providers for services such as hosting,
          database storage, and email delivery. Those providers may have their
          own terms and policies. We are not responsible for the practices of
          third parties beyond our control.
        </p>
      </ContentSection>

      <ContentSection title="Disclaimer">
        <p>
          Chronicle is provided on an "as is" and "as available" basis. To the
          extent permitted by law, we make no warranties of any kind, whether
          express or implied, including warranties of merchantability, fitness
          for a particular purpose, or non-infringement.
        </p>
      </ContentSection>

      <ContentSection title="Limitation of liability">
        <p>
          To the extent permitted by law, Chronicle will not be liable for
          indirect, incidental, special, consequential, or punitive damages, or
          for loss of data, profits, or goodwill arising from your use of or
          inability to use the service. Nothing in these terms excludes liability
          that cannot lawfully be excluded.
        </p>
      </ContentSection>

      <ContentSection title="Ending your use">
        <p>
          You may stop using Chronicle at any time. We may suspend or terminate
          access if these terms are broken or if the service is discontinued.
          Information is handled after termination in accordance with our{" "}
          <Link to="/privacy" className="link-underline">
            Privacy Policy
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection title="Changes to these terms">
        <p>
          These terms may be updated as Chronicle changes. When they are updated,
          the revised version will be posted on this page with a new date.
          Continued use of the service after an update means the revised terms
          apply.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href="mailto:support.chroniclejournal@gmail.com?subject=Chronicle%20terms%20question"
            className="link-underline"
          >
            support.chroniclejournal@gmail.com
          </a>
          . You can also read more{" "}
          <Link to="/about" className="link-underline">
            about Chronicle
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
