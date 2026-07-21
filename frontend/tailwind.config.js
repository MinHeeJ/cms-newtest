/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "oklch(93.46% .0304 254.32)",
        "secondary-background": "oklch(100% 0 0)",
        main: "oklch(67.47% .1725 259.61)",
        foreground: "#000000",
        "main-foreground": "#000000",
        border: "#000000",
      },
      borderRadius: {
        base: "5px",
      },
      boxShadow: {
        shadow: "4px 4px 0px 0px #000000",
        nav: "4px 4px 0px 0px #000000",
      },
      translate: {
        boxShadowX: "4px",
        boxShadowY: "4px",
      },
      fontFamily: {
        heading: ["Arial Black", "Arial", "sans-serif"],
        base: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
