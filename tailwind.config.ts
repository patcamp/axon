import type { Config } from "tailwindcss";

// Colors are CSS custom properties (set in globals.css / theme.tsx) rather
// than static hex values, so the whole app can flip dark/light and swap the
// user's accent color at runtime — single source of truth for both the
// desktop sidebar and the mobile drawer (same component, same tokens). See
// design/Axon_STYLE_INTEGRATION.md and components/ui/CLAUDE.md.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        sidebar: "var(--bg-sidebar)",
        surface: "var(--bg-surface)",
        hairline: "var(--border)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
      },
      borderRadius: {
        control: "7px",
        btn: "8px",
        send: "9px",
        card: "14px",
        drawer: "18px",
      },
      fontFamily: {
        // Self-hosted via next/font/google (see app/layout.tsx) — this var,
        // not a literal "Inter" family name, is what actually loads the font.
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
