import { AnimatePresence, motion } from "framer-motion";
import { PenLine, Quote, RefreshCw } from "lucide-react";
import { useState } from "react";

const prompts = [
  "Every day leaves a story worth remembering. What made today memorable?",
  "Which quiet gesture or conversation brought you comfort in the last 24 hours?",
  "What did you notice today that you might have rushed past last year?",
  "Describe a tactile sensation from today — cool air, warm ceramic, or linen texture.",
  "If you could preserve one fleeting thought from today for your future self, what is it?",
];

export default function DailyPrompt({ onReflect }) {
  const [index, setIndex] = useState(0);

  const nextPrompt = () => {
    setIndex((value) => (value + 1) % prompts.length);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-hairline bg-warm-beige/70 p-6 shadow-paper sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sage-light/40 blur-3xl" />
      <div className="relative flex flex-col items-center text-center">
        <span className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-wide2 text-sage-deep">
          <Quote className="h-3 w-3" />
          A prompt for today
        </span>

        <div className="mt-4 min-h-[72px] max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-lg italic leading-relaxed text-charcoal sm:text-xl"
            >
              “{prompts[index]}”
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onReflect(prompts[index])}
            className="btn-sage !px-5 !py-2.5 text-[10px]"
          >
            <PenLine className="h-3.5 w-3.5" />
            Reflect on this
          </button>
          <button
            type="button"
            onClick={nextPrompt}
            className="inline-flex items-center gap-1.5 text-[11px] text-charcoal-muted transition-colors hover:text-charcoal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Another prompt
          </button>
        </div>
      </div>
    </section>
  );
}
