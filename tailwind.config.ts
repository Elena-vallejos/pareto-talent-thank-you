import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fdfeba", // brand cream
        paper: "#fefee3", // cream lightened for surfaces
        plum: "#280047", // brand deep purple
        ember: "#f54e02", // brand orange (accent only)
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "msg-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-3px)" },
        },
      },
      animation: {
        "msg-in": "msg-in 220ms ease-out both",
        "dot-bounce": "dot-bounce 1.1s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
