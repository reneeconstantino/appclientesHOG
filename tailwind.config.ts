import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#07080A",
          raised: "#0E1014",
          card: "#121419",
        },
        mist: {
          DEFAULT: "#7FD8D0",
          soft: "#A9C7D6",
          deep: "#3C6E73",
        },
        gold: {
          DEFAULT: "#D8B777",
          soft: "#E8D2A4",
          deep: "#A8824A",
        },
        ok: "#5FD0A0",
        warn: "#E8C56B",
        risk: "#E8836B",
        hairline: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.375rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 60px -24px rgba(0,0,0,0.8)",
        ring: "0 0 0 1px rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sheen: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        rise: "rise 0.6s cubic-bezier(0.16,1,0.3,1) both",
        sheen: "sheen 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
