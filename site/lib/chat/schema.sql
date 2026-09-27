-- SITE-64: the site chat. Yui in the bubble on yuigui.com talks to visitors with no account and
-- keeps every chat, so the team can read what visitors want. Belongs in the app repo as
-- supabase/migrations/<timestamp>_yui_site_chats.sql, in the yuigui project, beside yui_invites.
--
--   yui_site_chats          one row per chat: where it started, the turn count, whether the
--                           Turnstile check passed, and contact details if the visitor left them
--   yui_site_chat_messages  every visible message, both sides, and which tools a reply used
--   yui_site_chat_notes     what Yui wrote down: needs, features, bugs, questions, confusion, praise
--
-- Server only, like yui_invites: RLS on, no policies, no grants. Only the service role (the site's
-- /api/chat route) reads or writes them; never anon, authenticated, yui_user or yui_connector.
-- IPs are never stored, only a salted hash (lib/chat/session.mjs). Chats are kept so the team can
-- learn from them; a visitor who asks gets theirs deleted. yui_site_chats_prune (below) is there for
-- a retention window if one is chosen, and nothing schedules it yet.
create table if not exists public.yui_site_chats (
  id uuid primary key,
  turns int not null default 0 check (turns between 0 and 1000),
  first_path text check (char_length(first_path) <= 300),
  last_path text check (char_length(last_path) <= 300),
  ip_hash text check (char_length(ip_hash) <= 64),
  user_agent text check (char_length(user_agent) <= 500),
  referrer text check (char_length(referrer) <= 500),
  utm text check (char_length(utm) <= 500),
  verified_at timestamptz,
  first_name text check (char_length(first_name) <= 80),
  last_name text check (char_length(last_name) <= 80),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 32),
  contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists yui_site_chats_created_idx on public.yui_site_chats (created_at);
create index if not exists yui_site_chats_email_idx on public.yui_site_chats (lower(email)) where email is not null;

create table if not exists public.yui_site_chat_messages (
  id bigint generated always as identity primary key,
  chat_id uuid not null references public.yui_site_chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  path text check (char_length(path) <= 300),
  tools jsonb check (tools is null or (jsonb_typeof(tools) = 'array' and pg_column_size(tools) <= 8192)),
  created_at timestamptz not null default now()
);
create index if not exists yui_site_chat_messages_chat_idx on public.yui_site_chat_messages (chat_id, id);

create table if not exists public.yui_site_chat_notes (
  id bigint generated always as identity primary key,
  chat_id uuid not null references public.yui_site_chats(id) on delete cascade,
  kind text not null check (kind in ('need', 'feature', 'bug', 'question', 'confusion', 'praise', 'other')),
  text text not null check (char_length(text) <= 1000),
  quote text check (char_length(quote) <= 500),
  path text check (char_length(path) <= 300),
  created_at timestamptz not null default now()
);
create index if not exists yui_site_chat_notes_kind_idx on public.yui_site_chat_notes (kind, created_at);
create index if not exists yui_site_chat_notes_chat_idx on public.yui_site_chat_notes (chat_id);

revoke all on public.yui_site_chats, public.yui_site_chat_messages, public.yui_site_chat_notes from public, anon, authenticated;
alter table public.yui_site_chats enable row level security;
alter table public.yui_site_chat_messages enable row level security;
alter table public.yui_site_chat_notes enable row level security;

create or replace function public.yui_site_chats_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists yui_site_chats_touch on public.yui_site_chats;
create trigger yui_site_chats_touch before update on public.yui_site_chats
  for each row execute function public.yui_site_chats_touch();

-- For a retention window, when one is chosen: old chats with no contact details, with their messages and notes.
create or replace function public.yui_site_chats_prune() returns void
language sql set search_path = '' as $$
  delete from public.yui_site_chats where email is null and updated_at < now() - interval '180 days';
$$;
revoke all on function public.yui_site_chats_prune() from public, anon, authenticated;
