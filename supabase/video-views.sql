-- Anonymous promo-video viewing data. One row per visit; no name, phone or email is stored.
-- Already applied to the ustrawaitlist project as migration "video_views_tracking".
create table if not exists public.video_views (
  visit_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  plays integer not null default 0,
  watched_seconds numeric not null default 0,
  max_position numeric not null default 0,
  video_duration numeric,
  country text,
  device text
);

-- No policies: only the server (service role) reads and writes this table.
alter table public.video_views enable row level security;

-- Values only ever go up, so a late or repeated heartbeat cannot lower them.
create or replace function public.record_video_view(
  _visit_id text,
  _plays integer,
  _watched numeric,
  _position numeric,
  _duration numeric,
  _country text,
  _device text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.video_views (visit_id, plays, watched_seconds, max_position, video_duration, country, device)
  values (_visit_id, _plays, _watched, _position, _duration, _country, _device)
  on conflict (visit_id) do update set
    last_seen = now(),
    plays = greatest(public.video_views.plays, excluded.plays),
    watched_seconds = greatest(public.video_views.watched_seconds, excluded.watched_seconds),
    max_position = greatest(public.video_views.max_position, excluded.max_position),
    video_duration = coalesce(excluded.video_duration, public.video_views.video_duration),
    country = coalesce(public.video_views.country, excluded.country),
    device = coalesce(public.video_views.device, excluded.device);
$$;

revoke execute on function public.record_video_view(text, integer, numeric, numeric, numeric, text, text) from public, anon, authenticated;
