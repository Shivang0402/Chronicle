import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  FileJson,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal, {
  RevealGroup,
  RevealImage,
  RevealItem,
} from "../ui/Reveal";

const formats = [
  { label: "PDF (.pdf)", icon: FileText },
  { label: "Markdown (.md)", icon: FileText },
  { label: "JSON (.json)", icon: FileJson },
];

export default function Preservation() {
  return (
    <section
      id="export"
      className="scroll-mt-24 bg-warm-beige/40 py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal y={14} blur={false}>
              <span className="eyebrow mb-3 block">Lifelong Preservation</span>
            </Reveal>
            <AnimatedText
              as="h2"
              delay={0.1}
              lineStagger={0.16}
              className="mb-6 font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
              lines={[
                [{ text: "Your words belong to you." }],
                [
                  {
                    text: "Take them with you.",
                    italic: true,
                    className: "text-sage",
                  },
                ],
              ]}
            />
            <Reveal delay={0.24} y={16} blur={false}>
              <p className="mb-8 max-w-xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                Export your complete archive at any time. Choose PDF for
                reading, Markdown for writing tools, or JSON for your own
                records.
              </p>
            </Reveal>

            <RevealGroupFormats />

            <Reveal delay={0.55} y={12} blur={false}>
              <p className="mt-6 text-xs font-light leading-relaxed text-muted-gray">
                Markdown opens in tools like Obsidian. PDF and JSON files stay
                yours to keep offline.
              </p>
            </Reveal>
          </div>

          <RevealImage
            className="lg:col-span-6"
            y={20}
            delay={0.22}
            amount={0.15}
          >
            <motion.div
              whileHover={{ rotateY: -2.5, rotateX: 1.2, y: -5 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="relative border border-hairline bg-paper p-7 shadow-paper sm:p-10 lg:p-12"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4 text-[10px] uppercase tracking-widest text-muted-gray">
                <span>PDF Export — Sample Volume</span>
                <span>A4 Document</span>
              </div>

              <div className="grid grid-cols-2 gap-6 py-9 text-charcoal sm:gap-8 sm:py-10">
                <div className="space-y-3 border-r border-hairline pr-5 text-[11px] font-light leading-relaxed sm:pr-6">
                  <span className="block font-serif text-sm italic">
                    Chapter IV: Autumn Rhythms
                  </span>
                  <p className="text-charcoal-muted">
                    The tea steeped quietly as thoughts began to settle. There
                    is a deep, quiet gratitude found in this unhurried space...
                  </p>
                  <span className="block pt-4 text-[10px] text-muted-gray">
                    Sample page 42
                  </span>
                </div>
                <div className="space-y-3 text-[11px] font-light leading-relaxed">
                  <span className="block font-serif text-sm italic">
                    October 22, 2025
                  </span>
                  <p className="text-charcoal-muted">
                    Walked down by the river canal right as dusk began falling.
                    The maple leaves are turning deep burnt ochre...
                  </p>
                  <span className="block pt-4 text-[10px] text-muted-gray">
                    Sample page 43
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-4 text-[11px]">
                <span className="text-muted-gray">
                  Sample preview of a complete archive
                </span>
                <Link
                  to="/auth?mode=register"
                  className="group flex items-center gap-1.5 font-medium text-charcoal transition-colors hover:text-sage"
                >
                  <span>Start your archive</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <motion.div
                aria-hidden="true"
                className="absolute -right-4 -top-4 hidden h-12 w-12 place-items-center rounded-full border border-hairline bg-ivory text-sage shadow-sm sm:grid"
                animate={{ rotate: [0, 6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </RevealImage>
        </div>
      </div>
    </section>
  );
}

function RevealGroupFormats() {
  return (
    <RevealGroup
      className="flex flex-wrap items-center gap-3"
      delay={0.36}
      stagger={0.1}
    >
      {formats.map((format) => {
        const Icon = format.icon;
        return (
          <RevealItem key={format.label} y={8}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/80 px-4 py-2 text-xs text-charcoal-muted">
              <Icon className="h-3.5 w-3.5 text-sage" />
              {format.label}
            </span>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
