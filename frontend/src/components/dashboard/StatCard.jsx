import { motion } from "framer-motion";
import CountUp from "../ui/CountUp";

export default function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  footerLabel,
  footerValue,
  isText = false,
  loading = false,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between rounded-2xl border border-hairline bg-paper p-5 shadow-paper transition-shadow duration-300 hover:border-sage/30 hover:shadow-paper-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-medium uppercase tracking-wide2 text-muted-gray">
          {label}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warm-beige text-sage-deep">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="my-4 min-h-[2.25rem] font-serif text-2xl leading-none tracking-tight text-charcoal sm:text-3xl">
        {loading ? (
          <span className="inline-block h-7 w-16 animate-pulse rounded bg-hairline/70" />
        ) : isText ? (
          <span className="text-xl sm:text-2xl">{value || "—"}</span>
        ) : (
          <>
            <CountUp value={Number(value) || 0} duration={1.2} />
            <span className="text-sm text-muted-gray">{suffix}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-hairline/70 pt-3 text-[10px] text-muted-gray">
        <span>{footerLabel}</span>
        <span className="truncate text-right font-medium text-charcoal-muted">
          {loading ? "—" : footerValue}
        </span>
      </div>
    </motion.div>
  );
}
