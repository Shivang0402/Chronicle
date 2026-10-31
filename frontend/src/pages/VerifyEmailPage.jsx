import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This verification link is incomplete.",
  );
  const requestedToken = useRef("");

  useDocumentTitle("Verify your email");

  useEffect(() => {
    if (!token || requestedToken.current === token) {
      return undefined;
    }

    requestedToken.current = token;

    authApi
      .verifyEmail(token)
      .then((data) => {
        if (requestedToken.current !== token) return;
        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      })
      .catch((error) => {
        if (requestedToken.current !== token) return;
        setStatus("error");
        setMessage(
          error?.message ||
            "This verification link is invalid or has expired.",
        );
      });

    return undefined;
  }, [token]);

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {status === "verifying" && (
          <>
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-sage-subtle text-sage">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <span className="eyebrow mb-3 block">Verifying your folio</span>
            <h1 className="font-serif text-4xl tracking-tight text-charcoal">
              One quiet moment.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
              We’re confirming your email address. This usually takes only a
              second.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-sage-subtle text-sage">
              <MailCheck className="h-6 w-6" />
            </div>
            <span className="eyebrow mb-3 block">Verified</span>
            <h1 className="font-serif text-4xl tracking-tight text-charcoal">
              Your journal is open.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
              {message.endsWith(".") ? message : `${message}.`} You can now
              sign in and begin writing whenever you’re ready.
            </p>
            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-sage-subtle/70 px-4 py-3 text-xs leading-relaxed text-sage-deep">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Your first page is waiting, entirely private.
            </div>
            <Link to="/auth" className="btn-primary mt-8 w-full">
              Sign in to your journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-danger/[0.06] text-danger">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="eyebrow mb-3 block">Verification paused</span>
            <h1 className="font-serif text-4xl tracking-tight text-charcoal">
              This link didn’t open.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
              {message} Verification links expire after 24 hours. You can
              request a fresh one from the sign-in page.
            </p>
            <div className="mt-8 space-y-3">
              <Link to="/auth" className="btn-primary w-full">
                Return to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/forgot-password"
                className="btn-ghost w-full border border-hairline"
              >
                Request help
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
}
