import { ArrowUpRight, Feather, PenLine, X } from "lucide-react";
import { useState } from "react";
import {
  countWords,
  formatEntryDate,
  readingTime,
} from "../../lib/journal";
import { stripMarkdown } from "../../lib/markdown";

function EntryCard({ entry, onOpen }) {
  const words = countWords(entry.content);

  return (
    <article className="group flex flex-col rounded-2xl border border-hairline bg-paper p-5 shadow-paper transition-all duration-300 hover:border-sage/40 hover:shadow-paper-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] uppercase tracking-wide2 text-muted-gray">
          {formatEntryDate(entry.date)}
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
        className="mt-4 flex-1 text-left"
      >
        <h3 className="font-serif text-lg leading-snug tracking-tight text-charcoal transition-colors group-hover:text-sage-deep">
          {entry.title || "Untitled entry"}
        </h3>
        <p className="mt-2 line-clamp-3 text-[12px] font-light leading-relaxed text-charcoal-muted">
          {stripMarkdown(entry.content)}
        </p>
      </button>

      {entry.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-muted-gray">
          {entry.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="transition-colors hover:text-charcoal">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-hairline/70 pt-3 text-[10px] text-muted-gray">
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

export default function RecentEntries({
  entries = [],
  totalChronicles = 0,
  loading = false,
  activeTag = "",
  onClearTag,
  onOpenEntry,
  onNewEntry,
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleEntries = showAll ? entries : entries.slice(0, 3);
  const countLabel = activeTag
    ? `${totalChronicles} tagged`
    : `${visibleEntries.length} of ${totalChronicles}`;

  return (
    <section id="recent-entries" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-xl tracking-tight text-charcoal sm:text-2xl">
            Recent entries
          </h2>
          <span className="rounded-full bg-warm-beige px-2.5 py-1 text-[10px] font-medium text-charcoal-muted">
            {loading ? "…" : countLabel}
          </span>
          {activeTag && (
            <button
              type="button"
              onClick={onClearTag}
              className="flex items-center gap-1 rounded-full bg-sage-subtle px-2.5 py-1 text-[10px] font-medium text-sage-deep transition-colors hover:bg-sage-light"
            >
              #{activeTag}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {entries.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="text-[11px] font-medium text-sage transition-colors hover:text-sage-deep"
          >
            {showAll ? "Show fewer" : "View all entries →"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl border border-hairline bg-paper/70"
            />
          ))}
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-paper/60 px-6 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sage-subtle text-sage-deep">
            <Feather className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-serif text-xl text-charcoal">
            {activeTag ? `No entries tagged #${activeTag}` : "Your first page is waiting"}
          </h3>
          <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-charcoal-muted">
            {activeTag
              ? "Choose another collection or clear the filter to return to your recent writing."
              : "A few quiet lines are enough to begin. Your thoughts will gather here as you write."}
          </p>
          {activeTag ? (
            <button
              type="button"
              onClick={onClearTag}
              className="btn-ghost mt-5 border border-hairline !px-5 !py-2.5 text-[11px]"
            >
              Clear filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewEntry}
              className="btn-sage mt-5 !px-5 !py-2.5 text-[10px]"
            >
              <PenLine className="h-3.5 w-3.5" />
              Write your first entry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleEntries.map((entry) => (
            <EntryCard key={entry._id} entry={entry} onOpen={onOpenEntry} />
          ))}
        </div>
      )}
    </section>
  );
}
