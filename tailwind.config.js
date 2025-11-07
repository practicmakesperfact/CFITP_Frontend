/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5A4",
        accent: "#FB923C",
        background: "#F8FAFC",
        text: "#334155",
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
      },
    },
  },
  plugins: [],
};
