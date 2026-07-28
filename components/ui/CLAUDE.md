# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It applies to `components/ui/`; see the root `CLAUDE.md` for overall project architecture.

## Structure

Components are grouped by feature area into subfolders; only cross-cutting files (`App.tsx`, `icons.tsx`, `styles.ts`, `theme.tsx`, `session.ts`) sit directly in `components/ui/`. Within a feature folder, siblings import each other with relative paths (`./Foo`); anything reaching into another folder or a top-level file uses the `@/components/ui/...` absolute alias — never `../`.

- **`chat/`** — `ChatPanel`, `ChatTitleMenu`, `Composer`, `MessageList`, `MessageBubble`, `Markdown`, and `chatTypes.ts`.
- **`sidebar/`** — `Sidebar` (desktop rail + mobile drawer, same component), `SidebarHeader`, `SidebarNav`, `ConversationList`, `AccountFooter`.
- **`projects/`** — `ProjectList`, `ProjectDetail`, `NewProjectDialog`.
- **`settings/`** — `SettingsView`.
- **`auth/`** — `AuthScreen`.
- **`common/`** holds generic, style-driven primitives (`Button`, `TextField`) that take `variant`/`size` props mapped to `styles.ts` recipes plus a passthrough `className`. Reach for these instead of writing new ad hoc `<button>`/`<input>` elements.

Top-level files:
- **`App.tsx` owns all state.** Conversations, projects, sidebar view/selection, active chat messages, and the streaming flag all live here as `useState`. `Sidebar`, `ChatPanel`, and the dialogs underneath them are presentational — they receive data and callbacks as props and call `components/api/*` only indirectly through handlers passed down from `App.tsx`. When adding a feature, prefer lifting new state into `App.tsx` over introducing local state that needs to sync with it.
- **Chat streaming lives in `App.tsx#sendMessage`.** It POSTs to `/api/chat`, reads the response body with `res.body.getReader()`, and appends each decoded chunk to the last message in `messages` via `appendToLast` (mutates a placeholder empty assistant message added right before the fetch). Any change to streaming behavior (e.g. cancellation, error formatting) belongs here, not in `ChatPanel`.
- **`session.ts`** exposes the Supabase auth session via a `useSession()` hook — the only way components should read the current user.
- **`chat/chatTypes.ts`** defines `ChatMessage` (`{ role, content }`), the shape used for in-memory chat state — distinct from `lib/types.ts`'s `Message`, which is the persisted DB row.

## Styling

- **`styles.ts` centralizes all Tailwind class strings**, grouped by feature area (`button`, `textField`, `sidebar`, `chat`, `projectDetail`, `menu`, `dialog`, `settings`, `code`, `auth`). Components reference `styles.<area>.<key>` rather than inlining className strings; some entries are functions of state (e.g. `styles.sidebar.row(active)`) for conditional variants. When styling a new element, check whether an existing group already fits before adding raw Tailwind classes inline.
- **Color tokens are CSS custom properties, not static hex values** — `--bg-app`, `--bg-sidebar`, `--bg-surface`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted` are defined per dark/light theme in `app/globals.css` (switched by a `data-theme` attribute on `<html>`); `--accent` is one of 10 curated swatches (`ACCENT_SWATCHES` in `components/api/settings.ts`) applied inline. `tailwind.config.ts` maps these to `bg-app/sidebar/surface`, `border-hairline`, `text-primary/secondary/muted`, and `bg-/text-/border-accent` — use those Tailwind tokens instead of arbitrary hex or oklch. `borderRadius` is likewise a named scale (`rounded-control` 7px, `rounded-btn` 8px, `rounded-send` 9px, `rounded-card` 14px, `rounded-drawer` 18px, used directionally as `rounded-r-drawer` on the mobile sidebar). The two recurring accent tints (active nav/row background, user bubble background) are `@layer utilities` classes in `globals.css` — `bg-accent-active`, `bg-user-bubble` — rather than repeated inline `color-mix()`. **The desktop sidebar and the mobile off-canvas drawer are the same component** (`Sidebar.tsx`/`styles.sidebar.container`, gated by `sm:` responsive variants) reading the same tokens — never fork mobile-only styles. `components/ui/theme.tsx` (`ThemeProvider`/`useTheme`) loads/persists the signed-in user's choice (`user_settings` table) and applies both to `document.documentElement`; `SettingsView.tsx` (`/settings`) is the only place that changes them. Canonical token reference: `design/Axon_STYLE_INTEGRATION.md`.
- The `menu` group is a shared dropdown-panel look used by both `ChatTitleMenu` and the account popup in `AccountFooter`; follow its `panel`/`panelBelow`/`panelAbove` pattern for new anchored menus rather than building a new popover style.
