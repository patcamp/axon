# Axon — Style Integration (single source of truth)

## Purpose
Make the responsive/mobile UI and the desktop UI share **one** styling system
instead of each carrying its own hardcoded colors, radii, and type. The goal is
zero visual drift: change a token once, both views update. Match the **current
desktop look exactly** — this is consolidation, not a restyle.

Repo is Next.js 14 App Router + TypeScript + **Tailwind**, so the natural home for
tokens is CSS custom properties in `app/globals.css` plus a `tailwind.config.ts`
theme extension that points utilities at those vars. Components (desktop sidebar,
mobile drawer, composer, bubbles, modal) then reference tokens/utilities — never
raw hex/oklch inline.

> First step for Claude Code: read how the desktop UI in `components/ui/` is
> styled *today* (inline styles? Tailwind classes? a mix?) and reconcile to the
> system below without changing the rendered result.

---

## Canonical tokens

### Theme colors (OKLCH, hue 264 — cool near-neutral)
Default is **dark**; light mirrors it. Put these on `:root` / a light selector.

**Dark (default)**
```
--bg-app:        oklch(0.15  0.006 264)
--bg-sidebar:    oklch(0.125 0.006 264)
--bg-surface:    oklch(0.19  0.008 264)
--border:        oklch(0.32  0.01  264 / 0.5)
--text-primary:  oklch(0.96  0.003 264)
--text-secondary:oklch(0.75  0.006 264)
--text-muted:    oklch(0.55  0.01  264)
```

**Light**
```
--bg-app:        oklch(0.985 0.003 264)
--bg-sidebar:    oklch(0.96  0.004 264)
--bg-surface:    oklch(0.93  0.005 264)
--border:        oklch(0.85  0.006 264)
--text-primary:  oklch(0.2   0.006 264)
--text-secondary:oklch(0.42  0.01  264)
--text-muted:    oklch(0.58  0.01  264)
```

### Accent (user-selectable, set at runtime)
`--accent` is chosen by the user, so it is **not** a static token — it's set
inline / by a theme provider. Default `#7C5CFF`. Allowed swatches:
```
#7C5CFF (violet, default)  #3B82F6  #10B981  #F59E0B  #EC4899
#EF4444  #06B6D4  #6366F1  #84CC16  #14B8A6
```

### Accent-derived recipes (use these exact `color-mix` formulas, both views)
```
logo dot glow:      0 0 8px color-mix(in srgb, var(--accent) 70%, transparent)
active nav/chat bg: color-mix(in srgb, var(--accent) 22%, var(--bg-sidebar))
user bubble bg:     color-mix(in srgb, var(--accent) 55%, black)
primary btn :hover: color-mix(in srgb, var(--accent) 85%, white)
send/create enabled:var(--accent)   | disabled: var(--border)
```

### Fixed accents (not theme-driven)
```
"ready" status dot: oklch(0.65 0.15 145)   label text: oklch(0.55 0.13 145)
links:              oklch(0.72 0.15 296)   :hover: oklch(0.78 0.15 296)
scrollbar thumb:    oklch(0.3  0.01 264)
```

### Radii
```
control (nav items)      7px
buttons                  8px
send / small pills       9px
cards / bubbles / modal 14px
mobile drawer outer edge 18px  (border-radius: 0 18px 18px 0)
```

### Typography — Inter (400/500/600/700), fallback system-ui
```
11px   uppercase section labels, weight 600, letter-spacing 0.06em
12–12.5 secondary / email / field labels
13–13.5 nav + controls + buttons
14–14.5 body, chat messages, inputs
15px   logo wordmark (600)
16px   modal title (600)
24px   empty-state headline (600)
26px   project detail title (600)
```

---

## Suggested implementation in this repo

### `app/globals.css`
```css
:root {
  --bg-app: oklch(0.15 0.006 264);
  --bg-sidebar: oklch(0.125 0.006 264);
  --bg-surface: oklch(0.19 0.008 264);
  --border: oklch(0.32 0.01 264 / 0.5);
  --text-primary: oklch(0.96 0.003 264);
  --text-secondary: oklch(0.75 0.006 264);
  --text-muted: oklch(0.55 0.01 264);
  --accent: #7C5CFF; /* runtime-overridden by the user's chosen swatch */
}
[data-theme="light"] {
  --bg-app: oklch(0.985 0.003 264);
  --bg-sidebar: oklch(0.96 0.004 264);
  --bg-surface: oklch(0.93 0.005 264);
  --border: oklch(0.85 0.006 264);
  --text-primary: oklch(0.2 0.006 264);
  --text-secondary: oklch(0.42 0.01 264);
  --text-muted: oklch(0.58 0.01 264);
}

/* derived tints as utilities so no component re-types the color-mix */
@layer utilities {
  .bg-accent-active { background: color-mix(in srgb, var(--accent) 22%, var(--bg-sidebar)); }
  .bg-user-bubble  { background: color-mix(in srgb, var(--accent) 55%, black); }
}
```

### `tailwind.config.ts` (merge into existing `theme.extend`)
```ts
extend: {
  colors: {
    app: "var(--bg-app)",
    sidebar: "var(--bg-sidebar)",
    surface: "var(--bg-surface)",
    hairline: "var(--border)",        // avoid clobbering Tailwind's `border`
    "text-primary": "var(--text-primary)",
    "text-secondary": "var(--text-secondary)",
    "text-muted": "var(--text-muted)",
    accent: "var(--accent)",
  },
  borderRadius: {
    control: "7px",
    btn: "8px",
    send: "9px",
    card: "14px",
    drawer: "18px",
  },
  fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
}
```

Then utilities read straight from tokens: `bg-app`, `bg-surface`, `text-secondary`,
`border-hairline`, `rounded-card`, `rounded-drawer`, etc. Theme switch = flip
`data-theme` on `<html>`; accent = set `--accent` inline from the user's choice.

---

## Integration rules
1. **One system, both views.** The mobile drawer and the desktop sidebar are the
   *same* component styled by the same tokens — do not fork a mobile stylesheet.
2. **No raw colors in components.** Replace hardcoded hex/oklch with tokens or the
   utilities above. The only literals left should be the recipes in this doc.
3. **Preserve current desktop appearance exactly.** If a token value here differs
   from what desktop currently renders, flag it and ask before changing — match
   what's live.
4. **Accent stays runtime.** Keep `--accent` driven by the user's selection; never
   bake a swatch into a component.
