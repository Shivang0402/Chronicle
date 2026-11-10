import ContentPage, { ContentSection } from "../components/layout/ContentPage";
import useDocumentTitle from "../hooks/useDocumentTitle";

const bulletClass = "flex gap-3";
const dotClass = "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage";
const strongClass = "font-medium text-charcoal";

export default function PrivacyPolicyPage() {
  useDocumentTitle("Privacy Policy");

  return (
    <ContentPage
      eyebrow="Chronicle · Legal"
      title="Privacy Policy"
      intro='Chronicle respects your privacy. This Privacy Policy explains what information may be collected when you use Chronicle, how it is used, and the choices available to you.'
      updated="November 10, 2026"
      updatedLabel="Effective date"
    >
      <p className="text-[15px] font-light leading-[1.85] text-charcoal-muted">
        By using Chronicle, you acknowledge the practices described below.
      </p>

      <ContentSection title="1. Information We Collect">
        <p>
          Depending on the features you use, Chronicle may collect the following
          information:
        </p>
        <ul className="space-y-3">
          <li className={bulletClass}>
            <span className={dotClass} />
            <span>
              <strong className={strongClass}>Account information:</strong> Your
              name, email address, and authentication-related information when
              you create an account.
            </span>
          </li>
          <li className={bulletClass}>
            <span className={dotClass} />
            <span>
              <strong className={strongClass}>Journal content:</strong> Entries,
              titles, dates, moods, tags, and other information you choose to
              save.
            </span>
          </li>
          <li className={bulletClass}>
            <span className={dotClass} />
            <span>
              <strong className={strongClass}>Usage information:</strong> Basic
              information about how the service is used, such as interactions
              with features or technical events, where collected.
            </span>
          </li>
          <li className={bulletClass}>
            <span className={dotClass} />
            <span>
              <strong className={strongClass}>Technical information:</strong>{" "}
              Information such as browser type, device details, IP address, and
              diagnostic data, where made available through the service or its
              hosting infrastructure.
            </span>
          </li>
        </ul>
        <p>
          We do not ask you to provide personal information beyond what is
          reasonably necessary to operate the service.
        </p>
      </ContentSection>

      <ContentSection title="2. How We Use Your Information">
        <p>
          Information collected through Chronicle may be used to:
        </p>
        <ul className="space-y-3">
          {[
            "Create and manage your account.",
            "Store and display your journal entries.",
            "Provide search, organisation, statistics, and other journaling features.",
            "Authenticate users and protect accounts.",
            "Maintain, troubleshoot, and improve the service.",
            "Respond to support requests and important service-related communications.",
            "Meet applicable legal obligations.",
          ].map((item) => (
            <li key={item} className={bulletClass}>
              <span className={dotClass} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Your journal content is used to provide the features you request. It
          is not intended to be public content.
        </p>
      </ContentSection>

      <ContentSection title="3. Storage and Security">
        <p>
          Your account information and journal content are stored using the
          infrastructure required to operate Chronicle.
        </p>
        <p>
          We use reasonable technical and organisational measures intended to
          protect information against unauthorised access, alteration,
          disclosure, or loss.
        </p>
        <p>
          However, no online service or method of electronic storage can
          guarantee absolute security.
        </p>
        <p>
          <strong className={strongClass}>Important:</strong> Unless a feature
          explicitly states otherwise, Chronicle should not be considered an
          end-to-end encrypted service. Information stored on our servers may be
          technically accessible to authorised service operators or
          infrastructure systems when necessary to operate, maintain, or
          troubleshoot the service.
        </p>
        <p>
          We recommend using a strong, unique password and keeping your account
          credentials confidential.
        </p>
      </ContentSection>

      <ContentSection title="4. Sharing of Information">
        <p>
          We do not intend to sell your personal information or make your private
          journal entries publicly available.
        </p>
        <p>Information may be shared only where reasonably necessary:</p>
        <ul className="space-y-3">
          {[
            "With service providers that support hosting, database storage, email delivery, or other essential operations.",
            "When required by applicable law, legal process, or a valid government request.",
            "When necessary to investigate security issues, prevent misuse, or protect the rights and safety of users or the service.",
            "With your direction or consent.",
          ].map((item) => (
            <li key={item} className={bulletClass}>
              <span className={dotClass} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Service providers may process information on our behalf under their
          respective terms and privacy practices.
        </p>
      </ContentSection>

      <ContentSection title="5. Data Retention and Deletion">
        <p>
          We retain account information and journal content for as long as needed
          to provide Chronicle and fulfil legitimate operational or legal
          requirements.
        </p>
        <p>
          If you choose to delete your account, we will take reasonable steps to
          delete or anonymise associated personal information, subject to
          technical limitations, backup retention, and applicable legal
          obligations.
        </p>
        <p>
          You should export and preserve any journal content you wish to keep
          before requesting account deletion.
        </p>
      </ContentSection>

      <ContentSection title="6. Your Choices and Rights">
        <p>
          Depending on applicable law and the features available, you may be able
          to:
        </p>
        <ul className="space-y-3">
          {[
            "Access and update your account information.",
            "View, edit, or delete your journal entries.",
            "Export or preserve your journal content using available export features.",
            "Request deletion of your account and associated personal information.",
            "Contact us with questions or requests concerning your information.",
          ].map((item) => (
            <li key={item} className={bulletClass}>
              <span className={dotClass} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          To make a privacy-related request, contact us using the details below.
        </p>
      </ContentSection>

      <ContentSection title="7. Cookies and Similar Technologies">
        <p>
          Chronicle or its infrastructure providers may use cookies or similar
          technologies where necessary for authentication, session management,
          security, and service functionality.
        </p>
        <p>
          If analytics or optional tracking technologies are introduced, this
          policy should be updated to describe their purpose and any available
          choices.
        </p>
      </ContentSection>

      <ContentSection title="8. Third-Party Services and Links">
        <p>
          Chronicle may rely on third-party services to operate or provide
          certain features. Their handling of information is governed by their
          own privacy policies and terms.
        </p>
        <p>
          We are not responsible for the privacy practices of external websites
          or services linked from Chronicle.
        </p>
      </ContentSection>

      <ContentSection title="9. Children's Privacy">
        <p>
          Chronicle is not intended to be used by children who are not legally
          permitted to create an account under applicable law. If we become aware
          that personal information has been collected from a child in violation
          of applicable requirements, we will take appropriate steps to address
          it.
        </p>
      </ContentSection>

      <ContentSection title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy as Chronicle evolves or as legal and
          operational requirements change. Updated versions will be published on
          this page with a revised effective date.
        </p>
      </ContentSection>

      <ContentSection title="11. Contact">
        <p>
          For questions, concerns, or requests relating to this Privacy Policy,
          contact:
        </p>
        <p>
          <strong className={strongClass}>Email:</strong>{" "}
          <a
            href="mailto:support.chroniclejournal@gmail.com?subject=Chronicle%20privacy%20question"
            className="link-underline"
          >
            support.chroniclejournal@gmail.com
          </a>
        </p>
      </ContentSection>

      <div className="rounded-2xl border border-sage/20 bg-gradient-to-br from-sage-subtle via-paper to-warm-beige p-6 shadow-paper sm:p-8">
        <p className="font-serif text-lg leading-relaxed tracking-tight text-charcoal">
          Your journal is personal. We aim to treat the information entrusted to
          Chronicle with care and responsibility.
        </p>
      </div>
    </ContentPage>
  );
}
