import { motion } from "framer-motion";
import { BookOpen, Download, FileJson, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal from "../ui/Reveal";

const formats = [
  { label: "Styled Printable PDF", icon: FileText },
  { label: "Markdown (.md)", icon: FileText },
  { label: "Full JSON Schema", icon: FileJson },
];

export default function Preservation() {
  return (
    <section
      id="export"
      className="border-b border-hairline bg-warm-beige/40 py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal y={14} blur={false}>
              <span className="eyebrow mb-3 block">Lifelong Preservation</span>
            </Reveal>
            <AnimatedText
              as="h2"
              className="mb-6 font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
              parts={[{ text: "Your words belong to you." }, { text: "Forever.", italic: true, className: "text-sage" }]}
            />
            <Reveal delay={0.1} y={16} blur={false}>
              <p className="mb-8 max-w-xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                Never locked inside a proprietary database. At any moment,
                export your complete archive into timeless formats designed to
                outlast platforms, devices, and decades.
              </p>
            </Reveal>

            <RevealGroupFormats />

            <Reveal delay={0.2} y={12} blur={false}>
              <p className="mt-6 text-xs font-light leading-relaxed text-muted-gray">
                Compatible with Obsidian, Apple Books, bound print runs, and
                offline hard drives.
              </p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-6" y={38} amount={0.15}>
            <motion.div
              whileHover={{ rotateY: -2.5, rotateX: 1.2, y: -5 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="relative border border-hairline bg-paper p-7 shadow-paper sm:p-10 lg:p-12"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4 text-[10px] uppercase tracking-widest text-muted-gray">
                <span>Typeset Edition — Volume 2025</span>
                <span>A5 Book Spread</span>
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
                    Page 42
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
                    Page 43
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-4 text-[11px]">
                <span className="text-muted-gray">
                  Complete 52 entries compiled
                </span>
                <Link
                  to="/auth"
                  className="group flex items-center gap-1.5 font-medium text-charcoal transition-colors hover:text-sage"
                >
                  <span>Download sample</span>
                  <Download className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RevealGroupFormats() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {formats.map((format, index) => {
        const Icon = format.icon;
        return (
          <Reveal key={format.label} delay={0.12 + index * 0.08} y={10} blur={false}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper/80 px-4 py-2 text-xs text-charcoal-muted">
              <Icon className="h-3.5 w-3.5 text-sage" />
              {format.label}
            </span>
          </Reveal>
        );
      })}
    </div>
  );
}
