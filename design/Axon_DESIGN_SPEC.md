# Handoff: Axon Chat App Redesign

## Overview
A professional redesign of the Axon AI chat app: sidebar (Chats/Projects), empty state, active conversation view, new-project modal, and a profile menu. Includes a tweakable accent color and dark/light theme.

## About the Design Files
The bundled file (`Axon.dc.html`) is a **design reference prototype built in HTML** — it demonstrates layout, visual style, and interaction behavior, not production code to copy directly. Recreate these designs in the target codebase's existing environment (React, etc.) using its established patterns, component library, and state management — or choose the most appropriate framework if none exists yet.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final/intended. Recreate pixel-close using the codebase's own component/styling system.

## Screens / Views

### 1. Sidebar (persistent, 264px wide)
- Logo row: 9px accent dot with glow + "Axon" wordmark, Inter 600 15px.
- Primary button: "New chat" (Chats view) / "New project" (Projects view). Full-width, accent background, white text, 8px radius, 9px/12px padding.
- Nav: "Chats" and "Projects" toggle items (speech-bubble / folder icon + label), active item gets a soft accent-tinted background.
- Chats view: list of chat titles, active chat highlighted, click to open.
- Projects view: list of projects (folder icon + title), click opens project detail.
- Footer: profile row (avatar initials circle + email). Click toggles a popover above it with "Sign out".

### 2. Empty state (no chat selected)
- Centered "What can I help with?" (24px, 600 weight).
- Composer below: multi-line textarea (3 rows) + "Send" button (accent when text present, muted otherwise). Enter sends, Shift+Enter newlines.
- Content area has a subtle diagonal lattice background pattern, blurred for soft edges, faded via radial mask toward the edges.

### 3. Conversation view
- Header bar: chat title (left), "ready" status pill (green dot + label, right).
- Messages: user bubbles right-aligned (accent-tinted dark bg, white text), assistant bubbles left-aligned (surface bg). Max width 78%, 14px radius.
- "Thinking" state: 3 pulsing dots in an assistant-style bubble while awaiting reply.
- Composer pinned at bottom, same style as empty state.

### 4. Project detail view
- Reached by clicking a project in the sidebar.
- "← All projects" back link, project title (26px/600), description text, divider, then chat list placeholder ("No chats in this project yet.").

### 5. New Project modal
- Triggered by "New project" button while in Projects view.
- Centered dialog (420px), overlay backdrop (click outside to close).
- Fields: Name (required), Description (optional, textarea).
- Actions: Cancel / Create project (accent when name is filled).

## Interactions & Behavior
- Sidebar New chat/New project button label and action swap based on active nav view.
- Clicking a chat loads its message history; clicking "New chat" resets to empty state.
- Sending a message in empty state creates a new chat entry (title = truncated message text) and appends to top of Chats list.
- Assistant reply is simulated after ~1.1s (prototype only — wire to a real model backend).
- Profile menu and modal close on outside click (backdrop click / overlay).

## State Management
- `chats`: array of `{ id, title, messages: [{role, text}] }`.
- `projects`: array of `{ id, title, description }`.
- `activeChatId`, `activeProjectId`: which item is open (mutually exclusive).
- `view`: `'chats' | 'projects'` — which sidebar list is shown.
- `draft`: composer text.
- `isThinking`: shows the pulsing-dots assistant placeholder.
- `showNewProjectModal`, `newProjectName`, `newProjectDesc`: modal state.
- `showProfileMenu`: profile popover toggle.

## Design Tokens
Implemented as CSS custom properties, switched by `mode` (dark/light) and `accentColor`:
- `--bg-app`, `--bg-sidebar`, `--bg-surface` — background layers.
- `--border` — hairline dividers.
- `--text-primary`, `--text-secondary`, `--text-muted` — text hierarchy.
- `--accent` — user-selectable brand color (10 curated swatches: violet `#7C5CFF` default, blue `#3B82F6`, green `#10B981`, amber `#F59E0B`, pink `#EC4899`, red `#EF4444`, cyan `#06B6D4`, indigo `#6366F1`, lime `#84CC16`, teal `#14B8A6`).
- Dark theme uses OKLCH near-black backgrounds (~L 0.13–0.19) with near-white text (~L 0.96); light theme mirrors with near-white backgrounds (~L 0.93–0.985) and dark text (~L 0.2).
- Font: Inter (400/500/600/700), system-ui fallback.
- Radii: 7–9px small controls, 14px cards/bubbles/modal.

## Assets
No external images. Icons (chat bubble, folder) are drawn with CSS borders/pseudo-elements, no SVG/icon font.

## Files
- `Axon.dc.html` — full prototype (structure + interaction logic in one file).
