import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi, chronicleApi } from "../lib/api";
import { formatEntryDate } from "../lib/journal";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const EXPORT_FORMATS = [
  {
    format: "pdf",
    label: "PDF journal",
    description: "A typeset keepsake of your pages, ready to print or keep.",
    icon: BookOpen,
    action: "Choose entries",
  },
  {
    format: "markdown",
    label: "Markdown",
    description: "Plain-text pages you can open in any writing app.",
    icon: FileText,
    action: "Download",
  },
  {
    format: "json",
    label: "JSON archive",
    description: "Structured data for backing up or moving your journal.",
    icon: FileJson,
    action: "Download",
  },
];

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

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useDocumentTitle("Settings");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    chronicleApi
      .getTags(token)
      .then((data) => {
        if (active) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Collections are supplementary to the settings page.
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
  const memberSince = user?.createdAt
    ? formatEntryDate(user.createdAt)
    : "Not available";

  const handleNewEntry = () => navigate("/journal/new");

  const handleSelectTag = (tag) => {
    navigate(tag ? `/journal?tag=${encodeURIComponent(tag)}` : "/journal");
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleOpenExport = () => {
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
      const extension = format === "markdown" ? "md" : format;
      const label =
        EXPORT_FORMATS.find((item) => item.format === format)?.label || format;

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
    const success = await runExport(filters.format || "pdf", filters);

    if (success) {
      setExportDialogOpen(false);
    }
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
      await authApi.changePassword(
        { currentPassword, newPassword },
        token,
      );
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
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <DashboardSidebar
          user={user}
          tags={tags}
          activeTag=""
          onSelectTag={handleSelectTag}
          onClearTag={() => handleSelectTag("")}
          onNewEntry={handleNewEntry}
          onExport={handleOpenExport}
          onLogout={handleLogout}
          exporting={Boolean(exporting)}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          title="Settings"
          onOpenMenu={() => setMobileNavOpen(true)}
          onNewEntry={handleNewEntry}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="eyebrow mb-3 block">Your account</span>
                <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                  Settings
                </h1>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-charcoal-muted">
                  Keep your account secure and take a copy of your journal
                  whenever you need it.
                </p>
              </motion.div>

              <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-hairline bg-paper p-6 shadow-paper sm:p-7"
                >
                  <SectionHeading
                    icon={User}
                    title="Profile"
                    description="The details attached to your private journal."
                  />

                  <div className="mt-6 flex items-center gap-4 rounded-xl border border-hairline bg-warm-beige/40 p-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-subtle font-serif text-xl text-sage-deep">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-lg text-charcoal">
                        {user?.name || "Chronicle writer"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-gray">
                        @{user?.username || "writer"}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 text-[12px]">
                    <div className="flex items-start justify-between gap-4 border-b border-hairline/70 pb-3">
                      <dt className="flex items-center gap-2 text-muted-gray">
                        <Mail className="h-3.5 w-3.5 text-sage" />
                        Email
                      </dt>
                      <dd className="flex items-center gap-1.5 text-right text-charcoal">
                        <span className="break-all">
                          {user?.email || "Not available"}
                        </span>
                        {user?.isEmailVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
                        )}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-b border-hairline/70 pb-3">
                      <dt className="text-muted-gray">Username</dt>
                      <dd className="text-charcoal">
                        @{user?.username || "writer"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="flex items-center gap-2 text-muted-gray">
                        <CalendarDays className="h-3.5 w-3.5 text-sage" />
                        Member since
                      </dt>
                      <dd className="text-charcoal">{memberSince}</dd>
                    </div>
                  </dl>

                  <p className="mt-5 flex items-start gap-2 border-t border-hairline/70 pt-4 text-[10px] leading-relaxed text-muted-gray">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                    Your journal is private to this account. Account details
                    are verified when you sign in.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.14,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-hairline bg-paper p-6 shadow-paper sm:p-7"
                >
                  <SectionHeading
                    icon={KeyRound}
                    title="Password"
                    description="Choose a strong password you do not use elsewhere."
                  />

                  <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
                    <label className="block">
                      <span className="field-label">Current password</span>
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
                      <span className="field-label">Confirm new password</span>
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

                    {passwordError && (
                      <p
                        role="alert"
                        className="flex items-start gap-2 text-[11px] leading-relaxed text-danger"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {passwordError}
                      </p>
                    )}

                    {passwordNotice && (
                      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-sage-deep">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {passwordNotice}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="btn-sage w-full !px-5 !py-3 disabled:cursor-wait sm:w-auto"
                    >
                      {changingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      {changingPassword ? "Updating..." : "Update password"}
                    </button>
                  </form>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-hairline bg-paper p-6 shadow-paper sm:p-7 xl:col-span-2"
                >
                  <SectionHeading
                    icon={Download}
                    title="Data & exports"
                    description="Your words belong to you. Take them with you in the format you need."
                  />

                  <div className="mt-6 divide-y divide-hairline border-y border-hairline">
                    {EXPORT_FORMATS.map((item) => {
                      const Icon = item.icon;
                      const isBusy = exporting === item.format;

                      return (
                        <div
                          key={item.format}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warm-beige text-sage-deep">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-[13px] font-medium text-charcoal">
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-gray">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              item.format === "pdf"
                                ? handleOpenExport()
                                : runExport(item.format)
                            }
                            disabled={Boolean(exporting)}
                            className="btn-ghost self-start border border-hairline !px-4 !py-2 text-[11px] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            {isBusy ? "Preparing..." : item.action}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {exportError && (
                    <p
                      role="alert"
                      className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-danger"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {exportError}
                    </p>
                  )}
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.26,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-hairline bg-paper p-6 shadow-paper sm:p-7 xl:col-span-2"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warm-beige text-sage-deep">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="font-serif text-xl tracking-tight text-charcoal">
                          Session
                        </h2>
                        <p className="mt-1 text-[12px] leading-relaxed text-charcoal-muted">
                          Signed in as{" "}
                          <span className="text-charcoal">
                            {user?.email || "your account"}
                          </span>
                          . Sign out when you are finished writing on this
                          device.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn-ghost self-start border border-hairline !px-4 !py-2.5 text-[11px] text-danger hover:text-danger sm:self-auto"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </motion.section>
              </div>

              <footer className="mt-10 flex flex-col gap-3 border-t border-hairline pb-4 pt-6 text-[10px] text-muted-gray sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  All entries encrypted in transit via JWT/HTTPS
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
              </footer>
            </div>
          </main>
        </div>

        <ExportDialog
          open={exportDialogOpen}
          token={token}
          exporting={Boolean(exporting)}
          exportError={exportError}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleDialogExport}
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
