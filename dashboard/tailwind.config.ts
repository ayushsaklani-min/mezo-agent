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
        background: "#08090D",
        surface: "#0F1118",
        "surface-light": "#171A24",
        "surface-card": "#131620",
        "surface-border": "#222634",
        mezo: {
          DEFAULT: "#F7931A",
          hover: "#E8830E",
          light: "#FFA834",
          glow: "rgba(247, 147, 26, 0.2)",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-mezo": "4px 4px 0px 0px #F7931A",
        "brutal-mezo-lg": "6px 6px 0px 0px #F7931A",
        "brutal-emerald": "4px 4px 0px 0px #10B981",
        "brutal-red": "4px 4px 0px 0px #EF4444",
        "brutal-purple": "4px 4px 0px 0px #A855F7",
        "brutal-cyan": "4px 4px 0px 0px #06B6D4",
        "brutal-white": "4px 4px 0px 0px #FFFFFF",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-slow": "glow 6s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.4", transform: "scale(1)" },
          "100%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
