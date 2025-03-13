/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customBg: "#2C2A35",
        customCard: "#36343f",
      },
      fontFamily: {
        nunito: ["Nunito, sans-serif"],
        kanit: ["Kanit", "sans-serif"],
      },
    },
  },
  plugins: [],
};

//customBg: "#D9C5A2",
//customCard: "#4F5D4E",

//dark mode
//customBg: "#2C2A35",
//customCard: "#36343f",

// customBg: "#E4E1DD",
// customCard: "#CBC6C0",
