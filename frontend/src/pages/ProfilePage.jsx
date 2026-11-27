import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import DeleteAccountDialog from "../components/dashboard/DeleteAccountDialog";
import EncryptionSettings from "../components/dashboard/EncryptionSettings";
import ExportDialog from "../components/dashboard/ExportDialog";
import PageTransition from "../components/ui/PageTransition";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi, chronicleApi } from "../lib/api";
import { getAccountId } from "../lib/cryptoSession.js";
import { clearDrafts, getDraftOwner } from "../lib/drafts";
import { exportNotice } from "../lib/exportFormats";
import { exportEntriesInBrowser } from "../lib/clientExport.js";
import { countWords, dayKey, formatEntryDate } from "../lib/journal";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const SECTIONS = [
  {
    id: "account",
    label: "Account",
    title: "Account",
    description: "Identity and sign-in details.",
  },
  {
    id: "security",
    label: "Security & encryption",
    title: "Security & encryption",
    description: "Password, encryption and recovery.",
  },
  {
    id: "data",
    label: "Your data & exports",
    title: "Your data & exports",
    description: "Download all or part of your journal.",
  },
  {
    id: "collections",
    label: "Collections",
    title: "Collections",
    description: "Tags and the entries they hold.",
  },
  {
    id: "sessions",
    label: "Sessions",
    title: "Sessions",
    description: "Access on this device.",
  },
  {
    id: "danger",
    label: "Danger zone",
    title: "Danger zone",
    description: "Permanent account actions.",
  },
];

function getSessionDetails() {
  if (typeof navigator === "undefined") {
    return { browser: "Browser", platform: "This device" };
  }

  const agent = navigator.userAgent || "";
  const browser = /Edg\//.test(agent)
    ? "Microsoft Edge"
    : /Firefox\//.test(agent)
      ? "Firefox"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : "Browser";
  const platform = /Windows NT/.test(agent)
    ? "Windows"
    : /Mac OS X/.test(agent)
      ? "macOS"
      : /Android/.test(agent)
        ? "Android"
        : /iPhone|iPad/.test(agent)
          ? "iOS"
          : "Desktop";

  return { browser, platform };
}

