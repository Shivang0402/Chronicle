import { useEffect, useRef, useState } from "react";

const thresholdFor = (amount) => {
  if (amount === "all") return 1;
  if (amount === "some") return 0;
  return amount;
};

export default function useInViewOnce({
  once = true,
  amount = 0.15,
  margin = "0px 0px -10% 0px",
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: thresholdFor(amount), rootMargin: margin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, margin, once]);

  return [ref, inView];
}
