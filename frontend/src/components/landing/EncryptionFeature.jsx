import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedText from "../ui/AnimatedText";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const protections = [
  {
    icon: LockKeyhole,
    title: "Encrypted before it leaves",
    body: "Your entry text, title, mood, and tags are encrypted in your browser before they are saved.",
  },
  {
    icon: EyeOff,
    title: "Your keys stay with you",
    body: "Your encryption passphrase is never sent to Chronicle. Only you can unlock your journal on a device.",
  },
  {
    icon: KeyRound,
    title: "A recovery key you control",
    body: "Keep a separate Recovery Key somewhere safe in case you forget your passphrase. It is shown only when created.",
  },
];

export default function EncryptionFeature() {
  const reduce = useReducedMotion();

  return (
    <section id="privacy" className="relative overflow-hidden bg-warm-beige/40 py-14 sm:py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-sage-light/25 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal variant="left" y={18} blur={false}>
              <span className="eyebrow mb-4 inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" />
                Private from the first line
              </span>
            </Reveal>
            <AnimatedText
              as="h2"
              mode="drop"
              once={false}
              delay={0.08}
              className="max-w-xl font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-5xl"
              lines={[
                [{ text: "Your thoughts" }],
                [{ text: "are yours to keep.", italic: true, className: "text-sage-deep" }],
              ]}
            />
            <Reveal variant="left" delay={0.18} y={16} blur={false}>
              <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                Chronicle uses end-to-end encryption to protect new journal entries. They are encrypted on your device before saving, and decrypted in your browser when you return.
              </p>
              <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-muted-gray">
                Entry dates remain visible so your journal can be ordered. Older entries are not automatically migrated.
              </p>
            </Reveal>

            <Reveal variant="fade" delay={0.26} y={10} blur={false}>
              <Link to="/auth?mode=register" className="btn-primary group mt-7">
                <span>Start a private journal</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal variant="scale" y={16} blur={false}>
              <div className="relative overflow-hidden rounded-3xl border border-hairline bg-paper p-5 shadow-paper-lg sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide2 text-muted-gray">Your writing, protected</p>
                    <p className="mt-1 font-serif text-lg text-charcoal">Private by design</p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-subtle text-sage-deep">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                </div>

                <div className="my-5 hidden grid-cols-[1fr_auto_1fr] items-center gap-2 sm:grid sm:gap-4">
                  <div className="rounded-2xl border border-sage/20 bg-sage-subtle/50 p-3 text-center sm:p-4">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-paper text-sage-deep shadow-sm"><KeyRound className="h-4 w-4" /></span>
                    <p className="mt-2 text-[10px] font-medium text-charcoal">Your browser</p>
                    <p className="mt-1 text-[9px] leading-relaxed text-muted-gray">Encrypts &amp; decrypts</p>
                  </div>
                  <motion.div
                    aria-hidden="true"
                    animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-1 text-sage-deep"
                  >
                    <span className="h-px w-7 bg-sage sm:w-12" />
                    <span className="text-[8px] uppercase tracking-wider">ciphertext</span>
                    <span className="h-px w-7 bg-sage sm:w-12" />
                  </motion.div>
                  <div className="rounded-2xl border border-hairline bg-ivory/80 p-3 text-center sm:p-4">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-paper text-charcoal-muted shadow-sm"><LockKeyhole className="h-4 w-4" /></span>
                    <p className="mt-2 text-[10px] font-medium text-charcoal">Chronicle storage</p>
                    <p className="mt-1 text-[9px] leading-relaxed text-muted-gray">Keeps encrypted entries</p>
                  </div>
                </div>

                <div className="my-4 flex items-center gap-2 rounded-xl border border-sage/20 bg-sage-subtle/40 px-3 py-2 text-[10px] text-charcoal-muted sm:hidden">
                  <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
                  <span>Encrypted in your browser <span className="mx-1 text-sage-deep">→</span> stored as ciphertext</span>
                </div>

                <div className="rounded-2xl border border-hairline bg-ivory/60 px-4 py-3">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-gray">
                    <span>Encryption</span><span>AES-256-GCM</span>
                  </div>
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {Array.from({ length: 28 }, (_, index) => (
                      <span key={index} className={`h-1.5 flex-1 rounded-full ${index % 5 === 0 ? "bg-sage/45" : "bg-sage-deep/15"}`} />
                    ))}
                  </div>
                </div>

                <RevealGroup className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3" delay={0.12} stagger={0.07}>
                  {protections.map(({ icon: Icon, title, body }) => (
                    <RevealItem key={title} variant="up" y={10}>
                      <article className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-3 sm:h-full sm:block sm:rounded-2xl sm:p-3.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
                        <div>
                          <h3 className="font-serif text-[13px] leading-snug text-charcoal sm:mt-2">{title}</h3>
                          <p className="mt-1 text-[10px] leading-relaxed text-charcoal-muted sm:mt-1.5 sm:text-[9px]">{body}</p>
                        </div>
                      </article>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
