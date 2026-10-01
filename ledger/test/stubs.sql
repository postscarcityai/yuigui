-- Stand-ins for what the Yui backend already has in the yuigui project, enough for ledger/yui_ledger.sql.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname = 'yui_user') then create role yui_user nologin; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role, yui_user;

create or replace function public.yui_uid() returns uuid language sql stable set search_path = '' as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid
$$;
grant execute on function public.yui_uid() to yui_user, service_role;

create table public.yui_users (
  id uuid primary key default gen_random_uuid(),
  apple_sub text not null unique,
  created_at timestamptz not null default now()
);
create table public.yui_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.yui_users(id) on delete cascade,
  agent_id uuid,
  sender text not null check (sender in ('user', 'agent')),
  body text not null,
  kind text not null default 'text' check (kind in ('text', 'event')),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.yui_native_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.yui_users(id) on delete cascade,
  kind text not null default 'meal',
  status text not null default 'queued',
  finished_at timestamptz
);
grant all on all tables in schema public to service_role;
