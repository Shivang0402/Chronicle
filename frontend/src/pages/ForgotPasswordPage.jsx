import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MailCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AnimatedText from "../components/ui/AnimatedText";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../lib/api";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  useDocumentTitle("Recover your passphrase");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter the email attached to your journal.");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.forgotPassword(email.trim());
      setMessage(
        data?.message ||
          "If an account exists for this email, a reset link has been sent.",
      );
      setSent(true);
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Could not send the recovery email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-sage-subtle text-sage">
              <MailCheck className="h-6 w-6" />
            </div>
            <span className="eyebrow mb-3 block">Recovery dispatched</span>
            <h1 className="font-serif text-4xl tracking-tight text-charcoal">
              A quiet way back in.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
              {message}
            </p>
            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-warm-beige/60 px-4 py-3 text-xs leading-relaxed text-charcoal-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              The link expires in one hour. If it does not arrive, check your
              spam folder before requesting another.
            </div>
            <div className="mt-8 space-y-3">
              <Link to="/auth" className="btn-primary w-full">
                Back to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setMessage("");
                }}
                className="btn-ghost w-full border border-hairline"
              >
                Use a different email
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow mb-3 block">Lost passphrase</span>
            <AnimatedText
              onMount
              as="h1"
              className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-[40px]"
              parts={[{ text: "Let’s find your way back." }]}
            />
            <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
              Enter the email attached to your journal. We’ll send a private
              reset link, valid for one hour.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <div>
                <label className="field-label" htmlFor="recovery-email">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                    role="alert"
                  >
                    <p className="flex items-start gap-2 rounded-xl border border-danger/15 bg-danger/[0.06] px-4 py-3 text-xs leading-relaxed text-danger">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {loading ? "Sending quietly..." : "Send reset link"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <Link
              to="/auth"
              className="mt-7 inline-flex items-center gap-2 text-xs text-charcoal-muted transition-colors hover:text-charcoal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to sign in
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
