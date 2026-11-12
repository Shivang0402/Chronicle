import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToPosition = (top) => {
  window.scrollTo({ top, left: 0, behavior: "instant" });
};

const scrollToElement = (id) => {
  const target = document.getElementById(id);
  if (!target) return false;

  const scrollMarginTop = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
  scrollToPosition(top);
  return true;
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const id = decodeURIComponent(href.slice(1));

      event.preventDefault();
      window.requestAnimationFrame(() => {
        if (scrollToElement(id) && window.location.hash !== href) {
          window.history.pushState(null, "", href);
        }
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!hash) {
      scrollToPosition(0);
      return undefined;
    }

    const id = decodeURIComponent(hash.replace("#", ""));
    let frame = 0;
    let cancelled = false;

    const scrollToTarget = () => {
      if (!cancelled) scrollToElement(id);
    };

    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(scrollToTarget);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);

  return null;
}
