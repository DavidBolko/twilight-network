/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'feedlg': "1fr 3fr 1fr",
        'feedmd': "1fr 3fr 1fr",
        'feedsm': "0.75fr 2fr 0.75fr",
      },
      fontFamily:{
        'Nunito': ['Nunito', 'sans-serif']
      },
    },
  },
  plugins: [],
}