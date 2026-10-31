import { motion } from "framer-motion";
import AnimatedText from "../ui/AnimatedText";
import CountUp from "../ui/CountUp";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const cadence = [
  0, 1, 2, 3, 2, 3, 2, 1, 3, 2, 3, 3,
  1, 3, 3, 0, 2, 3, 3, 2, 3, 3, 2, 3,
  2, 0, 2, 3, 2, 3, 3, 2, 0, 3, 3, 3,
];

const moods = [
  { label: "Peaceful", value: 38, color: "bg-sage" },
  { label: "Grateful", value: 27, color: "bg-charcoal" },
  { label: "Inspired", value: 17, color: "bg-sage-light" },
  { label: "Contemplative", value: 12, color: "bg-muted-gray" },
];

const cellTones = {
  0: "bg-hairline/80",
  1: "bg-sage/35",
  2: "bg-sage/65",
  3: "bg-sage",
};

export default function Insights() {
  return (
    <section id="insights" className="border-b border-hairline py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-2xl md:mb-20">
          <Reveal y={14} blur={false}>
            <span className="eyebrow mb-3 block">Quiet Resonance</span>
          </Reveal>
          <AnimatedText
            as="h2"
            className="font-serif text-3xl tracking-tight text-charcoal sm:text-5xl"
            parts={[{ text: "Notice the patterns in your pages." }]}
          />
          <Reveal delay={0.1} y={16} blur={false}>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
              Honest reflection over gamification. Subtle cadences and
              reflective states uncovered naturally over time.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          className="grid grid-cols-1 gap-12 border-b border-hairline pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-16"
          stagger={0.12}
        >
          <RevealItem className="lg:col-span-4">
            <span className="block font-serif text-6xl leading-none text-charcoal sm:text-7xl lg:text-8xl">
              <CountUp value={52} />
            </span>
            <span className="mt-3 block font-serif text-sm italic text-charcoal">
              Entries preserved this year
            </span>
            <p className="mt-2 max-w-xs text-xs font-light leading-relaxed text-muted-gray">
              A consistent weekly cadence across autumn and winter.
            </p>
          </RevealItem>

          <RevealItem className="lg:col-span-4">
            <span className="block font-serif text-6xl leading-none text-charcoal sm:text-7xl lg:text-8xl">
              <CountUp value={34820} />
            </span>
            <span className="mt-3 block font-serif text-sm italic text-charcoal">
              Words written in private
            </span>
            <p className="mt-2 max-w-xs text-xs font-light leading-relaxed text-muted-gray">
              Roughly the equivalent of a 130-page personal memoir.
            </p>
          </RevealItem>

          <RevealItem className="flex flex-col justify-end lg:col-span-4">
            <span className="block font-serif text-4xl leading-none text-charcoal sm:text-5xl">
              <CountUp value={670} />{" "}
              <span className="font-sans text-xl font-light text-muted-gray">
                words / avg
              </span>
            </span>
            <span className="mt-3 block font-serif text-sm italic text-charcoal">
              Deliberate reflective depth
            </span>
            <p className="mt-2 max-w-xs text-xs font-light leading-relaxed text-muted-gray">
              Never rushed. An intentional space to find clarity.
            </p>
          </RevealItem>
        </RevealGroup>

        <div className="grid grid-cols-1 gap-14 pt-16 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7" y={30} amount={0.2}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-wide2 text-muted-gray">
                12-Week Writing Rhythm
              </span>
              <span className="flex items-center gap-2 text-[11px] font-medium text-sage">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sage" />
                88% active reflective days
              </span>
            </div>

            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
              {cadence.map((level, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.012,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`h-3 rounded-[2px] sm:h-3.5 ${cellTones[level]}`}
                  title={`Week ${index + 1}: ${level} entries`}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-gray">
              <span>Less frequent</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-hairline" />
                <span className="h-2.5 w-2.5 rounded-sm bg-sage/35" />
                <span className="h-2.5 w-2.5 rounded-sm bg-sage/65" />
                <span className="h-2.5 w-2.5 rounded-sm bg-sage" />
              </div>
              <span>More frequent</span>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" y={30} delay={0.12} amount={0.2}>
            <span className="mb-6 block text-[11px] uppercase tracking-wide2 text-muted-gray">
              Reflective States
            </span>
            <div className="space-y-5">
              {moods.map((mood, index) => (
                <div key={mood.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-charcoal">
                    <span>{mood.label}</span>
                    <span className="text-muted-gray">{mood.value}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
                    <motion.div
                      className={`h-full rounded-full ${mood.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${mood.value}%` }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{
                        duration: 1.2,
                        delay: 0.2 + index * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 border-t border-hairline pt-5 font-serif text-sm italic leading-relaxed text-charcoal-muted">
              “Peaceful is not the absence of feeling. It is the room you make
              for it.”
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
