/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F7F3",
        paper: "#FDFCF9",
        charcoal: "#252622",
        "charcoal-muted": "#565851",
        sage: {
          DEFAULT: "#82947C",
          dark: "#6C7E66",
          light: "#DCE3D5",
          subtle: "#E8EFE6",
          deep: "#50614B",
        },
        "muted-gray": "#85857D",
        hairline: "#E8E6DF",
        "warm-beige": "#F0EEE7",
        danger: "#A8433A",
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
        paper: "0 12px 40px -15px rgba(37, 38, 34, 0.08)",
        "paper-lg": "0 24px 70px -30px rgba(37, 38, 34, 0.16)",
        "inner-soft": "inset 0 1px 3px rgba(37, 38, 34, 0.04)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(rgba(80, 97, 75, 0.055) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "24px 24px",
      },
    },
  },
  plugins: [],
};
