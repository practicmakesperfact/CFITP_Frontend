/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5A4",
        accent: "#FB923C",
        background: "#F8FAFC",
        text: "#334155",
      },
    },
  },
  plugins: [],
};
