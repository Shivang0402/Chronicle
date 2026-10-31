import { motion } from "framer-motion";
import { CalendarDays, Check, Feather, Lock } from "lucide-react";
import { useState } from "react";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

const moods = ["Peaceful", "Grateful", "Inspired", "Contemplative"];
const tags = ["#Reflections", "#MorningThoughts", "#TeaRitual"];

export default function WritingCanvas() {
  const [mood, setMood] = useState("Peaceful");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <section
      id="editor"
      className="border-b border-hairline bg-ivory py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-14 max-w-3xl md:mb-16">
          <Reveal y={14} blur={false}>
            <span className="eyebrow mb-3 block">The Writing Canvas</span>
          </Reveal>
          <AnimatedText
            as="h2"
            className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
            parts={[{ text: "Give your thoughts room to unfold." }]}
          />
          <Reveal delay={0.1} y={16} blur={false}>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              A distraction-free folio that honors the intimacy of pen and
              paper, quietly elevated for the modern thinker.
            </p>
          </Reveal>
        </div>

        <Reveal y={44} amount={0.12}>
          <div className="mx-auto max-w-4xl border border-hairline bg-paper p-6 shadow-paper sm:p-10 lg:p-16">
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-hairline pb-7 text-[11px]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="uppercase tracking-wider text-muted-gray">
                  Sunday, October 24
                </span>
                <span className="hidden h-3 w-px bg-hairline sm:block" />
                <span className="font-light text-charcoal-muted">
                  Late Afternoon
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="uppercase tracking-widest text-[10px] text-muted-gray">
                  Mood
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-sage-subtle px-3 py-1.5 text-[11px] font-medium text-charcoal">
                  <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sage" />
                  {mood}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-hairline py-5">
              {moods.map((item) => (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => setMood(item)}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] transition-all duration-300 ${
                    mood === item
                      ? "bg-sage text-white shadow-sm"
                      : "bg-warm-beige/70 text-charcoal-muted hover:bg-sage-light/60 hover:text-charcoal"
                  }`}
                >
                  {item}
                </motion.button>
              ))}
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-gray">
                <CalendarDays className="h-3.5 w-3.5" />
                Oct 24, 2025
              </span>
            </div>

            <div className="px-1 pb-10 pt-10 sm:px-4 lg:px-10">
              <h3 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
                The quiet architecture of morning
              </h3>

              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-gray">
                {tags.map((tag, index) => (
                  <span key={tag} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="h-0.5 w-0.5 rounded-full bg-muted-gray/60" />
                    )}
                    <span className="transition-colors hover:text-charcoal">
                      {tag}
                    </span>
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-6 text-base font-light leading-[1.85] text-charcoal sm:text-lg">
                <p>
                  There is an unmistakable fragrance that autumn brings when the
                  rain finally ceases. The windowpane is still dotted with dew,
                  catching the faint amber glow of the morning sun.
                </p>
                <p>
                  I used to mistake stillness for inactivity. Now I recognize it
                  as the fertile ground where thoughts take root. Writing today
                  feels less like recording facts and more like tuning an
                  instrument
                  <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.18em] animate-caret bg-sage" />
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-5 border-t border-hairline pt-7 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-gray">
                <span className="font-medium text-charcoal">670 words</span>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-gray" />
                <span>4 min read</span>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-gray" />
                <span className="flex items-center gap-1.5 italic">
                  <Lock className="h-3 w-3 text-sage" />
                  {saved ? "Saved to your private vault" : "Unpublished draft"}
                </span>
              </div>

              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                <button
                  type="button"
                  className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-gray transition-colors hover:text-charcoal"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-medium uppercase tracking-widest text-ivory transition-all duration-500 ${
                    saved
                      ? "bg-sage"
                      : "bg-charcoal hover:bg-sage-deep hover:shadow-paper"
                  }`}
                >
                  {saved ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Feather className="h-3.5 w-3.5" />
                  )}
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
