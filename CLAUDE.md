# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For folder-specific detail, see `components/ui/CLAUDE.md` (UI state/styling conventions).

## Commands

```bash
npm install
cp .env.example .env.local   # then fill in GROQ_API_KEY, GROQ_MODEL,
                              # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:3000
npm run build
npm run lint
```

There is no test suite in this repo.

Database: run `supabase/schema.sql` manually in the Supabase SQL editor. It's additive — each section is commented with what it adds, so on an existing project only run statements you haven't run yet.

## Architecture

- **Auth is entirely client-side.** `app/AppShell.tsx` gates every route on a Supabase Auth session (email/password); there's no middleware or server-side auth. The session lives in `localStorage` via `supabase-js`, exposed through the `useSession()` hook in `components/ui/session.ts`.
- **RLS is the real security boundary, not the client.** Every table is scoped to `auth.uid()`. The anon key in `lib/supabase.ts` is safe to expose because a request without a valid session returns zero rows. There is no service-role key anywhere in this app.
- **`components/api/*.ts` is the only layer that talks to Supabase** — the sole importer of `lib/supabase.ts`. One file per domain (`auth`, `conversations`, `messages`, `projects`, `budget`), no cross-imports between them, no server routes for CRUD.
- **`lib/types.ts`** mirrors the DB schema; keep it in sync with `supabase/schema.sql` when the schema changes.
- **`app/api/chat/route.ts`** streams the main chat from Groq (`llama-3.1-8b-instant` by default) on the Edge runtime.
- The **Budget** project (sidebar → Projects) is a built-in, non-deletable project that pulls live data from a separate companion budget app sharing this Supabase project — see `components/api/budget.ts`. Remove that integration if working in a context without that companion app.
