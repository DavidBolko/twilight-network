/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily:{
        'Nunito': ['Nunito', 'sans-serif']
      },
      colors:{
        "twilight-white":
        {
          100: "#F5F5F5",
          200: "#EBEBEB",
          300: "#E0E0E0"
        },
        "twilight-dark":{
          100: "#185098",
          200: "#091234",
          300: "#060C23",
          400: "#030611",
          500: "#216ED4"
        },
        "twilight":{
          100: "#F2F3F8",
          200: "#E4E7F1",
          300: "#D7DAEA",
          400: "#8792C0",
          500: "#4D5B93",
          600: "#3F4A78",
          700: "#31395E",
          800: "#232943",
          900: "#151929"
        },
        "moonlight":{
          100: "#72B1E9",
          200: "#4F9EE3",
          300: "#2B8BDE",
          400: "#1C6BB0",
          500: "#16568D"
        }
      },
      boxShadow:{
        "twilight": '0 5px 12px 2px rgb(0 0 0 / 0.15)',
        "glowTwilight": '0 0px 3px 1px rgb(137 76 250 / 0.50)',
        "glow": '0 0px 3px 1px rgb(43 139 222 / 1)'
      },
      dropShadow:{
        "glow": '0 0px 3px 1px rgb(61, 147, 224, 1)'
      },
      
    },
  },
  plugins: [],
}