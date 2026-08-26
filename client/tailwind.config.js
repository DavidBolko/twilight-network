/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
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
          light: {
            bg: "#E6E6FA",
            surface: "#F5EEFD",
            border: "#9082B1",
            text: "#2C1F47",
            muted: "#7262A3",
          },
        },
      },
      gridTemplateColumns: {
        app: "minmax(16rem, 1fr) minmax(0, 40rem) minmax(16rem, 1fr)",
      },
      boxShadow: {
        'primary-glow': '0 0 15px rgba(167, 139, 250, 0.4)',
        'danger-glow': '0 0 15px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
};
