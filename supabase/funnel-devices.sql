-- Count devices, not page loads. A device is one browser: its visitor id is kept in localStorage,
-- so reopening the page or video makes a new visit but the same device.
-- Rows from before visitor ids were recorded have no device id, so each of those visits counts as its own device.
-- Kind 'devices' is new. 'all' (visits) and the customer / business split are kept as before.
-- Apply after the visitor-journey migration (it adds funnel_events.visitor_id).
create or replace function public.funnel_counts()
returns table (stage_name text, kind_name text, visit_count bigint)
language sql
security definer
set search_path = public
as $$
  select e.stage, 'all'::text, count(distinct e.visit_id)
  from public.funnel_events e
  group by e.stage
  union all
  select e.stage, 'devices'::text, count(distinct coalesce(e.visitor_id, e.visit_id))
  from public.funnel_events e
  group by e.stage
  union all
  select e.stage, e.kind, count(distinct coalesce(e.visitor_id, e.visit_id))
  from public.funnel_events e
  where e.kind <> ''
  group by e.stage, e.kind;
$$;
