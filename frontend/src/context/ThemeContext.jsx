import { useCallback, useEffect, useState } from "react";
import ThemeContext from "./themeContextStore";

const STORAGE_KEY = "chronicle-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  const dark = theme === "dark";

  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";

  const meta = document.getElementById("theme-color-meta");
  if (meta) {
    meta.setAttribute("content", dark ? "#161615" : "#F8F7F3");
  }
}

function readStoredTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const stored = readStoredTheme();
  if (stored === "dark" || stored === "light") return stored;

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private browsing modes.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
