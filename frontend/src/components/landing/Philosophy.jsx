import { motion } from "framer-motion";
import AnimatedText from "../ui/AnimatedText";
import CountUp from "../ui/CountUp";
import Reveal, { RevealGroup, RevealItem } from "../ui/Reveal";

const principles = [
  { value: 100, suffix: "%", label: "Private Sanctuary", animate: true },
  { value: 0, suffix: "", label: "Likes, Feeds, or Noise", animate: false },
  { value: "∞", suffix: "", label: "Time to Think", animate: false },
];

export default function Philosophy() {
  return (
    <section
      id="experience"
      className="border-b border-hairline py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal
            className="order-2 lg:order-1 lg:col-span-5"
            y={36}
            amount={0.15}
          >
            <div className="group overflow-hidden bg-hairline">
              <motion.img
                src="/images/philosophy-journal.jpg"
                alt="A quiet desk with an open blank journal beside a sunny window"
                className="aspect-[4/5] w-full object-cover"
                initial={{ scale: 1.09 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                loading="lazy"
              />
            </div>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-gray">
              Solitude at the study window. A blank page welcomes thoughts
              without judgement.
            </p>
          </Reveal>

          <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-7 lg:pl-6">
            <Reveal y={16} blur={false}>
              <span className="eyebrow mb-8 block">The Philosophy</span>
            </Reveal>

            <AnimatedText
              as="blockquote"
              className="mb-10 font-serif text-3xl leading-[1.18] tracking-tight text-charcoal sm:text-4xl lg:text-[50px]"
              parts={[
                {
                  text: "“Not everything needs to be shared. Some things are",
                },
                { text: "simply", italic: true, className: "text-sage" },
                { text: "worth remembering.”" },
              ]}
            />

            <RevealGroup className="max-w-xl space-y-6" delay={0.1}>
              <RevealItem>
                <p className="text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                  We live surrounded by streams of instant reaction, performance
                  metrics, and public eyes. Chronicle is a deliberate
                  antithesis: an unhurried, quiet harbor for private reflection.
                </p>
              </RevealItem>
              <RevealItem>
                <p className="text-base font-light leading-relaxed text-charcoal-muted sm:text-lg">
                  Some thoughts are fleeting. Some experiences stay with us.
                  Chronicle is a personal space to capture them, return to them,
                  and make sense of your own journey at your own rhythm.
                </p>
              </RevealItem>
            </RevealGroup>

            <RevealGroup
              className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6 border-t border-hairline pt-8"
              delay={0.2}
            >
              {principles.map((item, index) => (
                <RevealItem key={item.label} className="flex items-center gap-8">
                  {index > 0 && (
                    <span className="hidden h-10 w-px bg-hairline sm:block" />
                  )}
                  <div>
                    <span className="block font-serif text-2xl text-charcoal">
                      {item.animate ? (
                        <CountUp value={item.value} suffix={item.suffix} />
                      ) : (
                        <>
                          {item.value}
                          {item.suffix}
                        </>
                      )}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-gray">
                      {item.label}
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
