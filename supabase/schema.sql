-- groq-chatbot schema. Run manually in the Supabase SQL editor.
-- Shares a Supabase project with the "budget" app; own tables below,
-- plus components/api/budget.ts reads budget's pay_periods/categories/
-- expenses tables directly for the built-in Budget project (RLS on
-- those tables already scopes reads to the signed-in user). RLS is
-- the real access-control layer here, not the client — the anon key
-- without a session returns zero rows.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'New chat',
  created_at timestamptz not null default now()
);

alter table conversations enable row level security;

create policy "Own rows" on conversations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Own rows" on messages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projects: a standing instructions prompt applied to every chat inside it.
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  instructions_md text not null default '',
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Own rows" on projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nullable: conversations outside any project keep project_id null.
-- "set null" on project delete so its chats survive, just unassigned.
alter table conversations add column project_id uuid references projects(id) on delete set null;

-- Marks the auto-created, non-deletable "Budget" project (live data
-- pulled from budget's tables at send time, not stored here).
alter table projects add column is_builtin boolean not null default false;
create unique index projects_one_builtin_per_user on projects(user_id) where is_builtin;

-- Starred chats, surfaced in a "Favorites" sidebar section.
alter table conversations add column is_favorite boolean not null default false;

-- To drop the retired VS Code extension's access-token support from an
-- existing database, run:
--   drop function if exists public.verify_access_token(text);
--   drop table if exists access_tokens;

-- Per-user UI preferences (theme + accent color) from the Axon redesign,
-- one row per user so they follow the user across devices.
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  accent_color text not null default '#7C5CFF',
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "Own row" on user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
