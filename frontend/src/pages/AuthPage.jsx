import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AnimatedText from "../components/ui/AnimatedText";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../lib/api";

const inputWrap = "relative flex items-center";

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "signin";
  const redirect = searchParams.get("redirect");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  useDocumentTitle(mode === "register" ? "Create your journal" : "Sign in");

  const switchMode = (nextMode) => {
    setError("");
    setUnverifiedEmail("");
    setResendNotice("");
    setShowPassword(false);
    const params = new URLSearchParams();
    if (nextMode === "register") params.set("mode", "register");
    if (redirect) params.set("redirect", redirect);
    setSearchParams(params, { replace: true });
  };

  const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/vault";

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setResendNotice("");

    if (!loginForm.email.trim() || !loginForm.password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    try {
      await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
        remember: loginForm.remember,
      });
      navigate(safeRedirect, { replace: true });
    } catch (loginError) {
      if (loginError?.status === 403) {
        setUnverifiedEmail(loginForm.email.trim());
      }
      setError(loginError?.message || "Could not sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setResendNotice("");

    if (registerForm.password.length < 8) {
      setError("Your passphrase needs to be at least 8 characters.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("The passphrases do not match yet.");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        name: registerForm.name.trim(),
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });
      setRegisteredEmail(data?.user?.email || registerForm.email.trim());
      setRegisterForm({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (registerError) {
      setError(
        registerError?.message || "Could not create your account. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (email) => {
    if (!email) return;
    setResending(true);
    setResendNotice("");
    setError("");

    try {
      const data = await authApi.resendVerification(email);
      setResendNotice(
        data?.message ||
          "If the account exists, a fresh verification link is on its way.",
      );
    } catch (resendError) {
      setError(
        resendError?.message || "Could not resend the verification email.",
      );
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-sage-subtle text-sage">
            <MailCheck className="h-6 w-6" />
          </div>
          <span className="eyebrow mb-3 block">One small step</span>
          <h1 className="font-serif text-4xl tracking-tight text-charcoal">
            Check your inbox.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal-muted">
            We sent a verification link to{" "}
            <span className="font-medium text-charcoal">{registeredEmail}</span>.
            Open it to activate your journal, then return here to sign in.
          </p>

          <AnimatePresence>
            {resendNotice && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 flex items-start gap-2 rounded-xl bg-sage-subtle/70 px-4 py-3 text-xs leading-relaxed text-sage-deep"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {resendNotice}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => handleResend(registeredEmail)}
              disabled={resending}
              className="btn-sage w-full"
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisteredEmail("");
                switchMode("signin");
              }}
              className="btn-ghost w-full border border-hairline"
            >
              Return to sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-8 border-t border-hairline pt-5 text-xs leading-relaxed text-muted-gray">
            Nothing arrived? Check your spam folder, or verify the address was
            typed correctly. Links remain valid for 24 hours.
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-warm-beige/60 px-3 py-1.5 text-[9px] uppercase tracking-wide2 text-charcoal-muted">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sage" />
          Vol. IV • {mode === "register" ? "Begin a new folio" : "Access your folios"}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-gray">
          <ShieldCheck className="h-3.5 w-3.5 text-sage" />
          Enclave active
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedText
            onMount
            as="h1"
            delay={0.05}
            stagger={0.04}
            className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-[40px]"
            parts={[
              {
                text:
                  mode === "register"
                    ? "Begin a quieter chapter."
                    : "Welcome back to your story.",
              },
            ]}
          />
          <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
            {mode === "register"
              ? "Create your private space. It takes less than a minute."
              : "Enter your credentials to access your private journal."}
          </p>

          <div className="mt-6 flex items-center rounded-xl bg-warm-beige/70 p-1">
            {[
              { id: "signin", label: "Sign In" },
              { id: "register", label: "Create Account" },
            ].map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`relative flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors duration-300 ${
                    active
                      ? "text-charcoal"
                      : "text-charcoal-muted hover:text-charcoal"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-lg border border-hairline bg-paper shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {mode === "signin" ? (
            <form
              onSubmit={handleLogin}
              className="mt-6 space-y-4"
              noValidate
            >
              <div>
                <label className="field-label" htmlFor="login-email">
                  <span>Email Address</span>
                  <span className="text-[10px] font-normal text-muted-gray">
                    Private handle
                  </span>
                </label>
                <div className={inputWrap}>
                  <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((form) => ({
                        ...form,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="field-label">
                  <label htmlFor="login-password">Master Passphrase</label>
                  <Link
                    to="/forgot-password"
                    state={{ email: loginForm.email }}
                    className="text-[11px] font-normal text-sage transition-colors hover:text-sage-deep"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className={inputWrap}>
                  <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((form) => ({
                        ...form,
                        password: event.target.value,
                      }))
                    }
                    placeholder="••••••••••••"
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

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-charcoal-muted">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(event) =>
                      setLoginForm((form) => ({
                        ...form,
                        remember: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-hairline text-sage focus:ring-sage/20"
                  />
                  Keep me signed in on this device
                </label>
                <span className="hidden text-[9px] uppercase tracking-wider text-muted-gray sm:block">
                  JWT • 7 days
                </span>
              </div>

              <FormNotice
                error={error}
                unverifiedEmail={unverifiedEmail}
                resending={resending}
                resendNotice={resendNotice}
                onResend={handleResend}
              />

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
                {loading ? "Unlocking your vault..." : "Unlock Private Vault"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRegister}
              className="mt-6 space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="register-name">
                    Your Name
                  </label>
                  <div className={inputWrap}>
                    <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((form) => ({
                          ...form,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Eleanor Hart"
                      className="field-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="register-username">
                    Username
                  </label>
                  <div className={inputWrap}>
                    <AtSign className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                    <input
                      id="register-username"
                      type="text"
                      autoComplete="username"
                      required
                      value={registerForm.username}
                      onChange={(event) =>
                        setRegisterForm((form) => ({
                          ...form,
                          username: event.target.value,
                        }))
                      }
                      placeholder="eleanor"
                      className="field-input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="register-email">
                  Email Address
                </label>
                <div className={inputWrap}>
                  <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((form) => ({
                        ...form,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    className="field-input pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="register-password">
                    Passphrase
                  </label>
                  <div className={inputWrap}>
                    <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((form) => ({
                          ...form,
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                  <label className="field-label" htmlFor="register-confirm">
                    Confirm
                  </label>
                  <div className={inputWrap}>
                    <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-gray" />
                    <input
                      id="register-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        setRegisterForm((form) => ({
                          ...form,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Repeat passphrase"
                      className="field-input pl-10"
                    />
                  </div>
                </div>
              </div>

              <PasswordStrength password={registerForm.password} />

              <FormNotice
                error={error}
                resendNotice={resendNotice}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {loading ? "Binding your folio..." : "Create your journal"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <p className="text-center text-[10px] leading-relaxed text-muted-gray">
                By creating a journal you agree to keep this space private and
                kind. Email verification is required before your first sign in.
              </p>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-7 flex flex-col items-start justify-between gap-2 border-t border-hairline pt-5 text-xs sm:flex-row sm:items-center">
        <p className="text-charcoal-muted">
          {mode === "signin" ? "New to Chronicle? " : "Already have a journal? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "register" : "signin")}
            className="font-medium text-sage transition-colors hover:text-sage-deep"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-gray">
          <ShieldCheck className="h-3.5 w-3.5 text-sage" />
          Secure JWT session
        </span>
      </div>
    </AuthLayout>
  );
}

function FormNotice({
  error,
  unverifiedEmail,
  resending,
  resendNotice,
  onResend,
}) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
          role="alert"
        >
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/15 bg-danger/[0.06] px-4 py-3 text-xs leading-relaxed text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={() => onResend(unverifiedEmail)}
                  disabled={resending}
                  className="mt-2 inline-flex items-center gap-1.5 font-medium underline decoration-danger/30 underline-offset-2 transition-opacity hover:opacity-70 disabled:opacity-50"
                >
                  {resending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {resendNotice && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <p className="flex items-start gap-2 rounded-xl bg-sage-subtle/70 px-4 py-3 text-xs leading-relaxed text-sage-deep">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {resendNotice}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  const labels = ["Too short", "Getting there", "Good", "Strong", "Very strong"];
  const colors = [
    "bg-hairline",
    "bg-danger/60",
    "bg-[#C9A86A]",
    "bg-sage/70",
    "bg-sage",
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              index < score ? colors[score] : "bg-hairline"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-gray">
        {password ? labels[score] : "Use 8+ characters, a number, and a symbol."}
      </p>
    </div>
  );
}
