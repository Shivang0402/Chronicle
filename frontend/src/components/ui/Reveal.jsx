import { motion, useReducedMotion } from "framer-motion";
import useInViewOnce from "../../hooks/useInViewOnce";

const easing = [0.16, 1, 0.3, 1];

const buildHidden = ({ variant, reduce, y, x, blur }) => {
  if (reduce) return { opacity: 0 };

  const distance = x ?? y;

  switch (variant) {
    case "down":
      return { opacity: 0, y: -y };
    case "left":
      return { opacity: 0, x: -distance };
    case "right":
      return { opacity: 0, x: distance };
    case "scale":
      return { opacity: 0, scale: 0.94 };
    case "blur":
      return { opacity: 0, filter: "blur(10px)" };
    case "fade":
      return { opacity: 0 };
    case "rotate":
      return { opacity: 0, y: y * 0.5, rotate: -1.2 };
    default:
      return {
        opacity: 0,
        y,
        ...(blur ? { filter: "blur(6px)" } : {}),
      };
  }
};

const visibleState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  filter: "blur(0px)",
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
  x,
  variant = "up",
  duration = 0.8,
  once = false,
  amount = 0.15,
  blur = true,
  as = "div",
  nodeRef,
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const Component = motion[as] || motion.div;
  const hidden = buildHidden({ variant, reduce, y, x, blur });
  const show = reduce || inView;

  const setRef = (node) => {
    ref.current = node;
    if (nodeRef) nodeRef.current = node;
  };

  return (
    <Component
      ref={setRef}
      className={className}
      initial={hidden}
      animate={show ? visibleState : hidden}
      transition={{
        duration: reduce ? 0.01 : duration,
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
  once = false,
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

export function RevealItem({
  children,
  className = "",
  y = 18,
  x,
  variant = "up",
  duration = 0.8,
}) {
  const reduce = useReducedMotion();
  const hidden = buildHidden({ variant, reduce, y, x, blur: true });

  return (
    <motion.div
      className={className}
      variants={{
        hidden,
        visible: {
          ...visibleState,
          transition: { duration: reduce ? 0.01 : duration, ease: easing },
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
  x = 36,
  variant = "clip-up",
  once = false,
  amount = 0.15,
  duration = 0.9,
  onMount = false,
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce({ once, amount });
  const show = onMount || reduce || inView;

  const hidden = (() => {
    if (reduce) return { opacity: 0 };

    switch (variant) {
      case "clip-left":
        return { opacity: 0, x: -x, clipPath: "inset(0 100% 0 0)" };
      case "clip-right":
        return { opacity: 0, x, clipPath: "inset(0 0 0 100%)" };
      case "left":
        return { opacity: 0, x: -x };
      case "right":
        return { opacity: 0, x };
      case "scale":
        return { opacity: 0, scale: 0.93 };
      case "fade":
        return { opacity: 0 };
      default:
        return { opacity: 0, y, clipPath: "inset(0 0 100% 0)" };
    }
  })();

  const visible = reduce
    ? { opacity: 1, transition: { duration: 0.01, ease: "easeOut" } }
    : {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clipPath: "inset(-20% -20% -20% -20%)",
        transition: { duration, delay, ease: easing },
      };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{ hidden, visible }}
    >
      {children}
    </motion.div>
  );
}
