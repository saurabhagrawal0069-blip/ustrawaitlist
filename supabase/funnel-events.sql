-- Visitor funnel: landed -> played video -> opened the form -> submitted it.
-- Anonymous: one row per visit, step and kind. No name, phone, email or IP is stored.
-- Already applied to the ustrawaitlist project as migration "funnel_events".
create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  visit_id text not null,
  stage text not null check (stage in ('view', 'play', 'join', 'submit')),
  kind text not null default '' check (kind in ('', 'customer', 'business')),
  created_at timestamptz not null default now(),
  unique (visit_id, stage, kind)
);

-- No policies: only the server (service role) reads and writes this table.
alter table public.funnel_events enable row level security;

-- Repeats of the same step in the same visit are ignored.
create or replace function public.record_funnel_event(_visit_id text, _stage text, _kind text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.funnel_events (visit_id, stage, kind)
  values (_visit_id, _stage, coalesce(_kind, ''))
  on conflict (visit_id, stage, kind) do nothing;
$$;

-- Distinct visitors per step ('all'), and per step by kind ('customer' / 'business').
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
  select e.stage, e.kind, count(*)
  from public.funnel_events e
  where e.kind <> ''
  group by e.stage, e.kind;
$$;

revoke execute on function public.record_funnel_event(text, text, text) from public, anon, authenticated;
revoke execute on function public.funnel_counts() from public, anon, authenticated;
