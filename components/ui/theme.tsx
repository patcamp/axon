"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode } from "@/lib/types";
import { DEFAULT_ACCENT, DEFAULT_THEME, getSettings, saveSettings } from "@/components/api/settings";

interface ThemeContextValue {
  theme: ThemeMode;
  accentColor: string;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accentColor: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  accentColor: DEFAULT_ACCENT,
  setTheme: () => {},
  setAccentColor: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

// Loads the signed-in user's theme/accent from Supabase, applies them as
// CSS custom properties + a data-theme attribute on <html> (so every
// component picks them up via the tokens in globals.css/tailwind.config.ts),
// and persists changes back on every update.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings) {
        setThemeState(settings.theme);
        setAccentColorState(settings.accent_color);
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--accent", accentColor);
  }, [theme, accentColor]);

  function setTheme(next: ThemeMode) {
    setThemeState(next);
    saveSettings(next, accentColor);
  }

  function setAccentColor(next: string) {
    setAccentColorState(next);
    saveSettings(theme, next);
  }

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}
