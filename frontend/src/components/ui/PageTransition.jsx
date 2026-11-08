import { motion, useReducedMotion } from "framer-motion";

const easing = [0.16, 1, 0.3, 1];

const transitions = {
  "fade-up": {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  rise: {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
  },
  "slide-left": {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -22 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 22 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.985 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  soft: {
    initial: { opacity: 0, scale: 0.995, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.995, filter: "blur(4px)" },
  },
};

export default function PageTransition({
  children,
  className = "",
  variant = "fade-up",
}) {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : transitions[variant] || transitions["fade-up"];

  return (
    <motion.div
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      transition={{ duration: reduce ? 0.01 : 0.4, ease: easing }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
