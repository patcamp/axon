# Axon

A Next.js 14 (App Router) + TypeScript + Tailwind chatbot, streaming responses
from open models via [Groq](https://groq.com), with Supabase Auth, persisted
conversations, and per-project standing instructions ("Projects").

## What's inside

```
app/
  api/chat/route.ts    # streams the main chat from Groq (llama-3.1-8b-instant)
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
  `budget`) and calls Supabase directly — no server routes for CRUD.

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

## 4. Push to GitHub / Deploy

Same as any Next.js app — `.env.local` is gitignored. On Vercel, add the same
env vars from the table above. `/api/chat` runs on the Edge runtime for
streaming.
