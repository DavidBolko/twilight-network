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
        "nord-night":{
          400: "#2E3440",
          300: "#3B4252",
          200: "#434C5E",
          100: "#4C566A",
        },
        "nord-snow":{
          300: "#D8DEE9",
          200: "#E5E9F0",
          100: "#ECEFF4"
        },
        "nord-frost":{
          100: "#5E81AC",
          200: "#81A1C1",
          300: "#88C0D0",
          400: "#8FBCBB",
        },
        "aurora":{
          100: "#BF616A",
          200: "#A3BE8C"
        }
      },
      boxShadow:{
        "shadowNord": '0 5px 12px 2px rgb(0 0 0 / 0.15)',
        "shadowFrost": '0 5px 12px 2px rgb(136 192 208 / 0.30)'
      },
      dropShadow:{
        "shadowFrost": '0 5px 12px 2px rgb(136 192 208 / 0.30)'
      }
      

    },
  },
  plugins: [],
}