import type { Config } from "tailwindcss";

// Design tokens — "niebla industrial" / techno-noir.
// Cold cyan is the live/complete signal; ember is scarce, only for open/partial states.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0C0F",   // base
        panel: "#12161C",  // raised surface
        line: "#1E252E",   // hairlines
        steel: "#7C8896",  // muted text / labels
        ice: "#4FD1E8",    // cold accent — signal, complete
        ember: "#E8654F",  // warm alert — partial / open (used sparingly)
        bone: "#EDF1F4",   // primary text
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-archivo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
