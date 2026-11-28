import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const easing = [0.16, 1, 0.3, 1];

export default function EncryptionFeature() {
  const reduce = Boolean(useReducedMotion());

  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 22, filter: reduce ? "blur(0px)" : "blur(4px)" },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.01 : 0.7, delay: reduce ? 0 : delay, ease: easing },
    }),
  };

  const seal = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.86, y: reduce ? 0 : 14 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 180, damping: 18, delay: 1.15 },
    },
  };

  const ring = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.78 },
    visible: {
      opacity: 0.65,
      scale: 1,
      transition: { duration: reduce ? 0.01 : 1.1, delay: reduce ? 0 : 1.25, ease: easing },
    },
  };

  const sealLabel = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.65, delay: reduce ? 0 : 1.4, ease: easing },
    },
  };

  return (
    <section id="privacy" className="relative scroll-mt-24 overflow-hidden bg-warm-beige/40 py-20 sm:py-28 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 paper-texture opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-4 h-80 w-80 rounded-full bg-sage-light/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sage-subtle/45 blur-3xl" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        className="relative mx-auto max-w-5xl px-6 text-center sm:px-10 lg:px-16"
      >
        <motion.div variants={rise} custom={0.04} className="flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-sage/60 sm:w-12" />
          <span className="eyebrow inline-flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
            A private journal, by design
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-sage/60 sm:w-12" />
        </motion.div>

        <motion.h2 variants={rise} custom={0.16} className="mx-auto mt-8 max-w-4xl font-serif text-[38px] leading-[1.08] tracking-tight text-charcoal sm:text-6xl lg:text-[72px]">
          <span className="block">Your words are</span>
          <span className="block italic text-sage-deep">yours alone.</span>
        </motion.h2>

        <motion.p variants={rise} custom={0.4} className="mx-auto mt-7 max-w-2xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
          Every new entry is encrypted on your device before it&apos;s saved. Only you can unlock it again.
        </motion.p>

        <div
          role="img"
          aria-label="Your entry is written by you, protected end-to-end, and read only by you"
          className="mt-11 flex flex-col items-center sm:mt-14"
        >
          <div className="flex w-full items-center justify-center gap-3 sm:gap-5">
            <motion.div variants={rise} custom={0.85} className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-wide2 text-muted-gray sm:text-[10px]">
              <span aria-hidden="true" className="h-px w-6 bg-sage/30 sm:w-10" />
              Written by you
            </motion.div>

            <motion.div variants={seal} className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-subtle/60 text-sage-deep sm:h-16 sm:w-16">
              <motion.span aria-hidden="true" variants={ring} className="absolute inset-0 rounded-full border border-sage/40" />
              <motion.span aria-hidden="true" variants={ring} className="absolute inset-1.5 rounded-full border border-sage/20" />
              <LockKeyhole aria-hidden="true" className="relative h-5 w-5" strokeWidth={1.4} />
            </motion.div>

            <motion.div variants={rise} custom={0.85} className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-wide2 text-muted-gray sm:text-[10px]">
              Read by you
              <span aria-hidden="true" className="h-px w-6 bg-sage/30 sm:w-10" />
            </motion.div>
          </div>

          <motion.div variants={sealLabel} className="mt-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-wide2 text-sage-deep sm:mt-6 sm:text-[11px]">
            <span aria-hidden="true" className="h-px w-8 bg-sage/40" />
            End-to-end encrypted
            <span aria-hidden="true" className="h-px w-8 bg-sage/40" />
          </motion.div>
        </div>

        <motion.p variants={rise} custom={1.6} className="mx-auto mt-4 max-w-md font-serif text-sm italic leading-relaxed text-charcoal-muted sm:text-base">
          A quiet seal around every entry.
        </motion.p>

        <motion.div variants={rise} custom={1.85} className="mt-10 flex justify-center sm:mt-12">
          <Link to="/auth?mode=register" className="btn-primary group">
            <span>Start writing privately</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
