/** @type {import('tailwindcss').Config} */

import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3caca8",
        secondary: "#aaa6c3",
        update: "#ED8D1D",
      },
      fontFamily: {
        vazirmatn: ["Vazirmatn", "Arial", "sans-serif"],
        Ray: ["Ray"],
        Ray_black: ["Ray_black"],
        Ray_text: ["Ray_text"],
      },
      container: {
        padding: {
          DEFAULT: "0.5rem",
          sm: "0.5rem",
          lg: "1rem",
          xl: "2rem",
          "2xl": "3rem",
        },
      },
    },
  },
  plugins: [],
};
