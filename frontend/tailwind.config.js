/** @type {import('tailwindcss').Config} */
export default {
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
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      letterSpacing: {
        mega: "0.28em",
        wide2: "0.18em",
      },
      boxShadow: {
        paper: "0 12px 40px -15px rgb(var(--color-charcoal) / 0.08)",
        "paper-lg":
          "0 24px 70px -30px rgb(var(--color-charcoal) / 0.16)",
        "inner-soft":
          "inset 0 1px 3px rgb(var(--color-charcoal) / 0.04)",
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
