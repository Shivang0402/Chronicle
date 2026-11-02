import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  PenLine,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import {
  clearDraft,
  getDraftOwner,
  listDrafts,
} from "../lib/drafts";
import {
  countWords,
  formatEntryDate,
  formatTime,
} from "../lib/journal";

function DraftCard({ draft, onResume, onDiscard }) {
  const words = countWords(draft.content);

  return (
    <article className="group flex flex-col rounded-2xl border border-hairline bg-paper p-5 shadow-paper transition-all duration-300 hover:border-sage/40 hover:shadow-paper-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[9px] uppercase tracking-wide2 text-muted-gray">
            {draft.isNew ? "New entry" : "Entry revision"}
          </span>
          <button
            type="button"
            onClick={() => onResume(draft)}
            className="mt-2 block text-left"
          >
            <h2 className="font-serif text-xl leading-snug tracking-tight text-charcoal transition-colors group-hover:text-sage-deep">
              {draft.title || "Untitled draft"}
            </h2>
          </button>
        </div>
        {draft.mood && (
          <span className="shrink-0 rounded-full bg-sage-subtle px-2.5 py-1 text-[10px] font-medium text-sage-deep">
            {draft.mood}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-4 text-[12px] font-light leading-relaxed text-charcoal-muted">
        {draft.content || "No words yet — open this draft to begin."}
      </p>

      {draft.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-warm-beige px-2 py-0.5 text-[10px] text-charcoal-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-hairline/70 pt-4 text-[10px] text-muted-gray">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 text-sage" />
          {formatEntryDate(draft.updatedAt)} · {formatTime(draft.updatedAt)}
          <span className="text-hairline">•</span>
          {words.toLocaleString("en-US")} {words === 1 ? "word" : "words"}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDiscard(draft)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-gray transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label={`Discard ${draft.title || "draft"}`}
            title="Discard draft"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onResume(draft)}
            className="inline-flex items-center gap-1 rounded-full bg-sage-subtle px-3 py-1.5 text-[10px] font-medium text-sage-deep transition-colors hover:bg-sage-light/60 hover:text-charcoal"
          >
            Resume
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DraftsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const draftOwner = getDraftOwner(user);

  const [drafts, setDrafts] = useState(() => listDrafts(draftOwner));
  const [tags, setTags] = useState([]);
  const [notice, setNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState("");

  useDocumentTitle("Drafts");

  useEffect(() => {
    const refreshDrafts = () => setDrafts(listDrafts(draftOwner));

    window.addEventListener("storage", refreshDrafts);
    return () => window.removeEventListener("storage", refreshDrafts);
  }, [draftOwner]);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    chronicleApi
      .getTags(token)
      .then((data) => {
        if (active) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Collections are supplementary to the drafts list.
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

  const totalWords = drafts.reduce(
    (sum, draft) => sum + countWords(draft.content),
    0,
  );

  const openEditor = () => navigate("/journal/new");

  const handleResume = (draft) => {
    navigate(draft.entryId ? `/journal/${draft.entryId}/edit` : "/journal/new");
  };

  const handleDiscard = (draft) => {
    const label = draft.title?.trim() || "this draft";

    if (!window.confirm(`Discard ${label}? This cannot be undone.`)) {
      return;
    }

    clearDraft(draftOwner, draft.entryId);
    setDrafts((current) => current.filter((item) => item.key !== draft.key));
    setNotice("Draft discarded.");
  };

  const handleSelectTag = (nextTag) => {
    navigate(
      nextTag
        ? `/journal?tag=${encodeURIComponent(nextTag)}`
        : "/journal",
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleExport = () => {
    setExportError("");
    setExportDialogOpen(true);
  };

  const handleExportDownload = async (filters) => {
    if (!token || exporting) return;

    setExporting(true);

    try {
      const blob = await chronicleApi.exportEntries(token, {
        ...filters,
        format: "pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `chronicles-${today}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Your PDF is ready.");
      setExportDialogOpen(false);
    } catch (exportFailure) {
      setExportError(
        exportFailure?.message || "Could not export your PDF.",
      );
    } finally {
      setExporting(false);
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
          onClearTag={() => navigate("/journal")}
          onNewEntry={openEditor}
          onExport={handleExport}
          onLogout={handleLogout}
          exporting={exporting}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          title="Drafts"
          onOpenMenu={() => setMobileNavOpen(true)}
          onNewEntry={openEditor}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen pt-16">
            <div className="pointer-events-none absolute inset-0 paper-texture opacity-50" />
            <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-sage-light/20 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <span className="eyebrow mb-3 block">Works in progress</span>
                  <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                    Drafts
                  </h1>
                  <p className="mt-2 text-[13px] text-charcoal-muted">
                    {drafts.length === 0
                      ? "Unfinished pages will wait for you here."
                      : `${drafts.length} ${
                          drafts.length === 1 ? "draft" : "drafts"
                        } · ${totalWords.toLocaleString(
                          "en-US",
                        )} ${totalWords === 1 ? "word" : "words"} in progress`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openEditor}
                  className="btn-sage self-start !px-5 !py-3 sm:self-auto"
                >
                  <PenLine className="h-4 w-4" />
                  Continue writing
                </button>
              </motion.div>

              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-hairline bg-warm-beige/50 p-4 text-[11px] leading-relaxed text-charcoal-muted sm:items-center sm:p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
                  <FileText className="h-4 w-4" />
                </span>
                <p>
                  Drafts are saved in this browser until you preserve them in
                  your journal or discard them. They are not included in your
                  archive yet.
                </p>
              </div>

              <div className="mt-7">
                {drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-paper/60 px-6 py-16 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-sage-subtle text-sage-deep">
                      <FileText className="h-5 w-5" />
                    </span>
                    <h2 className="mt-5 font-serif text-2xl text-charcoal">
                      No drafts in progress
                    </h2>
                    <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-charcoal-muted">
                      Start writing and your unfinished pages will appear here
                      automatically.
                    </p>
                    <button
                      type="button"
                      onClick={openEditor}
                      className="btn-sage mt-5 !px-5 !py-2.5 text-[10px]"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Start a new entry
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {drafts.map((draft) => (
                      <DraftCard
                        key={draft.key}
                        draft={draft}
                        onResume={handleResume}
                        onDiscard={handleDiscard}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-hairline bg-warm-beige/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-sage-deep shadow-sm">
                    <Download className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-charcoal">
                      Looking for a finished page?
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-charcoal-muted">
                      Return to your journal or export your preserved entries.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn-ghost self-start border border-hairline !px-4 !py-2.5 text-[11px] sm:self-auto"
                >
                  {exporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {exporting ? "Preparing..." : "Export Journal"}
                </button>
              </div>
            </div>
          </main>
        </div>

        <ExportDialog
          open={exportDialogOpen}
          token={token}
          exporting={exporting}
          exportError={exportError}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleExportDownload}
        />

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-5 right-5 z-[70] rounded-xl border border-hairline bg-paper px-4 py-3 text-[12px] text-charcoal shadow-paper-lg"
          >
            {notice}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
