-- The private ledger (OSS-7). Spec: spec/LEDGER.md, rendered at yuigui.com/developers/ledger.
-- Apply by hand in the SQL editor of the shared Supabase project. Never `supabase db push`:
-- the project is shared with other apps.
--
-- Facts about use and contribution, never what anyone said. Rows are only ever added.
-- Points are not stored here: a formula published later turns these facts into points.

create table if not exists public.yui_ledger (
  id bigint generated always as identity primary key,
  -- A Yui account, or a GitHub handle for a pull request from someone not linked to one yet.
  user_id uuid references public.yui_users(id) on delete cascade,
  github text check (github is null or github ~ '^[A-Za-z0-9-]{1,39}$'),
  kind text not null check (kind in ('joined', 'use_day', 'pr_merged', 'feedback_shipped')),
  day date not null,
  amount integer not null default 1 check (amount > 0),
  -- What the fact points at: a pull request (repo#number) or a feedback id. Never content.
  ref text not null default '' check (length(ref) <= 120),
  created_at timestamptz not null default now(),
  check (user_id is not null or github is not null)
);

-- One fact, once. Running the recorder twice adds nothing.
create unique index if not exists yui_ledger_fact on public.yui_ledger
  (kind, coalesce(user_id::text, ''), coalesce(lower(github), ''), day, ref);
create index if not exists yui_ledger_user_idx on public.yui_ledger (user_id, day);

-- Private: no grants to anon, authenticated or the app's own role, and RLS on with no policy.
-- Only the service role writes. A view that shows a person their own rows is a later phase.
revoke all on public.yui_ledger from public, anon, authenticated;
alter table public.yui_ledger enable row level security;

-- Record one UTC day: who joined, and who used Yui (sent a message or answered a screen).
-- Reads user_id, sender and created_at from yui_messages. Never body.
create or replace function public.yui_ledger_record_day(p_day date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer := 0;
  added integer;
begin
  insert into public.yui_ledger (user_id, kind, day)
  select u.id, 'joined', p_day
  from public.yui_users u
  where u.created_at >= (p_day::timestamp at time zone 'utc')
    and u.created_at < ((p_day + 1)::timestamp at time zone 'utc')
  on conflict do nothing;
  get diagnostics added = row_count;
  n := n + added;

  insert into public.yui_ledger (user_id, kind, day)
  select m.user_id, 'use_day', p_day
  from public.yui_messages m
  where m.sender = 'user'
    and m.created_at >= (p_day::timestamp at time zone 'utc')
    and m.created_at < ((p_day + 1)::timestamp at time zone 'utc')
  group by m.user_id
  on conflict do nothing;
  get diagnostics added = row_count;
  n := n + added;

  return n;
end;
$$;

-- Add contribution facts the database cannot see for itself: merged pull requests (from GitHub)
-- and feedback that shipped (from the ship log). Takes a JSON array of
-- {kind, day, ref, github?, user_id?, amount?}. Anything else is ignored.
create or replace function public.yui_ledger_add(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  insert into public.yui_ledger (user_id, github, kind, day, amount, ref)
  select nullif(r->>'user_id', '')::uuid,
         nullif(r->>'github', ''),
         r->>'kind',
         (r->>'day')::date,
         coalesce((r->>'amount')::integer, 1),
         coalesce(r->>'ref', '')
  from jsonb_array_elements(p_rows) as r
  where r->>'kind' in ('pr_merged', 'feedback_shipped')
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.yui_ledger_record_day(date) from public, anon, authenticated;
revoke all on function public.yui_ledger_add(jsonb) from public, anon, authenticated;
grant execute on function public.yui_ledger_record_day(date) to service_role;
grant execute on function public.yui_ledger_add(jsonb) to service_role;
