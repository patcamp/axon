# Axon

A Next.js 14 (App Router) + TypeScript + Tailwind chatbot, streaming responses
from open models via [Groq](https://groq.com), with Supabase Auth, persisted
conversations, and per-project standing instructions ("Projects").

## What's inside

```
app/
  api/chat/route.ts    # streams the main chat from Groq (llama-3.1-8b-instant)
  api/agent/route.ts    # token-authed coding endpoint for the VS Code extension
  code/page.tsx           # generate/revoke personal access tokens
  page.tsx, AppShell.tsx, layout.tsx, globals.css
components/
  api/                  # all Supabase calls — one file per domain, no cross-imports
  ui/                    # client components; App.tsx is the top-level UI tree
lib/
  supabase.ts             # client singleton (anon key + RLS, no server auth)
  types.ts                 # TypeScript types mirroring the DB schema
supabase/
  schema.sql                # full schema + RLS, run manually in the SQL editor
```

## Architecture notes

- **Auth is entirely client-side.** `app/AppShell.tsx` gates every route on a
  Supabase Auth session (email/password); there's no middleware or server
  components doing auth. The session lives in `localStorage` via
  `supabase-js`. `components/ui/session.ts` exposes it via a `useSession()`
  hook.
- **RLS is the real security boundary**, not the client — every table is
  scoped to `auth.uid()`. The anon key is safe to expose because a request
  without a valid session returns zero rows.
- **`components/api/*.ts`** is the only layer that imports `lib/supabase.ts`.
  Each file owns one domain (`auth`, `conversations`, `messages`, `projects`,
  `budget`, `tokens`) and calls Supabase directly — no server routes for CRUD.

## 1. Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Var | Notes |
|---|---|
| `GROQ_API_KEY` | Free at https://console.groq.com/keys |
| `GROQ_MODEL` | Main chat model. Default `llama-3.1-8b-instant`. |
| `GROQ_AGENT_MODEL` | Model for `/api/agent` (VS Code extension). Default `openai/gpt-oss-120b` — needs to be stronger than the 8B chat model for reliable code edits. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **`anon` / `public`** key from Settings → API — never the `service_role` key. It's safe client-side only because RLS enforces access control. |

Then run `supabase/schema.sql` in the Supabase SQL editor (Project → SQL
Editor → New query). It's additive — if you're updating an existing project,
only run the statements you haven't run yet (each section is commented with
what it adds).

## 2. Run it

```bash
npm run dev
```

Open http://localhost:3000, register/sign in, and start chatting.

## 3. Projects

The Projects feature (sidebar → Projects) lets you set standing instructions
applied to every chat inside a project. There's also a built-in, non-deletable
**Budget** project that pulls live data from a companion budget app sharing
this Supabase project (see `components/api/budget.ts`) — remove that
integration if you don't have that app.

## 4. Code page — personal access tokens

Visit `/code` (via the account menu at the bottom of the sidebar → "Code") to
generate a personal access token for the VS Code extension:

- Tokens are generated **client-side** (`components/api/tokens.ts`): random
  bytes → SHA-256 hash → only the hash is stored in `access_tokens`. The
  plaintext is shown once and never persisted — if you lose it, revoke it and
  generate a new one.
- `/api/agent` validates a token by hashing the incoming `Authorization:
  Bearer <token>` header and calling the `verify_access_token` Postgres
  function (`security definer`, defined in `schema.sql`) — this is the one
  case that needs to look up a caller *without* an active Supabase session,
  so it can't go through normal RLS. No service-role key is used anywhere in
  this app.

### `/api/agent` contract

Request:
```json
{
  "message": "...",
  "context": {
    "files": [{ "path": "src/x.ts", "content": "..." }],
    "selection": { "path": "src/x.ts", "text": "..." }
  }
}
```

Response (strict JSON, no prose):
```json
{
  "reply": "explanation of what was done",
  "edits": [
    {
      "path": "src/x.ts",
      "newFile": false,
      "hunks": [{ "search": "exact existing text", "replace": "replacement" }]
    }
  ]
}
```

`edits` is `[]` when no file change is needed. New files use `"newFile":
true` with a single hunk `{ "search": "", "replace": "<full file body>" }`.
An invalid/missing token returns `401`.

### VS Code extension ("Axon Assistant")

Lives in `extension/` as its own TypeScript project (its own `package.json`,
compiled with plain `tsc`, no bundler). It opens a webview panel with a chat
thread and a Changelog section:

- Sends the active editor's file + selection to `/api/agent` as context.
- Auto-applies returned edits via `vscode.WorkspaceEdit` (find/replace each
  hunk against the current file text; skips + notes any hunk whose `search`
  text isn't found), then saves the touched files.
- Every turn that changes files gets a changelog entry (request, per-file
  diff, computed with the `diff` package) with an **Undo** button that
  restores the pre-edit content (or deletes the file if it was newly
  created). Changelog state is in-memory only — cleared on VS Code restart.
- `401`/network errors surface as a VS Code toast and a message in the panel;
  the panel itself never crashes.

**Building the `.vsix`:**
```bash
npm run build:extension
```
This installs `extension`'s own deps, compiles it, and packages it to
`public/downloads/axon-assistant.vsix` via `@vscode/vsce`. That file is
**committed to the repo** (not rebuilt on every deploy — packaging is a
separate Node project and isn't worth doing on every Vercel build). Re-run
`build:extension` and commit the result whenever you change anything under
`extension/`.

The `/code` page serves that file directly and walks through: installing via
VS Code's "Install from VSIX…", then setting `axon.backendUrl` (this
deployment's origin, shown with a copy button) and `axon.token` (a token
generated on the same page) in Settings.

## 5. Push to GitHub / Deploy

Same as any Next.js app — `.env.local` is gitignored. On Vercel, add the same
env vars from the table above. Both `/api/chat` and `/api/agent` run on the
Edge runtime, so streaming and Web Crypto (used for token hashing) work out
of the box.
