/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        foreground: "#333638",
        muted: "#71717a",
        border: "#eaebec",
        primary: "#7b5fe2",
        primaryemphasis: "#6d4fd8",
        lightprimary: "#f1ecff",
        dark: "#1f2937",
        sidebar: "#ffffff",
        "sidebar-foreground": "#333638",
        success: "#009900",
        error: "#c80001",
        warning: "#e45735",
        ld: "#eaebec",
      },
      keyframes: {
        fadein: { from: { opacity: "0" }, to: { opacity: "1" } },
        "float-down": {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "background-fade-highlight": {
          from: { backgroundColor: "#fef3c7" },
          to: { backgroundColor: "transparent" },
        },
      },
      animation: {
        fadein: "fadein 500ms ease",
        "float-down": "float-down 250ms ease forwards",
        "background-fade-highlight":
          "background-fade-highlight 2500ms ease-out",
      },
    },
  },
  plugins: [],
};
