"use client";

import { ACCENT_SWATCHES } from "@/components/api/settings";
import { useTheme } from "./theme";
import { styles } from "./styles";

export default function SettingsView() {
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();

  return (
    <div className={styles.settings.page}>
      <div className={styles.settings.section}>
        <div className={styles.settings.sectionLabel}>Appearance</div>
        <div className={styles.settings.modeRow}>
          <button className={styles.settings.modeButton(theme === "dark")} onClick={() => setTheme("dark")}>
            Dark
          </button>
          <button className={styles.settings.modeButton(theme === "light")} onClick={() => setTheme("light")}>
            Light
          </button>
        </div>
      </div>

      <div className={styles.settings.section}>
        <div className={styles.settings.sectionLabel}>Accent color</div>
        <div className={styles.settings.swatchRow}>
          {ACCENT_SWATCHES.map((color) => (
            <button
              key={color}
              aria-label={color}
              onClick={() => setAccentColor(color)}
              className={styles.settings.swatch(color === accentColor)}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
