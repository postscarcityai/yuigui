-- The private ledger and the $U formula, v1 (OSS-7 step 2). Spec: spec/LEDGER.md, rendered at
-- yuigui.com/developers/ledger. Formula tables: yuigui.com/earn#formula.
--
-- Applied by hand to Yui's own Supabase project (yuigui, ref txuibjxyfpalzvpneqgp), never PROOF, never
-- `supabase db push`. Safe to run again: everything is create-if-missing or create-or-replace.
--
-- The ledger holds facts about use and contribution, never what anyone said. Rows are only added.
-- $U is not stored: yui_u_days / yui_u_balance turn the facts into points with the formula row in
-- yui_ledger_formula, so a new formula version re-scores everyone's whole history the same way.
-- No cash value. Not a token yet.

create table if not exists public.yui_ledger (
  id bigint generated always as identity primary key,
  -- A Yui account, or a GitHub handle for a pull request from someone not linked to one yet.
  user_id uuid references public.yui_users(id) on delete cascade,
  github text check (github is null or github ~ '^[A-Za-z0-9-]{1,39}$'),
  kind text not null,
  day date not null,
  -- A count for message, screen, job_done (per person per day). 1 for the rest. $U for a clawback.
  amount integer not null default 1 check (amount > 0),
  -- What the fact points at: a pull request (repo#number), a feedback or issue id. Never content.
  ref text not null default '' check (length(ref) <= 120),
  -- Pull request facts: the card size (S, M, L) read from the [KEY] in the title, null when unsized.
  size text check (size is null or size in ('S', 'M', 'L')),
  -- A clawback's reason, shown in the person's history.
  reason text check (reason is null or length(reason) <= 200),
  created_at timestamptz not null default now(),
  check (user_id is not null or github is not null)
);
alter table public.yui_ledger add column if not exists size text;
alter table public.yui_ledger add column if not exists reason text;
alter table public.yui_ledger drop constraint if exists yui_ledger_kind_check;
alter table public.yui_ledger add constraint yui_ledger_kind_check check (kind in (
  'joined', 'founding', 'use_day', 'message', 'screen', 'job_done',
  'pr_merged', 'feedback_sent', 'feedback_shipped', 'issue_accepted', 'issue_shipped', 'clawback'));

-- One fact, once. Running the recorder twice adds nothing.
create unique index if not exists yui_ledger_fact on public.yui_ledger
  (kind, coalesce(user_id::text, ''), coalesce(lower(github), ''), day, ref);
create index if not exists yui_ledger_user_idx on public.yui_ledger (user_id, day);

-- Rows are only ever added. (An account delete still removes its rows: that is a cascade, not an update.)
create or replace function public.yui_ledger_no_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'yui_ledger rows are never changed; add a clawback fact instead';
end $$;
drop trigger if exists yui_ledger_no_update on public.yui_ledger;
create trigger yui_ledger_no_update before update on public.yui_ledger
  for each row execute function public.yui_ledger_no_update();

-- Bots and the team's own accounts, kept by the recorder from ledger/excluded.json. They earn nothing.
create table if not exists public.yui_ledger_excluded (
  user_id uuid references public.yui_users(id) on delete cascade,
  github text check (github is null or github ~ '^[A-Za-z0-9-]{1,39}$'),
  check (user_id is not null or github is not null)
);
create unique index if not exists yui_ledger_excluded_user on public.yui_ledger_excluded (user_id) where user_id is not null;
create unique index if not exists yui_ledger_excluded_github on public.yui_ledger_excluded (lower(github)) where github is not null;

-- The formula, one row per version. The newest version scores everyone; an older one can be asked for.
create table if not exists public.yui_ledger_formula (
  version integer primary key,
  from_day date not null,
  note text not null default '',
  params jsonb not null check (jsonb_typeof(params) = 'object')
);

insert into public.yui_ledger_formula (version, from_day, note, params) values (0, date '2026-09-23',
  'PROP-5 formula v0. Use trickles in (a soft cap of 150 a day, then a tenth), streaks speed it up, building is worth far more.',
  $f${
    "message": 1, "screen": 2, "job_done": 5, "first_visit": 10,
    "soft_cap": 150, "over_cap_rate": 0.1,
    "streak": [
      {"days": 3,  "mult": 1.1,  "bonus": 0},
      {"days": 7,  "mult": 1.25, "bonus": 50},
      {"days": 30, "mult": 1.5,  "bonus": 300}
    ],
    "forgive_every_days": 7,
    "joined": 100, "founding": 400, "founding_until": null,
    "feedback_sent": 10, "feedback_shipped": 500,
    "issue_accepted": 200, "issue_shipped": 500,
    "pr_merged": {"S": 1000, "M": 3000, "L": 10000, "none": 1000}
  }$f$::jsonb)
on conflict (version) do nothing;

-- Private: no grants to anon or authenticated, and RLS on. A person reads their own rows (a policy for
-- the app's role); only the service role writes.
revoke all on public.yui_ledger, public.yui_ledger_excluded, public.yui_ledger_formula from public, anon, authenticated;
alter table public.yui_ledger enable row level security;
alter table public.yui_ledger_excluded enable row level security;
alter table public.yui_ledger_formula enable row level security;
grant select on public.yui_ledger to yui_user;
drop policy if exists yui_ledger_owner on public.yui_ledger;
create policy yui_ledger_owner on public.yui_ledger for select to yui_user using (user_id = public.yui_uid());
-- The formula is public (it is on /earn). Anyone signed in may read it.
grant select on public.yui_ledger_formula to yui_user;
drop policy if exists yui_ledger_formula_read on public.yui_ledger_formula;
create policy yui_ledger_formula_read on public.yui_ledger_formula for select to yui_user using (true);

-- Excluded accounts and handles ----------------------------------------------------------------------
create or replace function public.yui_ledger_is_excluded(p_user uuid, p_github text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.yui_ledger_excluded e
                 where (p_user is not null and e.user_id = p_user)
                    or (p_github is not null and lower(e.github) = lower(p_github)))
$$;

-- Replace the excluded list: {"users": [uuid...], "github": [handle...]}.
create or replace function public.yui_ledger_set_excluded(p jsonb) returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.yui_ledger_excluded where true;
  insert into public.yui_ledger_excluded (user_id)
    select (v)::uuid from jsonb_array_elements_text(coalesce(p->'users', '[]'::jsonb)) v
    where exists (select 1 from public.yui_users u where u.id = v::uuid)
    on conflict do nothing;
  insert into public.yui_ledger_excluded (github)
    select v from jsonb_array_elements_text(coalesce(p->'github', '[]'::jsonb)) v
    where v ~ '^[A-Za-z0-9-]{1,39}$' on conflict do nothing;
  select count(*) into n from public.yui_ledger_excluded;
  return n;
end $$;

-- What a person did on a day, as counts. Reads user_id, sender, kind, created_at, handled_at and, only
-- inside the database, a hash of body to tell a repeat from a new message. The hash is never stored.
--   messages: texts the person sent that an agent answered, a repeat the same day counted once
--   screens:  taps, picks and forms the person sent that an agent took, a repeat the same day counted once
--   jobs:     native jobs finished for the person
-- Answered = the host marked it handled, or an agent row follows within ten minutes.
create or replace function public.yui_ledger_day_counts(p_day date, p_user uuid default null)
returns table (user_id uuid, messages integer, screens integer, jobs integer)
language sql stable security definer set search_path = public as $$
  with win as (select (p_day::timestamp at time zone 'utc') as a, ((p_day + 1)::timestamp at time zone 'utc') as b),
  mine as (
    select m.user_id, m.kind, md5(m.body) as h
    from public.yui_messages m, win
    where m.sender = 'user' and m.created_at >= win.a and m.created_at < win.b
      and (p_user is null or m.user_id = p_user)
      and (m.handled_at is not null or exists (
        select 1 from public.yui_messages r
        where r.user_id = m.user_id and r.agent_id is not distinct from m.agent_id and r.sender = 'agent'
          and r.created_at >= m.created_at and r.created_at <= m.created_at + interval '10 minutes'))
  ),
  msg as (select user_id, count(distinct h)::integer as n from mine where kind = 'text' group by user_id),
  scr as (select user_id, count(distinct h)::integer as n from mine where kind = 'event' group by user_id),
  job as (
    select j.user_id, count(*)::integer as n from public.yui_native_jobs j, win
    where j.status = 'done' and j.finished_at >= win.a and j.finished_at < win.b
      and (p_user is null or j.user_id = p_user)
    group by j.user_id)
  select u.user_id, coalesce(msg.n, 0), coalesce(scr.n, 0), coalesce(job.n, 0)
  from (select user_id from msg union select user_id from scr union select user_id from job) u
  left join msg using (user_id) left join scr using (user_id) left join job using (user_id)
  where not public.yui_ledger_is_excluded(u.user_id, null)
$$;

-- The facts one UTC day would add: who joined (and who is a founding user), and what each person used.
-- A day of use is at least one answered message or screen; streaks run on those days.
create or replace function public.yui_ledger_day_facts(p_day date)
returns table (user_id uuid, kind text, amount integer)
language sql stable security definer set search_path = public as $$
  with fz as (select nullif(params->>'founding_until', '')::date as until_day
              from public.yui_ledger_formula order by version desc limit 1),
  joiners as (
    select u.id from public.yui_users u
    where u.created_at >= (p_day::timestamp at time zone 'utc')
      and u.created_at < ((p_day + 1)::timestamp at time zone 'utc')
      and not public.yui_ledger_is_excluded(u.id, null)),
  c as (select * from public.yui_ledger_day_counts(p_day))
  select id, 'joined', 1 from joiners
  union all
  -- A founding user joined before Yui leaves TestFlight (founding_until in the formula, null while open).
  select id, 'founding', 1 from joiners, fz where fz.until_day is null or p_day <= fz.until_day
  union all select c.user_id, 'message', c.messages from c where c.messages > 0
  union all select c.user_id, 'screen', c.screens from c where c.screens > 0
  union all select c.user_id, 'job_done', c.jobs from c where c.jobs > 0
  union all select c.user_id, 'use_day', 1 from c where c.messages + c.screens > 0
$$;

-- What recording a day would add, by kind, and writes nothing: the dry run.
create or replace function public.yui_ledger_preview_day(p_day date)
returns table (kind text, n integer, amount bigint)
language sql stable security definer set search_path = public as $$
  select f.kind, count(*)::integer, sum(f.amount)::bigint
  from public.yui_ledger_day_facts(p_day) f
  where not exists (select 1 from public.yui_ledger l
                    where l.kind = f.kind and l.user_id = f.user_id and l.day = p_day and l.ref = '')
  group by f.kind
$$;

-- Record one UTC day. A second run adds nothing.
create or replace function public.yui_ledger_record_day(p_day date)
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.yui_ledger (user_id, kind, day, amount)
  select f.user_id, f.kind, p_day, f.amount from public.yui_ledger_day_facts(p_day) f
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- Add facts the database cannot see for itself. Takes a JSON array of
-- {kind, day, ref, github?, user_id?, amount?, size?, reason?}. A clawback needs a user and a reason.
create or replace function public.yui_ledger_add(p_rows jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.yui_ledger (user_id, github, kind, day, amount, ref, size, reason)
  select nullif(r->>'user_id', '')::uuid, nullif(r->>'github', ''), r->>'kind', (r->>'day')::date,
         coalesce((r->>'amount')::integer, 1), coalesce(r->>'ref', ''),
         nullif(upper(r->>'size'), ''), nullif(left(r->>'reason', 200), '')
  from jsonb_array_elements(p_rows) as r
  where r->>'kind' in ('pr_merged', 'feedback_sent', 'feedback_shipped', 'issue_accepted', 'issue_shipped', 'clawback')
    and (r->>'kind' <> 'clawback' or (nullif(r->>'user_id', '') is not null and coalesce(r->>'reason', '') <> ''))
    and (nullif(r->>'user_id', '') is not null or nullif(r->>'github', '') is not null)
    and not public.yui_ledger_is_excluded(nullif(r->>'user_id', '')::uuid, nullif(r->>'github', ''))
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- The formula ---------------------------------------------------------------------------------------
-- One person's days, scored. Facts = the stored ledger rows, plus today's use read live (today is not
-- on the ledger until the recorder settles it overnight). p_version defaults to the newest formula.
-- Per day: use = (messages x1 + screens x2 + jobs x5 + 10 for the first visit), full speed to the soft cap
-- then a tenth, times the streak multiplier; plus the streak bonus on the day a streak reaches 7 or 30;
-- plus building (feedback, issues, pull requests), joining and founding; minus clawbacks.
-- A streak is a run of days with an answered message or a screen. One missed day in any 7 is forgiven
-- and does not add to the length. Streaks only speed up use, never building.
create or replace function public.yui_u_days(p_user uuid, p_version integer default null)
returns table (day date, messages integer, screens integer, jobs integer, streak integer, mult numeric,
               use_u integer, bonus_u integer, build_u integer, clawback_u integer, total_u integer)
language plpgsql stable security definer set search_path = public as $$
declare
  fz jsonb := (select f.params from public.yui_ledger_formula f
               where f.version = coalesce(p_version, (select max(version) from public.yui_ledger_formula)));
  r record;
  prev_used date;
  last_forgiven date;
  cur_streak integer := 0;
  gap integer;
  base numeric;
  capped numeric;
  m numeric;
  bonus integer;
  s jsonb;
  used boolean;
begin
  if fz is null or p_user is null or public.yui_ledger_is_excluded(p_user, null) then return; end if;

  for r in
    with facts as (
      select l.day, l.kind, l.amount, l.size from public.yui_ledger l where l.user_id = p_user
      union all
      select current_date, 'message', c.messages, null from public.yui_ledger_day_counts(current_date, p_user) c
        where c.messages > 0 and not exists (select 1 from public.yui_ledger x where x.user_id = p_user and x.day = current_date and x.kind = 'message')
      union all
      select current_date, 'screen', c.screens, null from public.yui_ledger_day_counts(current_date, p_user) c
        where c.screens > 0 and not exists (select 1 from public.yui_ledger x where x.user_id = p_user and x.day = current_date and x.kind = 'screen')
      union all
      select current_date, 'job_done', c.jobs, null from public.yui_ledger_day_counts(current_date, p_user) c
        where c.jobs > 0 and not exists (select 1 from public.yui_ledger x where x.user_id = p_user and x.day = current_date and x.kind = 'job_done')
    )
    select f.day,
      coalesce(sum(f.amount) filter (where f.kind = 'message'), 0)::integer as msgs,
      coalesce(sum(f.amount) filter (where f.kind = 'screen'), 0)::integer as scrs,
      coalesce(sum(f.amount) filter (where f.kind = 'job_done'), 0)::integer as jbs,
      (coalesce(sum(f.amount) filter (where f.kind = 'joined'), 0) * (fz->>'joined')::numeric
        + coalesce(sum(f.amount) filter (where f.kind = 'founding'), 0) * (fz->>'founding')::numeric
        + coalesce(sum(f.amount) filter (where f.kind = 'feedback_sent'), 0) * (fz->>'feedback_sent')::numeric
        + coalesce(sum(f.amount) filter (where f.kind = 'feedback_shipped'), 0) * (fz->>'feedback_shipped')::numeric
        + coalesce(sum(f.amount) filter (where f.kind = 'issue_accepted'), 0) * (fz->>'issue_accepted')::numeric
        + coalesce(sum(f.amount) filter (where f.kind = 'issue_shipped'), 0) * (fz->>'issue_shipped')::numeric
        + coalesce(sum(f.amount * coalesce((fz->'pr_merged'->>coalesce(f.size, 'none'))::numeric, 0)) filter (where f.kind = 'pr_merged'), 0)
      )::integer as built,
      coalesce(sum(f.amount) filter (where f.kind = 'clawback'), 0)::integer as claw
    from facts f group by f.day order by f.day
  loop
    used := r.msgs + r.scrs > 0;
    m := 1; bonus := 0;
    if used then
      if prev_used is null then
        cur_streak := 1;
      else
        gap := r.day - prev_used - 1;
        if gap = 0 then
          cur_streak := cur_streak + 1;
        elsif gap = 1 and (last_forgiven is null or (r.day - 1) - last_forgiven >= (fz->>'forgive_every_days')::integer) then
          last_forgiven := r.day - 1;
          cur_streak := cur_streak + 1;
        else
          cur_streak := 1;
        end if;
      end if;
      prev_used := r.day;
      for s in select e from jsonb_array_elements(fz->'streak') e order by (e->>'days')::integer loop
        if cur_streak >= (s->>'days')::integer then m := (s->>'mult')::numeric; end if;
        if cur_streak = (s->>'days')::integer then bonus := bonus + (s->>'bonus')::integer; end if;
      end loop;
      base := r.msgs * (fz->>'message')::numeric + r.scrs * (fz->>'screen')::numeric
            + r.jbs * (fz->>'job_done')::numeric + (fz->>'first_visit')::numeric;
      capped := least(base, (fz->>'soft_cap')::numeric)
              + greatest(base - (fz->>'soft_cap')::numeric, 0) * (fz->>'over_cap_rate')::numeric;
    else
      -- jobs finished on a day with no message or screen are use too, but no first visit, no streak.
      base := r.jbs * (fz->>'job_done')::numeric;
      capped := least(base, (fz->>'soft_cap')::numeric)
              + greatest(base - (fz->>'soft_cap')::numeric, 0) * (fz->>'over_cap_rate')::numeric;
    end if;
    day := r.day; messages := r.msgs; screens := r.scrs; jobs := r.jbs;
    streak := case when used then cur_streak else 0 end; mult := m;
    use_u := round(capped * m)::integer; bonus_u := bonus; build_u := r.built; clawback_u := -r.claw;
    total_u := use_u + bonus_u + build_u + clawback_u;
    return next;
  end loop;
end $$;

-- The balance: the days added up, never below zero. Includes today's use, read live.
create or replace function public.yui_u_balance(p_user uuid, p_version integer default null)
returns bigint
language sql stable security definer set search_path = public as $$
  select greatest(coalesce(sum(d.total_u), 0), 0)::bigint from public.yui_u_days(p_user, p_version) d
$$;

-- The live read path (YUI-210, the site): the caller's own total, today and recent days. The app calls
-- it with each turn; today is read live, so the number moves the moment an agent answers, and the
-- ledger settles overnight. Own rows only: the caller is the token's sub, never a parameter.
create or replace function public.yui_my_u(p_days integer default 30)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := public.yui_uid();
  fz jsonb := (select params from public.yui_ledger_formula order by version desc limit 1);
  ver integer := (select max(version) from public.yui_ledger_formula);
  total bigint;
  today_row record;
  hist jsonb;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  select coalesce(sum(d.total_u), 0) into total from public.yui_u_days(uid) d;
  select * into today_row from public.yui_u_days(uid) d where d.day = current_date;
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', h.day, 'messages', h.messages, 'screens', h.screens, 'jobs', h.jobs,
      'streak', h.streak, 'earned', h.total_u) order by h.day desc), '[]'::jsonb)
    into hist from (select * from public.yui_u_days(uid) d order by d.day desc limit least(greatest(p_days, 1), 90)) h;
  return jsonb_build_object(
    'version', ver,
    'total', greatest(total, 0),
    'today', coalesce(today_row.total_u, 0),
    'soft_cap', (fz->>'soft_cap')::integer,
    'streak', coalesce((select d.streak from public.yui_u_days(uid) d where d.streak > 0 order by d.day desc limit 1), 0),
    'mult', coalesce((select d.mult from public.yui_u_days(uid) d where d.streak > 0 order by d.day desc limit 1), 1),
    'history', hist,
    'note', 'No cash value. Not a token yet.');
