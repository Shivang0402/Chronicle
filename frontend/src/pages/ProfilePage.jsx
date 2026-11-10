import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Hash,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import DeleteAccountDialog from "../components/dashboard/DeleteAccountDialog";
import ExportDialog from "../components/dashboard/ExportDialog";
import PageTransition from "../components/ui/PageTransition";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi, chronicleApi } from "../lib/api";
import { clearDrafts, getDraftOwner } from "../lib/drafts";
import { formatEntryDate } from "../lib/journal";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const EXPORT_FORMATS = [
  {
    id: "pdf",
    label: "PDF journal",
    dialogLabel: "PDF",
    dialogHint: "A typeset keepsake ready to print",
  },
];

const EXPORT_DIALOG_FORMATS = EXPORT_FORMATS.map((item) => ({
  id: item.id,
  label: item.dialogLabel,
  description: item.dialogHint,
}));

const todayStamp = () => new Date().toISOString().slice(0, 10);

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-subtle text-sage-deep">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="font-serif text-xl tracking-tight text-charcoal">
          {title}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-charcoal-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="bg-paper px-4 py-4 sm:px-5">
      <p className="text-[9px] uppercase tracking-wide2 text-muted-gray">
        {label}
      </p>
      <p className="mt-1 stat-number font-serif text-xl text-charcoal">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const securityRef = useRef(null);

  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useDocumentTitle("Profile");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    chronicleApi
      .getTags(token)
      .then((data) => {
        if (active) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Collections are supplementary to the profile page.
      });

    chronicleApi
      .getStats(token)
      .then((data) => {
        if (active) setStats(data || null);
      })
      .catch(() => {
        // Stats are supplementary to the profile page.
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const initial = (user?.name || user?.email || "C").charAt(0).toUpperCase();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Chronicle writer";
  const memberSince = user?.createdAt
    ? formatEntryDate(user.createdAt)
    : "Not available";
  const verified = Boolean(user?.isEmailVerified);

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
      label: "Day streak",
      value: stats ? Number(stats.currentStreak || 0).toLocaleString() : "—",
    },
    {
      label: "This month",
      value: stats ? Number(stats.entriesThisMonth || 0).toLocaleString() : "—",
    },
  ];

  const handleNewEntry = () => navigate("/journal/new");

  const handleSelectTag = (tag) => {
    navigate(tag ? `/journal?tag=${encodeURIComponent(tag)}` : "/journal");
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
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
      logout();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteError(
        error?.message || "Could not delete your account. Please try again.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleOpenExport = (format = "pdf") => {
    setExportFormat(format);
    setExportError("");
    setExportDialogOpen(true);
  };

  const runExport = async (format, filters = {}) => {
    if (!token || exporting) return false;

    setExportError("");
    setExporting(format);

    try {
      const blob = await chronicleApi.exportEntries(token, {
        ...filters,
        format,
      });
      const date = todayStamp();
      const extension = format;
      const label =
        EXPORT_FORMATS.find((item) => item.id === format)?.label || format;

      triggerDownload(blob, `chronicles-${date}.${extension}`);
      setNotice(`${label} export is ready.`);
      return true;
    } catch (error) {
      setExportError(error?.message || "Could not export your journal.");
      return false;
    } finally {
      setExporting("");
    }
  };

  const handleDialogExport = async (filters) => {
    const success = await runExport(filters.format || exportFormat, filters);

    if (success) {
      setExportDialogOpen(false);
    }
  };

  const openPasswordForm = () => {
    setPasswordError("");
    setPasswordNotice("");
    setPasswordOpen(true);
    window.requestAnimationFrame(() => {
      securityRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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

  return (
    <PageTransition variant="fade">
      <div className="min-h-screen bg-ivory">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag=""
          onSelectTag={handleSelectTag}
          onClearTag={() => handleSelectTag("")}
          onNewEntry={handleNewEntry}
          onExport={() => handleOpenExport("pdf")}
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
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <Reveal
                as="header"
                variant="right"
                y={18}
                blur={false}
                className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <span className="eyebrow mb-3 block">Account & preferences</span>
                  <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                    Profile
                  </h1>
                  <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-charcoal-muted">
                    Your details, exports, and security gathered in one calm
                    place.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-hairline bg-paper px-4 py-2 text-[10px] font-medium uppercase tracking-wide2 text-muted-gray shadow-sm sm:self-auto">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Private journal
                </span>
              </Reveal>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col gap-6 lg:col-span-8">
                  <Reveal
                    as="section"
                    variant="scale"
                    y={20}
                    delay={0.06}
                    blur={false}
                    className="overflow-hidden rounded-3xl border border-hairline bg-paper shadow-paper"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-sage-darker via-sage-deep to-sage-deep p-6 sm:p-8">
                      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/15" />
                      <div className="pointer-events-none absolute -bottom-20 right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 font-serif text-3xl text-white shadow-inner backdrop-blur">
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase tracking-mega text-white/80">
                              Your private folio
                            </span>
                            <h2 className="mt-1 truncate font-serif text-2xl text-white sm:text-3xl">
                              {displayName}
                            </h2>
                            <p className="mt-1 flex items-center gap-2 text-[12px] text-white/85">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {user?.email || "Not available"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium ${
                              verified
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-white/20 bg-white/10 text-white/80"
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {verified ? "Email verified" : "Email unverified"}
                          </span>
                          <button
                            type="button"
                            onClick={openPasswordForm}
                            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-medium uppercase tracking-wide2 text-white transition-colors hover:bg-white/20"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Change password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px border-b border-hairline bg-hairline sm:grid-cols-4">
                      {statItems.map((item) => (
                        <StatBlock
                          key={item.label}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 p-5 text-[11px] text-muted-gray sm:flex-row sm:items-center">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-sage" />
                        Member since {memberSince}
                      </span>
                    </div>
                  </Reveal>

                  <Reveal
                    as="section"
                    variant="left"
                    y={20}
                    delay={0.12}
                    blur={false}
                    className="rounded-3xl border border-hairline bg-paper p-6 shadow-paper sm:p-7"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <SectionHeading
                        icon={Download}
                        title="Exports"
                        description="Take a copy of your journal whenever you need it."
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenExport("pdf")}
                        disabled={Boolean(exporting)}
                        className="btn-sage shrink-0 self-start !px-5 !py-3 text-[10px] disabled:cursor-wait sm:self-auto"
                      >
                        {exporting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        {exporting ? "Preparing..." : "Export journal"}
                      </button>
                    </div>

                    <p className="mt-5 flex items-start gap-2 border-t border-hairline/70 pt-4 text-[10px] leading-relaxed text-muted-gray">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                      Create a print-ready PDF, then choose which part of your
                      journal to include.
                    </p>

                    {exportError && (
                      <p
                        role="alert"
                        className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-danger"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {exportError}
                      </p>
                    )}
                  </Reveal>

                  <Reveal
                    as="section"
                    nodeRef={securityRef}
                    variant="down"
                    y={18}
                    delay={0.18}
                    blur={false}
                    className="scroll-mt-24 rounded-3xl border border-hairline bg-paper p-6 shadow-paper sm:p-7"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <SectionHeading
                        icon={Lock}
                        title="Password & security"
                        description="Keep your journal protected with a strong, private password."
                      />
                      {!passwordOpen && (
                        <button
                          type="button"
                          onClick={openPasswordForm}
                          className="btn-ghost self-start border border-hairline !px-4 !py-2.5 text-[11px]"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Change password
                        </button>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-hairline bg-warm-beige/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[13px] font-medium text-charcoal">
                            Password protection
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-gray">
                            Your account is protected by a password only you
                            know. Change it whenever you need to.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-sage-subtle px-3 py-1 text-[10px] font-medium text-sage-deep sm:self-auto">
                        <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
                        Active
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {passwordOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <form
                            onSubmit={handlePasswordSubmit}
                            className="mt-5 rounded-2xl border border-hairline bg-ivory/60 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-serif text-lg tracking-tight text-charcoal">
                                  Update your password
                                </h3>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-gray">
                                  Use at least 8 characters you do not use
                                  anywhere else.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={closePasswordForm}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                                aria-label="Close password form"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-5 space-y-4">
                              <label className="block">
                                <span className="field-label">
                                  Current password
                                </span>
                                <input
                                  type="password"
                                  name="currentPassword"
                                  value={passwordForm.currentPassword}
                                  onChange={handlePasswordChange}
                                  autoComplete="current-password"
                                  placeholder="Enter your current password"
                                  className="field-input"
                                />
                              </label>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block">
                                  <span className="field-label">
                                    New password
                                    <span className="text-[10px] font-normal text-muted-gray">
                                      At least 8 characters
                                    </span>
                                  </span>
                                  <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    placeholder="Choose a new password"
                                    className="field-input"
                                  />
                                </label>

                                <label className="block">
                                  <span className="field-label">
                                    Confirm new password
                                  </span>
                                  <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    placeholder="Repeat your new password"
                                    className="field-input"
                                  />
                                </label>
                              </div>
                            </div>

                            {passwordError && (
                              <p
                                role="alert"
                                className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-danger"
                              >
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {passwordError}
                              </p>
                            )}

                            {passwordNotice && (
                              <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-sage-deep">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {passwordNotice}
                              </p>
                            )}

                            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-hairline/70 pt-4 sm:flex-row sm:justify-end">
                              <button
                                type="button"
                                onClick={closePasswordForm}
                                className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[11px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={changingPassword}
                                className="btn-sage justify-center !px-5 !py-2.5 text-[10px] disabled:cursor-wait"
                              >
                                {changingPassword ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <KeyRound className="h-3.5 w-3.5" />
                                )}
                                {changingPassword
                                  ? "Updating..."
                                  : "Update password"}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Reveal>
                </div>

                <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
                  <Reveal
                    as="section"
                    variant="right"
                    y={20}
                    delay={0.1}
                    blur={false}
                    className="rounded-3xl border border-hairline bg-paper p-6 shadow-paper"
                  >
                    <SectionHeading
                      icon={Hash}
                      title="Collections"
                      description="The tags that gather your pages."
                    />

                    <div className="mt-5 flex flex-col gap-1">
                      {tags.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-hairline bg-ivory/60 px-4 py-5 text-[11px] leading-relaxed text-muted-gray">
                          Tags you add to entries will gather here for quick
                          access.
                        </p>
                      ) : (
                        tags.slice(0, 6).map((item, index) => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => handleSelectTag(item.tag)}
                            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[12px] text-charcoal-muted transition-colors hover:bg-warm-beige/60 hover:text-charcoal"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                index % 2 === 0 ? "bg-sage" : "bg-sage-deep"
                              }`}
                            />
                            <span className="truncate">#{item.tag}</span>
                            <span className="ml-auto text-[10px] text-muted-gray">
                              {item.count}
                            </span>
                            <ArrowRight className="h-3 w-3 text-transparent transition-colors group-hover:text-sage-deep" />
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTag("")}
                      className="mt-4 inline-flex w-full items-center justify-between border-t border-hairline/70 pt-4 text-[11px] text-sage-deep transition-colors hover:text-charcoal"
                    >
                      Browse all entries
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Reveal>

                  <Reveal
                    as="section"
                    variant="scale"
                    y={20}
                    delay={0.16}
                    blur={false}
                    className="relative overflow-hidden rounded-3xl border border-sage/20 bg-gradient-to-br from-sage-subtle via-paper to-warm-beige p-6 shadow-paper"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sage/10 blur-2xl" />
                    <span className="relative grid h-10 w-10 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h2 className="relative mt-4 font-serif text-xl tracking-tight text-charcoal">
                      Yours, always.
                    </h2>
                    <p className="relative mt-2 text-[11px] leading-relaxed text-charcoal-muted">
                      Your journal is private to this account. Keep it close,
                      revisit it often, and take a copy whenever you like.
                    </p>
                    <Link
                      to="/insights"
                      className="relative mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-sage-deep transition-colors hover:text-charcoal"
                    >
                      See your insights
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Reveal>

                  <Reveal
                    as="section"
                    variant="fade"
                    y={14}
                    delay={0.22}
                    blur={false}
                    className="rounded-3xl border border-hairline bg-paper p-6 shadow-paper"
                  >
                    <SectionHeading
                      icon={User}
                      title="Session"
                      description="You are signed in on this device."
                    />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-ivory/60 px-4 py-3 text-[11px] font-medium uppercase tracking-wide2 text-danger transition-colors hover:border-danger/30 hover:bg-danger/5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </Reveal>

                  <Reveal
                    as="section"
                    variant="fade"
                    y={14}
                    delay={0.26}
                    blur={false}
                    className="rounded-3xl border border-danger/20 bg-paper p-6 shadow-paper"
                  >
                    <SectionHeading
                      icon={Trash2}
                      title="Delete account"
                      description="Permanently remove your account and journal."
                    />
                    <p className="mt-4 text-[11px] leading-relaxed text-muted-gray">
                      This cannot be undone. Export any entries you want to keep
                      before continuing.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteDialogOpen(true);
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/[0.04] px-4 py-3 text-[11px] font-medium uppercase tracking-wide2 text-danger transition-colors hover:border-danger/40 hover:bg-danger/[0.08]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete account
                    </button>
                  </Reveal>
                </aside>
              </div>

              <Reveal
                as="footer"
                variant="fade"
                y={10}
                blur={false}
                className="mt-10 flex flex-col gap-3 border-t border-hairline pb-4 pt-6 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Account details and journal data stay private to you
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="transition-colors hover:text-charcoal"
                  >
                    Dashboard
                  </Link>
                  <span>•</span>
                  <Link
                    to="/journal"
                    className="transition-colors hover:text-charcoal"
                  >
                    My Journal
                  </Link>
                  <span>•</span>
                  <Link
                    to="/insights"
                    className="transition-colors hover:text-charcoal"
                  >
                    Insights
                  </Link>
                </div>
              </Reveal>
            </div>
          </main>
        </div>

        <ExportDialog
          key={exportDialogOpen ? `export-open-${exportFormat}` : "export-closed"}
          open={exportDialogOpen}
          token={token}
          exporting={Boolean(exporting)}
          exportError={exportError}
          formats={EXPORT_DIALOG_FORMATS}
          initialFormat={exportFormat}
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

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 right-5 z-[70] rounded-xl border border-hairline bg-paper px-4 py-3 text-[12px] text-charcoal shadow-paper-lg"
          >
            {notice}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
