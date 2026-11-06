-- Visitor journey: links a waitlist registration to the page visits and video plays from the same browser.
-- The browser keeps a random id in localStorage (key "ustra-vid"). It is stored on the registration and on
-- each tracking row. No name, phone number or IP address is added to the tracking tables.
--
-- Applied to the ustrawaitlist project as migration "visitor_journey".
-- The older 3-argument record_funnel_event and 7-argument record_video_view are kept for now, so the live site
-- keeps working until the code that sends visitor_id is deployed. The cleanup at the end removes them.

alter table public.customers add column if not exists visitor_id text;
alter table public.businesses add column if not exists visitor_id text;
alter table public.funnel_events add column if not exists visitor_id text;
alter table public.video_views add column if not exists visitor_id text;

create index if not exists customers_visitor_id_idx on public.customers (visitor_id);
create index if not exists businesses_visitor_id_idx on public.businesses (visitor_id);
create index if not exists funnel_events_visitor_id_idx on public.funnel_events (visitor_id);
create index if not exists video_views_visitor_id_idx on public.video_views (visitor_id);

-- Funnel step: same rules as before, plus the browser's visitor id.
create or replace function public.record_funnel_event(_visit_id text, _stage text, _kind text, _visitor_id text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.funnel_events (visit_id, stage, kind, visitor_id)
  values (_visit_id, _stage, coalesce(_kind, ''), _visitor_id)
  on conflict (visit_id, stage, kind) do nothing;
$$;

-- Video view: same rules as before (values only go up), plus the visitor id. The first id seen is kept.
create or replace function public.record_video_view(
  _visit_id text,
  _plays integer,
  _watched numeric,
  _position numeric,
  _duration numeric,
  _country text,
  _device text,
  _visitor_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.video_views (visit_id, plays, watched_seconds, max_position, video_duration, country, device, visitor_id)
  values (_visit_id, _plays, _watched, _position, _duration, _country, _device, _visitor_id)
  on conflict (visit_id) do update set
    last_seen = now(),
    plays = greatest(public.video_views.plays, excluded.plays),
    watched_seconds = greatest(public.video_views.watched_seconds, excluded.watched_seconds),
    max_position = greatest(public.video_views.max_position, excluded.max_position),
    video_duration = coalesce(excluded.video_duration, public.video_views.video_duration),
    country = coalesce(public.video_views.country, excluded.country),
    device = coalesce(public.video_views.device, excluded.device),
    visitor_id = coalesce(public.video_views.visitor_id, excluded.visitor_id);
$$;

-- One row per browser: first and last activity, number of page visits, whether it opened the form,
-- and total video plays and seconds watched. Only browsers that have a visitor id are included.
create or replace function public.visitor_journeys()
returns table (
  visitor_id text,
  first_seen timestamptz,
  last_seen timestamptz,
  visits bigint,
  opened_form boolean,
  plays bigint,
  watched_seconds numeric
)
language sql
security definer
set search_path = public
as $$
  with page as (
    select e.visitor_id as vid,
           min(e.created_at) as first_at,
           max(e.created_at) as last_at,
           count(distinct e.visit_id) as page_visits,
           bool_or(e.stage = 'join') as form_opened
    from public.funnel_events e
    where e.visitor_id is not null
    group by e.visitor_id
  ),
  video as (
    select v.visitor_id as vid,
           min(v.first_seen) as first_at,
           max(v.last_seen) as last_at,
           sum(v.plays)::bigint as total_plays,
           sum(v.watched_seconds) as total_watched
    from public.video_views v
    where v.visitor_id is not null
    group by v.visitor_id
  )
  select coalesce(p.vid, v.vid),
         least(p.first_at, v.first_at),
         greatest(p.last_at, v.last_at),
         coalesce(p.page_visits, 0),
         coalesce(p.form_opened, false),
         coalesce(v.total_plays, 0),
         coalesce(v.total_watched, 0)
  from page p
  full join video v on v.vid = p.vid;
$$;

revoke execute on function public.record_funnel_event(text, text, text, text) from public, anon, authenticated;
revoke execute on function public.record_video_view(text, integer, numeric, numeric, numeric, text, text, text) from public, anon, authenticated;
revoke execute on function public.visitor_journeys() from public, anon, authenticated;

-- Cleanup, run only after the new code is live on the site:
-- drop function if exists public.record_funnel_event(text, text, text);
-- drop function if exists public.record_video_view(text, integer, numeric, numeric, numeric, text, text);
