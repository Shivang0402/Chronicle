import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AnimatedText from "../components/ui/AnimatedText";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../lib/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useDocumentTitle("Set a new passphrase");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is incomplete. Request a new one.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your new passphrase needs at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passphrases do not match yet.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, password: form.password });
      setDone(true);
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Could not reset your passphrase. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-danger/[0.06] text-danger">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <span className="eyebrow mb-3 block">Incomplete link</span>
        <h1 className="font-serif text-4xl tracking-tight text-charcoal">
          This page is missing its key.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
          Password reset links include a private token. Request a fresh link to
          continue safely.
        </p>
        <div className="mt-8 space-y-3">
          <Link to="/forgot-password" className="btn-primary w-full">
            Request a new link
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/auth" className="btn-ghost w-full border border-hairline">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-sage-subtle text-sage">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="eyebrow mb-3 block">Passphrase renewed</span>
            <h1 className="font-serif text-4xl tracking-tight text-charcoal">
              Your journal is safe.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
              Your passphrase has been changed. Sign in with your new
              credentials to return to your private desk.
            </p>
            <Link to="/auth" className="btn-primary mt-8 w-full">
              Sign in to your journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow mb-3 block">A fresh key</span>
            <AnimatedText
              onMount
              as="h1"
              className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-[40px]"
              parts={[{ text: "Set a new passphrase." }]}
            />
            <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
              Choose something memorable and private. At least 8 characters,
              kept only between you and your journal.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <div>
                <label className="field-label" htmlFor="new-password">
                  New Passphrase
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                    className="field-input px-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 grid h-7 w-7 place-items-center rounded-full text-muted-gray transition-colors hover:text-charcoal"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="confirm-password">
                  Confirm Passphrase
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Repeat passphrase"
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
                  <KeyRound className="h-4 w-4" />
                )}
                {loading ? "Updating your key..." : "Save new passphrase"}
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
