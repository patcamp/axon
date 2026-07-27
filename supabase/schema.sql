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

-- Personal access tokens for the VS Code extension. Only a SHA-256 hash
-- is ever stored; the plaintext is shown once at creation and never
-- persisted or logged.
create table access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  token_hash text not null unique,
  name text not null default 'VS Code extension',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table access_tokens enable row level security;

create policy "Own select" on access_tokens for select using (auth.uid() = user_id);
create policy "Own insert" on access_tokens for insert with check (auth.uid() = user_id);
create policy "Own delete" on access_tokens for delete using (auth.uid() = user_id);

-- Used only by /api/agent to resolve a bearer token to a user without an
-- active Supabase session. security definer, so it runs with owner
-- privileges for this one narrow lookup+touch — the anon key alone
-- cannot otherwise read this table unscoped (no service-role key needed
-- anywhere in this app).
create function public.verify_access_token(p_hash text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_user_id uuid;
begin
  update access_tokens set last_used_at = now()
    where token_hash = p_hash
    returning user_id into v_user_id;
  return v_user_id;
end $$;
