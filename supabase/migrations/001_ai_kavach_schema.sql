-- ============================================================
-- AI Kavach — Supabase Schema
-- Defensive SOC prototype — 100% synthetic data
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ---- 1. profiles (extends auth.users) ----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('analyst','officer','command','admin')) default 'analyst',
  org_unit_id uuid,
  created_at timestamptz default now()
);

-- ---- 2. org_units ----
create table if not exists public.org_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Add foreign key for profiles -> org_units
alter table public.profiles
  add constraint profiles_org_unit_fk
  foreign key (org_unit_id) references public.org_units(id);

-- ---- 3. assets ----
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  hostname text not null,
  ip_address text,
  asset_type text,
  org_unit_id uuid references public.org_units(id),
  created_at timestamptz default now()
);

-- ---- 4. synthetic_users ----
create table if not exists public.synthetic_users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  org_unit_id uuid references public.org_units(id),
  baseline_profile jsonb,
  created_at timestamptz default now()
);

-- ---- 5. user_behaviour_events ----
create table if not exists public.user_behaviour_events (
  id uuid primary key default gen_random_uuid(),
  synthetic_user_id uuid references public.synthetic_users(id) on delete cascade,
  event_type text,
  event_time timestamptz not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_ube_user_time
  on public.user_behaviour_events (synthetic_user_id, event_time);

-- ---- 6. network_events ----
create table if not exists public.network_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete cascade,
  event_type text,
  event_time timestamptz not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_ne_asset_time
  on public.network_events (asset_id, event_time);

-- ---- 7. risk_scores ----
create table if not exists public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  synthetic_user_id uuid references public.synthetic_users(id),
  asset_id uuid references public.assets(id),
  score int check (score between 0 and 100),
  risk_level text check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')),
  computed_at timestamptz default now()
);

create index if not exists idx_rs_user on public.risk_scores (synthetic_user_id);
create index if not exists idx_rs_asset on public.risk_scores (asset_id);
create index if not exists idx_rs_time on public.risk_scores (computed_at);

-- ---- 8. ai_analysis ----
create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  risk_score_id uuid references public.risk_scores(id) on delete cascade,
  raw_response jsonb,
  confidence int,
  created_at timestamptz default now()
);

-- ---- 9. alerts ----
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  risk_score_id uuid references public.risk_scores(id),
  severity text check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text check (status in ('new','acknowledged','dismissed')) default 'new',
  created_at timestamptz default now()
);

create index if not exists idx_alerts_severity on public.alerts (severity);
create index if not exists idx_alerts_status on public.alerts (status);

-- ---- 10. incidents ----
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(id),
  assigned_to uuid references public.profiles(id),
  status text check (status in ('open','investigating','resolved','false_positive')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_incidents_status on public.incidents (status);

-- ---- 11. incident_notes ----
create table if not exists public.incident_notes (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_in_incident on public.incident_notes (incident_id);

-- ---- 12. audit_log ----
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text,
  target_table text,
  target_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_al_actor on public.audit_log (actor_id);
create index if not exists idx_al_time on public.audit_log (created_at);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.org_units enable row level security;
alter table public.assets enable row level security;
alter table public.synthetic_users enable row level security;
alter table public.user_behaviour_events enable row level security;
alter table public.network_events enable row level security;
alter table public.risk_scores enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.alerts enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_notes enable row level security;
alter table public.audit_log enable row level security;

-- ---- profiles policies ----
-- Users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admin can read all profiles
create policy "profiles_admin_select_all" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Service role inserts profiles on signup (via trigger or edge function)
create policy "profiles_insert_authed" on public.profiles
  for insert with check (auth.uid() = id);

-- ---- org_units policies ----
create policy "org_units_select_authed" on public.org_units
  for select using (auth.role() = 'authenticated');

-- ---- assets policies ----
-- Analysts/officers see org-scoped; command sees all
create policy "assets_select_org" on public.assets
  for select using (
    auth.role() = 'authenticated'
  );

-- ---- synthetic_users policies ----
create policy "synthetic_users_select_authed" on public.synthetic_users
  for select using (auth.role() = 'authenticated');

-- ---- user_behaviour_events policies ----
create policy "ube_select_authed" on public.user_behaviour_events
  for select using (auth.role() = 'authenticated');

-- ---- network_events policies ----
create policy "ne_select_authed" on public.network_events
  for select using (auth.role() = 'authenticated');

-- ---- risk_scores policies ----
-- Only service role (admin) may insert; authenticated users read
create policy "rs_select_authed" on public.risk_scores
  for select using (auth.role() = 'authenticated');

-- ---- ai_analysis policies ----
-- Only service role may insert; authenticated users read
create policy "aa_select_authed" on public.ai_analysis
  for select using (auth.role() = 'authenticated');

-- ---- alerts policies ----
create policy "alerts_select_authed" on public.alerts
  for select using (auth.role() = 'authenticated');

create policy "alerts_update_analyst_officer" on public.alerts
  for update using (
    auth.role() = 'authenticated'
  );

-- ---- incidents policies ----
create policy "incidents_select_authed" on public.incidents
  for select using (auth.role() = 'authenticated');

create policy "incidents_update_analyst_officer" on public.incidents
  for update using (
    auth.role() = 'authenticated'
  );

create policy "incidents_insert_authed" on public.incidents
  for insert with check (auth.role() = 'authenticated');

-- ---- incident_notes policies ----
create policy "incident_notes_select_authed" on public.incident_notes
  for select using (auth.role() = 'authenticated');

create policy "incident_notes_insert_authed" on public.incident_notes
  for insert with check (auth.role() = 'authenticated');

-- ---- audit_log policies ----
-- Insert for any authenticated user; read for admin/officer only
create policy "audit_log_insert_authed" on public.audit_log
  for insert with check (auth.role() = 'authenticated');

create policy "audit_log_select_admin_officer" on public.audit_log
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','officer')
    )
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Seed data: org units
-- ============================================================

insert into public.org_units (id, name) values
  ('a0000000-0000-0000-0000-000000000001', 'Security Operations'),
  ('a0000000-0000-0000-0000-000000000002', 'Executive'),
  ('a0000000-0000-0000-0000-000000000003', 'Engineering'),
  ('a0000000-0000-0000-0000-000000000004', 'Finance')
on conflict (id) do nothing;
