/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tw: {
          bg: "#0F0F1C",
          surface: "#1A1A2E",
          border: "#767694",
          text: "#E5E5F0",
          muted: "#A0A0B2",
          primary: "#A78BFA",
          "primary-dark": "#7359CA",
          glow: "#C4B5FD",
          accent: "#8B5CF6",
          "accent-dark": "#6D28D9",
          "light-bg": "#F1ECFB",
          "light-surface": "#F5EEFD",
          "light-border": "#9082B1",
          "light-text": "#2C1F47",
          "light-muted": "#7262A3",
          mood: {
            mysterious: "#8B7CF6", // muted violet
            moody: "#6D8CFF", // soft blue
            enchanted: "#F0B86A", // warm muted gold
            haunted: "#5FBF98", // muted teal/green
            serene: "#77D7EA", // soft cyan
          },
        },
      },
      gridTemplateColumns: {
        tw: "minmax(0,16rem) minmax(0,36rem) minmax(0,16rem)",
      },
    },
  },
  plugins: [],
};
