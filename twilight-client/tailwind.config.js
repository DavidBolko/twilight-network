/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tw: {
          bg: "#0F0F1C",
          surface: "#1A1A2E",
          border: "#2E2E46",
          text: "#E5E5F0",
          muted: "#A0A0B2",
          primary: "#A78BFA",
          "primary-dark": "#7C5FD9",
          glow: "#C4B5FD",
          accent: "#8B5CF6",
          "accent-dark": "#6D28D9",
          "light-bg": "#F1ECFB",
          "light-surface": "#F5EEFD",
          "light-border": "#CDBFF2",
          "light-text": "#2C1F47",
          "light-muted": "#7B6BAF",
        },
      },
      gridTemplateColumns: {
        tw: "1fr 2fr 1fr",
      },
    },
  },
  plugins: [],
};
