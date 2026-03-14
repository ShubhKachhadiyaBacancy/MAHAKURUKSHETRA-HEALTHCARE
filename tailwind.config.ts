import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        line: "#e2e8f0",
        brand: {
          DEFAULT: "#0f172a",
          soft: "#334155",
          accent: "#2563eb"
        }
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        panel: "var(--shadow-panel)"
      },
      backgroundImage: {
        "hero-grid": "var(--hero-grid)"
      }
    }
  },
  plugins: []
};

export default config;
