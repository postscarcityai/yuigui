-- SITE-89: votes on proposals (yuigui.com/proposals). Two choices, "Yes, build it" and "Not yet", and an
-- optional one-line why. No login, no email. One row per browser per proposal: the browser keeps an
-- anonymous id in localStorage, the vote can be changed, and a changed vote replaces the row.
-- Belongs in the app repo as supabase/migrations/<timestamp>_yui_proposal_votes.sql, beside yui_site_chats.
--
-- Server only, like the chat tables: RLS on, no policies, no grants. Only the service role (the site's
-- /api/proposals/vote route) reads or writes it. IPs are never stored, only a salted hash, which the
-- route uses to cap how many different browsers one address can vote from in an hour.
create table if not exists public.yui_proposal_votes (
  proposal_id text not null check (proposal_id ~ '^PROP-[0-9]{1,4}$'),
  voter_id uuid not null,
  vote text not null check (vote in ('yes', 'not_yet')),
  why text check (why is null or char_length(why) <= 200),
  ip_hash text check (char_length(ip_hash) <= 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (proposal_id, voter_id)
);
create index if not exists yui_proposal_votes_ip_idx on public.yui_proposal_votes (ip_hash, updated_at);
create index if not exists yui_proposal_votes_why_idx on public.yui_proposal_votes (proposal_id, updated_at desc) where why is not null;

revoke all on public.yui_proposal_votes from public, anon, authenticated;
alter table public.yui_proposal_votes enable row level security;

create or replace function public.yui_proposal_votes_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists yui_proposal_votes_touch on public.yui_proposal_votes;
create trigger yui_proposal_votes_touch before update on public.yui_proposal_votes
  for each row execute function public.yui_proposal_votes_touch();
