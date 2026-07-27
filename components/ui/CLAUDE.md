# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It applies to `components/ui/`; see the root `CLAUDE.md` for overall project architecture.

## Structure

- **`App.tsx` owns all state.** Conversations, projects, sidebar view/selection, active chat messages, and the streaming flag all live here as `useState`. `Sidebar`, `ChatPanel`, and the dialogs underneath them are presentational — they receive data and callbacks as props and call `components/api/*` only indirectly through handlers passed down from `App.tsx`. When adding a feature, prefer lifting new state into `App.tsx` over introducing local state that needs to sync with it.
- **Chat streaming lives in `App.tsx#sendMessage`.** It POSTs to `/api/chat`, reads the response body with `res.body.getReader()`, and appends each decoded chunk to the last message in `messages` via `appendToLast` (mutates a placeholder empty assistant message added right before the fetch). Any change to streaming behavior (e.g. cancellation, error formatting) belongs here, not in `ChatPanel`.
- **`common/`** holds generic, style-driven primitives (`Button`, `TextField`) that take `variant`/`size` props mapped to `styles.ts` recipes plus a passthrough `className`. Reach for these instead of writing new ad hoc `<button>`/`<input>` elements.
- **`session.ts`** exposes the Supabase auth session via a `useSession()` hook — the only way components should read the current user.
- **`chatTypes.ts`** defines `ChatMessage` (`{ role, content }`), the shape used for in-memory chat state — distinct from `lib/types.ts`'s `Message`, which is the persisted DB row.

## Styling

- **`styles.ts` centralizes all Tailwind class strings**, grouped by feature area (`button`, `textField`, `sidebar`, `chat`, `menu`, `dialog`, `code`, `auth`). Components reference `styles.<area>.<key>` rather than inlining className strings; some entries are functions of state (e.g. `styles.sidebar.row(active)`) for conditional variants. When styling a new element, check whether an existing group already fits before adding raw Tailwind classes inline.
- Color tokens (`ink-950`…`ink-600`, `accent`/`accent-soft`) are defined in `tailwind.config.ts` and used throughout `styles.ts` instead of arbitrary hex/Tailwind gray values — reuse these tokens for consistency with the existing dark theme.
- The `menu` group is a shared dropdown-panel look used by both `ChatTitleMenu` and the account popup in `AccountFooter`; follow its `panel`/`panelBelow`/`panelAbove` pattern for new anchored menus rather than building a new popover style.
