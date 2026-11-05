-- Run this SQL in Supabase SQL Editor (once). It adds video view tracking.
-- Each row is one small event from a visitor's browser. No names, emails or phone numbers are stored.

create table if not exists public.video_events (
  id bigint generated always as identity primary key,
  session_id text not null check (char_length(session_id) between 8 and 64),
  clip_id text not null check (char_length(clip_id) <= 64),
  event text not null check (event in ('start','unmute','q25','q50','q75','complete','stop')),
  position_seconds numeric(8,2) not null default 0 check (position_seconds >= 0),
  watched_seconds numeric(8,2) not null default 0 check (watched_seconds >= 0),
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists video_events_ip_created_idx on public.video_events (ip_hash, created_at);
create index if not exists video_events_clip_idx on public.video_events (clip_id, session_id);

-- Enable RLS with no public policies. The server API uses the service-role key.
alter table public.video_events enable row level security;

-- Summary per clip, used by the admin page.
-- A "viewer" is one browser session that played the clip at least once.
create or replace function public.video_clip_stats()
returns table (
  clip_id text,
  viewers bigint,
  unmuted bigint,
  completed bigint,
  avg_watched_seconds numeric
)
language sql
stable
as $$
  with per_session as (
    select
      e.clip_id,
      e.session_id,
      max(e.watched_seconds) as watched,
      bool_or(e.event = 'unmute') as unmuted,
      bool_or(e.event = 'complete') as completed
    from public.video_events e
    group by e.clip_id, e.session_id
  )
  select
    clip_id,
    count(*) as viewers,
    count(*) filter (where unmuted) as unmuted,
    count(*) filter (where completed) as completed,
    round(avg(watched), 1) as avg_watched_seconds
  from per_session
  group by clip_id
  order by clip_id;
$$;

-- Only the server (service role) may run the summary.
revoke execute on function public.video_clip_stats() from public, anon, authenticated;
grant execute on function public.video_clip_stats() to service_role;
