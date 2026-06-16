import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem"
    },
    extend: {
      colors: {
        dark: "#1c2536",
        foreground: "#1c2536",
        "muted-foreground": "#5a6a85bf",
        border: "#dfe5ef",
        ld: "#dfe5ef",
        sidebar: "#ffffff",
        "sidebar-foreground": "#2a3547",
        primary: "#5d87ff",
        primaryemphasis: "#4570ea",
        secondary: "#49beff",
        secondaryemphasis: "#23a8f2",
        success: "#13deb9",
        warning: "#f6b51e",
        error: "#ef4444",
        info: "#8754ec",
        lightprimary: "rgba(93, 135, 255, 0.12)",
        lightsecondary: "rgba(73, 190, 255, 0.12)",
        lightsuccess: "rgba(19, 222, 185, 0.12)",
        lightwarning: "rgba(246, 181, 30, 0.14)",
        lighterror: "rgba(239, 68, 68, 0.12)",
        lightinfo: "rgba(135, 84, 236, 0.12)"
      },
      spacing: {
        "15": "15px",
        "21": "21px",
        "30": "30px"
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px"
      },
      boxShadow: {
        md: "0 6px 24px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
