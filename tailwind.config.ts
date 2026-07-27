import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#faf6f0", dark: "#f0e8dc", warm: "#e8dfd2" },
        terracotta: { DEFAULT: "#c4785a", dark: "#a8614a", light: "#d4957d" },
        olive: { DEFAULT: "#6b7b5e", light: "#8a9a7c", dark: "#4a5d42" },
        wine: { DEFAULT: "#6b2d3c", light: "#8b3a4a", dark: "#4a1f28" },
        gold: { DEFAULT: "#c9a962", light: "#dbc88a", muted: "#b8954f" },
        ink: { DEFAULT: "#2c2825", muted: "#6b635c", light: "#8a827a" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "4px", "card-lg": "8px" },
      boxShadow: {
        card: "0 2px 20px rgba(44, 40, 37, 0.06)",
        "card-hover": "0 12px 40px rgba(107, 45, 60, 0.12)",
        modal: "0 24px 64px rgba(44, 40, 37, 0.18)",
        hero: "0 4px 32px rgba(44, 40, 37, 0.12)",
      },
      letterSpacing: {
        editorial: "0.35em",
        wide: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
