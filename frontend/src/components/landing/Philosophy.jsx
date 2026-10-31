import AnimatedText from "../ui/AnimatedText";
import CountUp from "../ui/CountUp";
import Reveal, {
  RevealGroup,
  RevealImage,
  RevealItem,
} from "../ui/Reveal";

const principles = [
  { value: 3, suffix: "", label: "Export Formats", animate: true },
  { value: 0, suffix: "", label: "Social Feeds", animate: false },
  { value: "∞", suffix: "", label: "Time to Reflect", animate: false },
];

export default function Philosophy() {
  return (
    <section id="experience" className="scroll-mt-24 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <RevealImage y={18} amount={0.15} delay={0.05}>
              <div className="group overflow-hidden bg-hairline">
                <img
                  src="/images/philosophy-journal.jpg"
                  alt="A quiet desk with an open blank journal beside a sunny window"
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </RevealImage>
            <Reveal delay={0.28} y={10} blur={false}>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-gray">
                Solitude at the study window. A blank page welcomes thoughts
                without judgement.
              </p>
            </Reveal>
          </div>

          <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-7 lg:pl-6">
            <Reveal y={14} blur={false}>
              <span className="eyebrow mb-8 block">The Philosophy</span>
            </Reveal>

            <AnimatedText
              as="blockquote"
              delay={0.12}
              lineStagger={0.16}
              className="mb-10 font-serif text-3xl leading-[1.18] tracking-tight text-charcoal sm:text-4xl lg:text-[50px]"
              lines={[
                [{ text: "“Not everything needs to be shared." }],
                [
                  { text: "Some things are" },
                  { text: "simply", italic: true, className: "text-sage" },
                  { text: "worth remembering.”" },
                ],
              ]}
            />

            <RevealGroup className="max-w-xl space-y-6" delay={0.3}>
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
              delay={0.45}
              stagger={0.1}
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