end $$;

-- Grants. The functions that write, and the scorers, are for the service role. Only yui_my_u is the app's.
revoke all on function public.yui_ledger_is_excluded(uuid, text) from public, anon, authenticated;
revoke all on function public.yui_ledger_set_excluded(jsonb) from public, anon, authenticated;
revoke all on function public.yui_ledger_day_counts(date, uuid) from public, anon, authenticated;
revoke all on function public.yui_ledger_day_facts(date) from public, anon, authenticated;
revoke all on function public.yui_ledger_preview_day(date) from public, anon, authenticated;
revoke all on function public.yui_ledger_record_day(date) from public, anon, authenticated;
revoke all on function public.yui_ledger_add(jsonb) from public, anon, authenticated;
revoke all on function public.yui_u_days(uuid, integer) from public, anon, authenticated;
revoke all on function public.yui_u_balance(uuid, integer) from public, anon, authenticated;
revoke all on function public.yui_my_u(integer) from public, anon, authenticated;
grant execute on function public.yui_ledger_is_excluded(uuid, text) to service_role;
grant execute on function public.yui_ledger_set_excluded(jsonb) to service_role;
grant execute on function public.yui_ledger_day_counts(date, uuid) to service_role;
grant execute on function public.yui_ledger_day_facts(date) to service_role;
grant execute on function public.yui_ledger_preview_day(date) to service_role;
grant execute on function public.yui_ledger_record_day(date) to service_role;
grant execute on function public.yui_ledger_add(jsonb) to service_role;
grant execute on function public.yui_u_days(uuid, integer) to service_role;
grant execute on function public.yui_u_balance(uuid, integer) to service_role;
grant execute on function public.yui_my_u(integer) to yui_user, service_role;
