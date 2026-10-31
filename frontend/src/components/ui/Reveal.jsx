import { motion, useReducedMotion } from "framer-motion";
import useInViewOnce from "../../hooks/useInViewOnce";

const easing = [0.16, 1, 0.3, 1];

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
  once = true,
  amount = 0.15,
  blur = true,
  as = "div",
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const Component = motion[as] || motion.div;
  const hidden = {
    opacity: 0,
    y: reduce ? 0 : y,
    filter: blur && !reduce ? "blur(6px)" : "blur(0px)",
  };
  const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
  const show = reduce || inView;

  return (
    <Component
      ref={ref}
      className={className}
      initial={hidden}
      animate={show ? visible : hidden}
      transition={{
        duration: reduce ? 0.01 : 0.8,
        delay: reduce ? 0 : delay,
        ease: easing,
      }}
    >
      {children}
    </Component>
  );
}

export function RevealGroup({
  children,
  className = "",
  delay = 0,
  stagger = 0.12,
  once = true,
  amount = 0.15,
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const show = reduce || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "", y = 18 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: reduce ? 0 : y,
          filter: reduce ? "blur(0px)" : "blur(5px)",
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: reduce ? 0.01 : 0.8, ease: easing },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealImage({
  children,
  className = "",
  delay = 0,
  y = 16,
  once = true,
  amount = 0.15,
  duration = 0.9,
  onMount = false,
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const show = onMount || reduce || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: reduce
          ? { opacity: 0 }
          : { opacity: 0, y, clipPath: "inset(0 0 100% 0)" },
        visible: reduce
          ? { opacity: 1, transition: { duration: 0.01, ease: "easeOut" } }
          : {
              opacity: 1,
              y: 0,
              clipPath: "inset(-20% -20% -20% -20%)",
              transition: { duration, delay, ease: easing },
            },
      }}
    >
      {children}
    </motion.div>
  );
}
