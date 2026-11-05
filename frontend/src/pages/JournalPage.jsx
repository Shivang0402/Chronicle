import { motion } from "framer-motion";
import {
  ArrowDownUp,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Hash,
  LayoutGrid,
  List,
  PenLine,
  Search,
  SearchX,
  Smile,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ExportDialog from "../components/dashboard/ExportDialog";
import EntryReader from "../components/dashboard/EntryReader";
import FilterDatePicker from "../components/ui/FilterDatePicker";
import FilterSelect from "../components/ui/FilterSelect";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { chronicleApi } from "../lib/api";
import {
  countWords,
  formatEntryDate,
  formatTime,
  readingTime,
} from "../lib/journal";
import { stripMarkdown } from "../lib/markdown";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const groupEntries = (entries) => {
  const groups = [];

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.find((item) => item.key === key);

    if (!group) {
      group = {
        key,
        month: date.toLocaleDateString("en-US", { month: "long" }),
        year: date.getFullYear(),
        entries: [],
      };
      groups.push(group);
    }

    group.entries.push(entry);
  });

  return groups;
};

const getPageNumbers = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
};

function ArchiveEntryCard({ entry, view, onOpen }) {
  const words = countWords(entry.content);
  const isList = view === "list";

  return (
    <article
      className={`group flex flex-col rounded-2xl border border-hairline bg-paper p-5 shadow-paper transition-all duration-300 hover:border-sage/40 hover:shadow-paper-lg ${
        isList ? "sm:flex-row sm:items-start sm:gap-6" : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide2 text-muted-gray">
            <CalendarDays className="h-3 w-3 text-sage" />
            {formatEntryDate(entry.date)}
            <span className="text-hairline">•</span>
            {formatTime(entry.date)}
          </span>
          {entry.mood && (
            <span className="rounded-full bg-sage-subtle px-2.5 py-1 text-[10px] font-medium text-sage-deep">
              {entry.mood}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(entry)}
          className="mt-3 block text-left"
        >
          <h3 className="font-serif text-lg leading-snug tracking-tight text-charcoal transition-colors group-hover:text-sage-deep">
            {entry.title || "Untitled entry"}
          </h3>
          <p
            className={`mt-2 text-[12px] font-light leading-relaxed text-charcoal-muted ${
              isList ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {stripMarkdown(entry.content)}
          </p>
        </button>

        {entry.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-warm-beige px-2 py-0.5 text-[10px] text-charcoal-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-3 border-t border-hairline/70 pt-3 text-[10px] text-muted-gray ${
          isList
            ? "mt-4 sm:mt-0 sm:w-28 sm:shrink-0 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0"
            : "mt-5"
        }`}
      >
        <span>
          {words.toLocaleString("en-US")} words · {readingTime(words)} min
        </span>
        <button
          type="button"
          onClick={() => onOpen(entry)}
          aria-label={`Read ${entry.title || "entry"}`}
          className="flex cursor-pointer items-center gap-1 text-sage transition-colors hover:text-sage-deep"
        >
          Read
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}

export default function JournalPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState(
    () => new URLSearchParams(location.search).get("mood") || "",
  );
  const [tag, setTag] = useState(
    () => new URLSearchParams(location.search).get("tag") || "",
  );
  const [date, setDate] = useState(
    () => new URLSearchParams(location.search).get("date") || "",
  );
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [tags, setTags] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    () => location.state?.notice || "",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [readerEntry, setReaderEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useDocumentTitle("My Journal");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
      setLoading(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    Promise.all([chronicleApi.getTags(token), chronicleApi.getMoods(token)])
      .then(([tagsData, moodsData]) => {
        if (!active) return;
        setTags(Array.isArray(tagsData) ? tagsData : []);
        setMoods(Array.isArray(moodsData) ? moodsData : []);
      })
      .catch(() => {
        // Collections are supplementary; the archive still works without them.
      });

    return () => {
      active = false;
    };
  }, [token, reloadKey]);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    chronicleApi
      .getChronicles(token, {
        page,
        limit: PAGE_SIZE,
        sort,
        ...(query ? { q: query } : {}),
        ...(mood ? { mood } : {}),
        ...(tag ? { tag } : {}),
        ...(date ? { date } : {}),
      })
      .then((data) => {
        if (!active) return;
        setEntries(data?.chronicles || []);
        setTotal(data?.totalChronicles || 0);
        setTotalPages(data?.totalPages || 0);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError?.message || "Could not load your journal. Please try again.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, page, query, mood, tag, date, sort, reloadKey]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!location.state?.notice) return;

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTag = params.get("tag") || "";
    const currentMood = params.get("mood") || "";
    const currentDate = params.get("date") || "";

    if (
      currentTag === tag &&
      currentMood === mood &&
      currentDate === date
    ) {
      return;
    }

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    if (mood) {
      params.set("mood", mood);
    } else {
      params.delete("mood");
    }

    if (date) {
      params.set("date", date);
    } else {
      params.delete("date");
    }

    const search = params.toString();

    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : "",
      },
      { replace: true },
    );
  }, [tag, mood, date, location.pathname, location.search, navigate]);

  const hasFilters = Boolean(query || mood || tag || date);
  const groups = groupEntries(entries);
  const pageNumbers = getPageNumbers(page, totalPages);
  const moodOptions = [
    { value: "", label: "All moods" },
    ...moods.map((item) => ({
      value: item.mood,
      label: item.mood,
      meta: item.count,
    })),
  ];
  const tagOptions = [
    { value: "", label: "All topics" },
    ...tags.map((item) => ({
      value: item.tag,
      label: `#${item.tag}`,
      meta: item.count,
    })),
  ];

  const clearFilters = () => {
    setSearchInput("");
    setQuery("");
    setMood("");
    setTag("");
    setDate("");
    setPage(1);
    setLoading(true);
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
    setLoading(true);
  };

  const openEditor = () => {
    navigate("/journal/new");
  };

  const handleEdit = (entry) => {
    setReaderEntry(null);
    navigate(`/journal/${entry._id}/edit`);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleDelete = async (entry) => {
    if (!token || deleting) return;

    setDeleting(true);

    try {
      await chronicleApi.deleteEntry(entry._id, token);
      setReaderEntry(null);
      setNotice("Entry removed from your archive.");

      if (entries.length === 1 && page > 1) {
        setPage((value) => value - 1);
      }

      setReloadKey((value) => value + 1);
    } catch (deleteError) {
      setError(deleteError?.message || "Could not delete this entry.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    setExportError("");
    setExportDialogOpen(true);
  };

  const handleExportDownload = async (filters) => {
    if (!token || exporting) return;

    setExporting(true);

    try {
      const blob = await chronicleApi.exportEntries(token, { ...filters, format: "pdf" });
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
    } catch (exportError) {
      setExportError(exportError?.message || "Could not export your PDF.");
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
          activeTag={tag}
          onSelectTag={(nextTag) => {
            setTag(nextTag);
            setPage(1);
            setLoading(true);
          }}
          onClearTag={() => {
            setTag("");
            setPage(1);
            setLoading(true);
          }}
          onNewEntry={openEditor}
          onExport={handleExport}
          onLogout={handleLogout}
          exporting={exporting}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <DashboardTopbar
          user={user}
          title="My Journal"
          onOpenMenu={() => setMobileNavOpen(true)}
          onNewEntry={openEditor}
          onLogout={handleLogout}
        />

        <div className="lg:pl-72">
          <main className="relative min-h-screen overflow-x-clip pt-16">
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
                  <span className="eyebrow mb-3 block">The archive</span>
                  <h1 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                    My Journal
                  </h1>
                  <p className="mt-2 text-[13px] text-charcoal-muted">
                    {loading
                      ? "Gathering your preserved pages..."
                      : `${total.toLocaleString("en-US")} ${
                          total === 1 ? "entry" : "entries"
                        } preserved in your private collection`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openEditor}
                  className="btn-sage self-start !px-5 !py-3 sm:self-auto"
                >
                  <PenLine className="h-4 w-4" />
                  New Entry
                </button>
              </motion.div>

              <div className="mt-7 rounded-2xl border border-hairline bg-paper p-4 shadow-paper sm:p-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search your memories, thoughts, keywords..."
                    className="field-input !py-2.5 !pl-10 !pr-10 !text-[13px]"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-gray transition-colors hover:bg-warm-beige hover:text-charcoal"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect
                      label="Mood"
                      value={mood}
                      options={moodOptions}
                      onChange={changeFilter(setMood)}
                      icon={Smile}
                    />

                    <FilterSelect
                      label="Topic"
                      value={tag}
                      options={tagOptions}
                      onChange={changeFilter(setTag)}
                      icon={Hash}
                    />

                    <FilterDatePicker
                      value={date}
                      onChange={changeFilter(setDate)}
                    />

                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[10px] text-sage transition-colors hover:text-sage-deep"
                      >
                        <X className="h-3 w-3" />
                        Clear filters
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-full border border-hairline bg-warm-beige/60 p-1">
                      <button
                        type="button"
                        onClick={() => setView("grid")}
                        className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                          view === "grid"
                            ? "bg-paper text-sage-deep shadow-sm"
                            : "text-muted-gray hover:text-charcoal"
                        }`}
                        aria-label="Grid view"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("list")}
                        className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                          view === "list"
                            ? "bg-paper text-sage-deep shadow-sm"
                            : "text-muted-gray hover:text-charcoal"
                        }`}
                        aria-label="List view"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <FilterSelect
                      label="Order"
                      value={sort}
                      options={SORT_OPTIONS}
                      onChange={changeFilter(setSort)}
                      icon={ArrowDownUp}
                      align="right"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[12px] text-danger sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setReloadKey((value) => value + 1);
                    }}
                    className="self-start font-medium underline decoration-danger/40 underline-offset-4 sm:self-auto"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="mt-7">
                {loading ? (
                  <div className="space-y-7">
                    {[0, 1].map((group) => (
                      <div key={group}>
                        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-hairline/60" />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {[0, 1].map((card) => (
                            <div
                              key={card}
                              className="h-48 animate-pulse rounded-2xl border border-hairline bg-paper/70"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-paper/60 px-6 py-16 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-sage-subtle text-sage-deep">
                      <SearchX className="h-5 w-5" />
                    </span>
                    <h2 className="mt-5 font-serif text-2xl text-charcoal">
                      {hasFilters
                        ? "No entries match these filters"
                        : "Your journal is waiting"}
                    </h2>
                    <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-charcoal-muted">
                      {hasFilters
                        ? "Try a different mood, topic, or date — or clear the filters to see your whole archive."
                        : "A few quiet lines are enough to begin. Your preserved pages will gather here."}
                    </p>
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn-ghost mt-5 border border-hairline !px-5 !py-2.5 text-[11px]"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openEditor}
                        className="btn-sage mt-5 !px-5 !py-2.5 text-[10px]"
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        Write your first entry
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groups.map((group) => (
                      <section key={group.key}>
                        <div className="mb-4 flex items-center gap-3">
                          <h2 className="font-serif text-xl tracking-tight text-charcoal">
                            {group.month}
                          </h2>
                          <span className="font-serif text-sm italic text-muted-gray">
                            {group.year}
                          </span>
                          <span className="h-px flex-1 bg-hairline" />
                          <span className="text-[9px] uppercase tracking-wider text-muted-gray">
                            {group.entries.length}{" "}
                            {group.entries.length === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                        <div
                          className={
                            view === "grid"
                              ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                              : "grid grid-cols-1 gap-3"
                          }
                        >
                          {group.entries.map((entry) => (
                            <ArchiveEntryCard
                              key={entry._id}
                              entry={entry}
                              view={view}
                              onOpen={setReaderEntry}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              {!loading && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <span className="text-[10px] text-muted-gray">
                    Page {page} of {totalPages} ·{" "}
                    {total.toLocaleString("en-US")} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => {
                        setPage((value) => Math.max(1, value - 1));
                        setLoading(true);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pageNumbers.map((number, index, list) => (
                      <span key={number} className="flex items-center">
                        {index > 0 && number - list[index - 1] > 1 && (
                          <span className="px-1 text-[10px] text-muted-gray">
                            …
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPage(number);
                            setLoading(true);
                          }}
                          className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-[11px] transition-colors ${
                            number === page
                              ? "bg-sage text-white shadow-sm"
                              : "border border-hairline bg-paper text-charcoal-muted hover:text-charcoal"
                          }`}
                          aria-label={`Page ${number}`}
                          aria-current={number === page ? "page" : undefined}
                        >
                          {number}
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => {
                        setPage((value) => Math.min(totalPages, value + 1));
                        setLoading(true);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper text-charcoal-muted transition-colors hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>

        <EntryReader
          key={readerEntry?._id || "closed"}
          entry={readerEntry}
          onClose={() => setReaderEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleting={deleting}
        />

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
