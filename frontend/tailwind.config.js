/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "rgb(var(--color-ivory) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        charcoal: "rgb(var(--color-charcoal) / <alpha-value>)",
        "charcoal-muted":
          "rgb(var(--color-charcoal-muted) / <alpha-value>)",
        sage: {
          DEFAULT: "rgb(var(--color-sage) / <alpha-value>)",
          dark: "rgb(var(--color-sage-dark) / <alpha-value>)",
          light: "rgb(var(--color-sage-light) / <alpha-value>)",
          subtle: "rgb(var(--color-sage-subtle) / <alpha-value>)",
          deep: "rgb(var(--color-sage-deep) / <alpha-value>)",
          darker: "rgb(var(--color-sage-darker) / <alpha-value>)",
        },
        "muted-gray": "rgb(var(--color-muted-gray) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        "warm-beige": "rgb(var(--color-warm-beige) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "on-danger": "rgb(var(--on-danger) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--surface-bright) / <alpha-value>)",
        "surface-container-lowest":
          "rgb(var(--surface-container-lowest) / <alpha-value>)",
        "surface-container-low":
          "rgb(var(--surface-container-low) / <alpha-value>)",
        "surface-container":
          "rgb(var(--surface-container) / <alpha-value>)",
        "surface-container-high":
          "rgb(var(--surface-container-high) / <alpha-value>)",
        "surface-container-highest":
          "rgb(var(--surface-container-highest) / <alpha-value>)",
        "writing-folio": "rgb(var(--writing-folio) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant":
          "rgb(var(--on-surface-variant) / <alpha-value>)",
        "secondary-text": "rgb(var(--secondary-text) / <alpha-value>)",
        outline: "rgb(var(--outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        "primary-container":
          "rgb(var(--primary-container) / <alpha-value>)",
        "on-primary-container":
          "rgb(var(--on-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "secondary-container":
          "rgb(var(--secondary-container) / <alpha-value>)",
        "on-secondary-container":
          "rgb(var(--on-secondary-container) / <alpha-value>)",
        "focus-ring": "rgb(var(--focus-ring) / <alpha-value>)",
        "vault-badge": "rgb(var(--vault-badge) / <alpha-value>)",
        scrim: "rgb(var(--scrim) / <alpha-value>)",
        "on-scrim": "rgb(var(--on-scrim) / <alpha-value>)",
      },
      fontFamily: {
        serif: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        reading: ['"Lora"', "Georgia", "serif"],
      },
      letterSpacing: {
        mega: "0.28em",
        wide2: "0.18em",
      },
      boxShadow: {
        paper: "0 12px 40px -15px rgb(var(--shadow-color) / 0.08)",
        "paper-lg":
          "0 24px 70px -30px rgb(var(--shadow-color) / 0.16)",
        "inner-soft":
          "inset 0 1px 3px rgb(var(--shadow-color) / 0.04)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(rgb(var(--color-sage-deep) / 0.055) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "24px 24px",
      },
    },
  },
  plugins: [],
};