function SettingRow({ label, value, detail, action }) {
  return (
    <div className="grid gap-2 py-5 sm:grid-cols-[minmax(150px,0.32fr)_minmax(0,1fr)] sm:gap-8">
      <div>
        <p className="text-[13px] font-medium text-charcoal">{label}</p>
        {detail ? (
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-gray">
            {detail}
          </p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <span className="break-words text-[14px] text-charcoal-muted">
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}

function TextAction({ children, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border-b pb-0.5 text-[13px] font-medium transition-colors disabled:cursor-wait disabled:opacity-50 ${
        danger
          ? "border-danger/60 text-danger hover:border-danger hover:text-charcoal"
          : "border-sage/50 text-sage-dark hover:border-sage hover:text-charcoal"
      }`}
    >
      {children}
    </button>
  );
}

function SettingsNav({ activeSection, onChange }) {
  return (
    <nav
      aria-label="Profile settings sections"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <span className="eyebrow mb-3 hidden lg:block">Sections</span>
      <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
        {SECTIONS.map((section) => {
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-300 lg:w-full ${
                section.id === "danger" ? "text-danger" : ""
              } ${
                active
                  ? `bg-warm-beige/70 font-medium ${
                      section.id === "danger" ? "text-danger" : "text-charcoal"
                    }`
                  : section.id === "danger"
                    ? "hover:bg-danger/5"
                    : "text-muted-gray hover:bg-warm-beige/40 hover:text-charcoal"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PasswordForm({
  form,
  error,
  notice,
  busy,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="space-y-5 border-y border-hairline py-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h4 className="font-serif text-xl tracking-tight text-charcoal">
              Update your password
            </h4>
            <p className="mt-2 text-[13px] leading-relaxed text-charcoal-muted">
              At least 8 characters.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 text-[13px] text-muted-gray transition-colors hover:text-charcoal"
          >
            Cancel
          </button>
        </div>

        <label className="block">
          <span className="field-label">Current password</span>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            autoComplete="current-password"
            placeholder="Enter your current password"
            className="field-input !rounded-lg"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">
              New password
              <span className="text-[11px] font-normal text-muted-gray">
                At least 8 characters
              </span>
            </span>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={onChange}
              autoComplete="new-password"
              placeholder="Choose a new password"
              className="field-input !rounded-lg"
            />
          </label>
          <label className="block">
            <span className="field-label">Confirm new password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="field-input !rounded-lg"
            />
          </label>
        </div>

        {error ? (
          <p className="text-[13px] leading-relaxed text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="text-[13px] leading-relaxed text-sage-dark" role="status">
            {notice}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="border-b border-sage/60 pb-0.5 text-[13px] font-medium text-sage-dark transition-colors hover:border-sage hover:text-charcoal disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? "Updating password…" : "Update password"}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeSection, setActiveSection] = useState("account");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportScope, setExportScope] = useState("all");
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [session] = useState(getSessionDetails);

  useDocumentTitle("Profile");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    const loadArchiveSummary = async () => {
      const firstPage = await chronicleApi.getChronicles(
        token,
        { page: 1, limit: 20, sort: "oldest" },
        getAccountId(user),
      );
      const entries = [...(firstPage?.chronicles || [])];
      const totalPages = Math.max(Number(firstPage?.totalPages) || 1, 1);

      for (let startPage = 2; startPage <= totalPages; startPage += 4) {
        const pages = Array.from(
          { length: Math.min(4, totalPages - startPage + 1) },
          (_, index) => startPage + index,
        );
        const results = await Promise.all(
          pages.map((page) =>
            chronicleApi.getChronicles(
              token,
              { page, limit: 20, sort: "oldest" },
              getAccountId(user),
            ),
          ),
        );
        results.forEach((result) => entries.push(...(result?.chronicles || [])));
      }

      const tagCounts = new Map();
      const dateKeys = new Set();
      let totalWords = 0;
      for (const entry of entries) {
        totalWords += countWords(entry.content || "");
        dateKeys.add(dayKey(entry.date));
        for (const rawTag of Array.isArray(entry.tags) ? entry.tags : []) {
          const tag = typeof rawTag === "string" ? rawTag.trim() : "";
          if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }

      const orderedDays = [...dateKeys].sort();
      let longestStreak = 0;
      let streak = 0;
      let previousDay = null;
      for (const key of orderedDays) {
        const [year, month, day] = key.split("-").map(Number);
        const currentDay = Date.UTC(year, month - 1, day);
        streak =
          previousDay !== null && currentDay - previousDay === 86400000
            ? streak + 1
            : 1;
        longestStreak = Math.max(longestStreak, streak);
        previousDay = currentDay;
      }
      const today = dayKey(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const lastDay = orderedDays.at(-1);
      const currentStreak =
        lastDay === today || lastDay === dayKey(yesterdayDate)
          ? orderedDays
              .slice()
              .reverse()
              .reduce((length, key, index, days) => {
                if (index === 0) return 1;
                const [year, month, day] = key.split("-").map(Number);
                const [prevYear, prevMonth, prevDate] = days[index - 1]
                  .split("-")
                  .map(Number);
                return length &&
                  Date.UTC(year, month - 1, day) -
                    Date.UTC(prevYear, prevMonth - 1, prevDate) ===
                    86400000
                  ? length + 1
                  : 0;
              }, 0)
          : 0;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      if (active) {
        setTags(
          [...tagCounts]
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count),
        );
        setStats({
          totalChronicles: entries.length,
          totalWords,
          currentStreak,
          longestStreak,
          entriesThisMonth: entries.filter(
            (entry) => new Date(entry.date) >= monthStart,
          ).length,
        });
      }
    };

    loadArchiveSummary().catch(() => {});

    return () => {
      active = false;
    };
  }, [token, user]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const initial = (user?.name || user?.email || "C").charAt(0).toUpperCase();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Chronicle writer";
  const email = user?.email || "Not available";
  const memberSince = user?.createdAt
    ? formatEntryDate(user.createdAt)
    : "Not available";
  const verified = Boolean(user?.isEmailVerified);
  const activeMeta =
    SECTIONS.find((section) => section.id === activeSection) || SECTIONS[0];

  const statItems = [
    {
      label: "Entries",
      value: stats ? Number(stats.totalChronicles || 0).toLocaleString() : "—",
    },
    {
      label: "Words written",
      value: stats ? Number(stats.totalWords || 0).toLocaleString() : "—",
    },
    {
      label: "Current streak",
      value: stats ? Number(stats.currentStreak || 0).toLocaleString() : "—",
    },
  ];

  const handleNewEntry = () => navigate("/journal/new");

  const handleSelectTag = (tag) => {
    navigate(tag ? `/journal?tag=${encodeURIComponent(tag)}` : "/journal");
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  const closeDeleteDialog = () => {
    if (deletingAccount) return;
    setDeleteDialogOpen(false);
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    if (!token || deletingAccount) return;

    setDeletingAccount(true);
    setDeleteError("");

    try {
      await authApi.deleteAccount(token);
      clearDrafts(getDraftOwner(user));
      navigate("/", { replace: true });
      logout();
    } catch (error) {
      setDeleteError(
        error?.message || "Could not delete your account. Please try again.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleOpenExport = (format = "pdf", scope = "all") => {
    setExportFormat(format);
    setExportScope(scope);
    setExportError("");
    setExportDialogOpen(true);
  };

  const runExport = async (format, entries) => {
    if (!token || exporting) return false;

    setExportError("");
    setExporting(format);

    try {
      exportEntriesInBrowser(entries, format);
      setNotice(exportNotice(format));
      return true;
    } catch (error) {
      setExportError(error?.message || "Could not export your journal.");
      return false;
    } finally {
      setExporting("");
    }
  };

  const handleDialogExport = async (filters, entries) => {
    const success = await runExport(filters.format || exportFormat, entries);

    if (success) {
      setExportDialogOpen(false);
    }
  };

  const closePasswordForm = () => {
    setPasswordOpen(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordError("");
    setPasswordNotice("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordError("");
    setPasswordNotice("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (changingPassword) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    setPasswordNotice("");

    try {
      await authApi.changePassword({ currentPassword, newPassword }, token);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordNotice("Your password has been updated.");
    } catch (error) {
      setPasswordError(
        error?.message || "Could not update your password. Please try again.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email || resendingVerification) return;

    setResendingVerification(true);
    setVerificationError("");
    setVerificationNotice("");

    try {
      await authApi.resendVerification(user.email);
      setVerificationNotice(`Verification email sent to ${user.email}.`);
    } catch (error) {
      setVerificationError(
        error?.message || "Could not send the verification email.",
      );
    } finally {
      setResendingVerification(false);
    }
  };

  const renderSection = () => {
    if (activeSection === "security") {
      return (
        <div className="space-y-8">
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-serif text-2xl tracking-tight text-charcoal">
                Password
              </h3>
              {!passwordOpen ? (
                <TextAction onClick={() => setPasswordOpen(true)}>
                  Change password
                </TextAction>
              ) : null}
            </div>

            <div className="divide-y divide-hairline border-y border-hairline">
              <SettingRow label="Account password" value="Configured" />
            </div>

            <AnimatePresence initial={false}>
              {passwordOpen ? (
                <PasswordForm
                  form={passwordForm}
                  error={passwordError}
                  notice={passwordNotice}
                  busy={changingPassword}
                  onChange={handlePasswordChange}
                  onSubmit={handlePasswordSubmit}
                  onCancel={closePasswordForm}
                />
              ) : null}
            </AnimatePresence>
          </section>

          <EncryptionSettings
            token={token}
            ownerId={getAccountId(user)}
            onNotice={setNotice}
          />
        </div>
      );
    }

    if (activeSection === "data") {
      return (
        <div className="space-y-6">
          <div className="divide-y divide-hairline border-y border-hairline">
            <SettingRow
              label="Export entire journal"
              value="Every entry"
              action={
                <TextAction onClick={() => handleOpenExport("pdf", "all")}>
                  Choose format
                </TextAction>
              }
            />
            <SettingRow
              label="Export selected entries"
              value="Individual pages"
              action={
                <TextAction onClick={() => handleOpenExport("pdf", "selected")}>
                  Choose entries
                </TextAction>
              }
            />
            <SettingRow
              label="Export by date range"
              value="Start and end date"
              action={
                <TextAction onClick={() => handleOpenExport("pdf", "range")}>
                  Choose dates
                </TextAction>
              }
            />
            <SettingRow
              label="Export by year"
              value="One calendar year"
              action={
                <TextAction onClick={() => handleOpenExport("pdf", "year")}>
                  Choose year
                </TextAction>
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-gray">
            <span className="text-charcoal">Formats</span>
            <span>JSON</span>
            <span>Markdown</span>
            <span>Styled PDF</span>
          </div>

          <p className="border-l border-sage/50 pl-5 text-[13px] leading-relaxed text-charcoal-muted">
            Exports are decrypted in this browser.
          </p>

          {exportError ? (
            <p className="text-[13px] leading-relaxed text-danger" role="alert">
              {exportError}
            </p>
          ) : null}
        </div>
      );
    }

    if (activeSection === "collections") {
      return (
        <div className="border-y border-hairline">
          {tags.length === 0 ? (
            <p className="py-8 text-[14px] leading-relaxed text-charcoal-muted">
              No collections yet.
            </p>
          ) : (
            tags.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => handleSelectTag(item.tag)}
                className="group grid w-full grid-cols-1 gap-2 border-b border-hairline py-5 text-left transition-colors hover:bg-[var(--interactive-hover)] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-8"
              >
                <span className="truncate font-serif text-lg text-charcoal">
                  #{item.tag}
                </span>
                <span className="text-xs text-muted-gray">
                  {item.count} {item.count === 1 ? "entry" : "entries"}
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] font-medium text-sage-dark">
                  Browse entries
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))
          )}
          <div className="py-5">
            <TextAction onClick={() => handleSelectTag("")}>
              Browse all entries
            </TextAction>
          </div>
        </div>
      );
    }

    if (activeSection === "sessions") {
      return (
        <div className="space-y-6">
          <div className="divide-y divide-hairline border-y border-hairline">
            <SettingRow
              label="Current session"
              value="This device"
              detail={`${session.browser} · ${session.platform}`}
            />
            <SettingRow label="Signed in as" value={email} />
          </div>

          <div className="border-t border-hairline pt-6">
            <TextAction onClick={handleLogout}>Sign out</TextAction>
          </div>
        </div>
      );
    }

    if (activeSection === "danger") {
      return (
        <section className="max-w-3xl rounded-lg border-l border-danger/40 pl-6">
          <h3 className="font-serif text-2xl tracking-tight text-danger">
            Delete account
          </h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-charcoal">
            This permanently removes your account and every journal entry. It
            cannot be undone.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-charcoal-muted">
            Export anything you want to keep first.
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeleteDialogOpen(true);
            }}
            className="mt-6 inline-flex items-center gap-2 border-b border-danger/60 pb-1 text-[13px] font-medium text-danger transition-colors hover:border-danger hover:text-charcoal"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      );
    }

    return (
      <div className="space-y-6">
        <div className="divide-y divide-hairline border-y border-hairline">
          <SettingRow label="Display name" value={displayName} />
          <SettingRow label="Email address" value={email} />
          <SettingRow
            label="Email verification"
            value={verified ? "Verified" : "Not verified"}
            action={
              verified ? null : (
                <TextAction
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                >
                  {resendingVerification
                    ? "Sending…"
                    : "Resend verification email"}
                </TextAction>
              )
            }
          />
          <SettingRow label="Account created" value={memberSince} />
          <SettingRow label="Sign-in method" value="Email and password" />
        </div>

        {verificationError ? (
          <p className="text-[13px] leading-relaxed text-danger" role="alert">
            {verificationError}
          </p>
        ) : null}
        {verificationNotice ? (
          <p className="text-[13px] leading-relaxed text-sage-dark" role="status">
            {verificationNotice}
          </p>
        ) : null}

      </div>
    );
  };

  return (
    <PageTransition variant="fade">
      <div className="profile-shell min-h-screen bg-ivory text-charcoal">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag=""
          onSelectTag={handleSelectTag}
          onClearTag={() => handleSelectTag("")}
          onNewEntry={handleNewEntry}
          onExport={() => handleOpenExport("pdf", "all")}
          onLogout={handleLogout}
          exporting={Boolean(exporting)}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          title="Profile"
          onOpenMenu={() => setMobileNavOpen(true)}
          onLogout={handleLogout}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen overflow-x-clip pt-16">
            <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-14">
              <Reveal
                as="header"
                variant="right"
                y={16}
                blur={false}
                className="max-w-3xl"
              >
                <span className="eyebrow">Account & preferences</span>
                <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-tight text-charcoal sm:text-5xl">
                  Profile
                </h1>
                <p className="mt-4 text-[14px] leading-relaxed text-charcoal-muted">
                  Manage your identity, journal data and privacy.
                </p>
              </Reveal>

              <Reveal
                as="section"
                variant="down"
                y={16}
                delay={0.06}
                blur={false}
                className="mt-10 border-y border-hairline py-8 sm:py-10"
              >
                <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-5 sm:gap-6">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-sage/35 bg-sage-subtle/60 font-serif text-3xl text-sage-dark sm:h-20 sm:w-20 sm:text-4xl">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
                        {displayName}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-charcoal-muted">
                        <span className="truncate">{email}</span>
                        <span className="hidden h-3 w-px bg-hairline sm:block" />
                        <span className={verified ? "text-sage-dark" : ""}>
                          {verified ? "Email verified" : "Email not verified"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-gray">
                        Joined {memberSince}
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 gap-5 border-t border-hairline pt-6 sm:grid-cols-3 sm:gap-8 xl:min-w-[460px] xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
                    {statItems.map((item) => (
                      <div key={item.label}>
                        <dt className="text-[10px] uppercase tracking-wide2 text-muted-gray">
                          {item.label}
                        </dt>
                        <dd className="stat-number mt-1 font-serif text-2xl text-charcoal sm:text-[28px]">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>

              <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(190px,220px)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-16">
                <SettingsNav
                  activeSection={activeSection}
                  onChange={setActiveSection}
                />

                <section className="min-w-0" aria-label={activeMeta.title}>
                  <div className="mb-8 border-b border-hairline pb-6">
                    <span className="eyebrow">{activeMeta.label}</span>
                    <h2 className="mt-2 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
                      {activeMeta.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-charcoal-muted">
                      {activeMeta.description}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {renderSection()}
                    </motion.div>
                  </AnimatePresence>
                </section>
              </div>

              <footer className="mt-14 flex flex-col gap-4 border-t border-hairline pt-6 text-xs text-muted-gray sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Account details and journal data stay private to you.
                </span>
                <div className="flex items-center gap-5">
                  <Link
                    to="/dashboard"
                    className="transition-colors hover:text-charcoal"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/journal"
                    className="transition-colors hover:text-charcoal"
                  >
                    My Journal
                  </Link>
                  <Link
                    to="/insights"
                    className="transition-colors hover:text-charcoal"
                  >
                    Insights
                  </Link>
                </div>
              </footer>
            </div>
          </main>
        </div>

        <ExportDialog
          key={
            exportDialogOpen
              ? `export-open-${exportFormat}-${exportScope}`
              : "export-closed"
          }
          open={exportDialogOpen}
          token={token}
          ownerId={getAccountId(user)}
          exporting={Boolean(exporting)}
          exportError={exportError}
          initialFormat={exportFormat}
          initialScope={exportScope}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleDialogExport}
        />

        <DeleteAccountDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteAccount}
          deleting={deletingAccount}
          error={deleteError}
        />

        <AnimatePresence>
          {notice ? (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 border border-hairline border-l-sage bg-paper px-5 py-3 text-[13px] text-charcoal shadow-paper-lg"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-dark" />
              {notice}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
