/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Pretendard", "Malgun Gothic", "sans-serif"] },
    },
  },
  plugins: [],
};
