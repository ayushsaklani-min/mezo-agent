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
        background: "#F4EFE6",
        surface: "#FFFFFF",
        "surface-light": "#FAF7F0",
        "surface-card": "#FFFFFF",
        "surface-border": "#000000",
        brutal: {
          bg: "#FFFDF8",
          card: "#FFFFFF",
          pink: "#FE9CE8",
          cyan: "#C0F7FE",
          green: "#99E885",
          yellow: "#F7CB46",
          peach: "#FFDC9B",
          black: "#000000",
          orange: "#F7CB46",
        },
        mezo: {
          DEFAULT: "#F7CB46",
          hover: "#EBB92D",
          light: "#FFE785",
          glow: "rgba(247, 203, 70, 0.25)",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-xl": "8px 8px 0px 0px #000000",
        "brutal-2xl": "12px 12px 0px 0px #000000",
        "brutal-yellow": "4px 4px 0px 0px #FFE600",
        "brutal-orange": "4px 4px 0px 0px #FF9900",
        "brutal-green": "4px 4px 0px 0px #4ADE80",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
