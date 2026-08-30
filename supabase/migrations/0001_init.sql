create type if not exists life_area as enum ('career', 'health', 'relationships', 'finances', 'growth', 'purpose');
create type if not exists audit_status as enum ('in_progress', 'completed');

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_token text not null default gen_random_uuid(),
  status audit_status not null default 'in_progress',
  email text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table audits enable row level security;
drop policy if exists "audits_v1_read" on audits;
create policy "audits_v1_read" on audits for select using (true);
drop policy if exists "audits_v1_write" on audits;
create policy "audits_v1_write" on audits for all using (true) with check (true);

create table if not exists area_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  audit_id uuid not null references audits(id) on delete cascade,
  area life_area not null,
  now_score numeric not null check (now_score between 1 and 10),
  want_score numeric not null check (want_score between 1 and 10),
  stress_level numeric not null check (stress_level between 1 and 10),
  awareness_level numeric not null check (awareness_level between 1 and 10),
  gap_score numeric generated always as (want_score - now_score) stored,
  stress_flag boolean generated always as (stress_level >= 7) stored,
  awareness_flag boolean generated always as (awareness_level <= 4) stored,
  created_at timestamptz not null default now(),
  unique (audit_id, area)
);
alter table area_responses enable row level security;
drop policy if exists "area_responses_v1_read" on area_responses;
create policy "area_responses_v1_read" on area_responses for select using (true);
drop policy if exists "area_responses_v1_write" on area_responses;
create policy "area_responses_v1_write" on area_responses for all using (true) with check (true);

create table if not exists gap_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  audit_id uuid not null references audits(id) on delete cascade,
  ranked_areas jsonb not null,
  total_gap numeric not null default 0,
  ai_summary text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed',
  created_at timestamptz not null default now(),
  unique (audit_id)
);
alter table gap_maps enable row level security;
drop policy if exists "gap_maps_v1_read" on gap_maps;
create policy "gap_maps_v1_read" on gap_maps for select using (true);
drop policy if exists "gap_maps_v1_write" on gap_maps;
create policy "gap_maps_v1_write" on gap_maps for all using (true) with check (true);

insert into audits (id, status, email, completed_at) values
  ('a0000000-0000-4000-8000-000000000001', 'completed', 'sarah.demo@example.com', '2024-11-01T10:30:00Z'),
  ('a0000000-0000-4000-8000-000000000002', 'completed', 'megan.demo@example.com', '2024-11-02T14:15:00Z'),
  ('a0000000-0000-4000-8000-000000000003', 'completed', 'priya.demo@example.com', '2024-11-03T09:45:00Z')
  on conflict (id) do nothing;

insert into area_responses (audit_id, area, now_score, want_score, stress_level, awareness_level) values
  ('a0000000-0000-4000-8000-000000000001', 'career', 6, 9, 5, 7),
  ('a0000000-0000-4000-8000-000000000001', 'health', 3, 8, 9, 2),
  ('a0000000-0000-4000-8000-000000000001', 'relationships', 5, 8, 8, 6),
  ('a0000000-0000-4000-8000-000000000001', 'finances', 6, 8, 4, 7),
  ('a0000000-0000-4000-8000-000000000001', 'growth', 6, 8, 3, 3),
  ('a0000000-0000-4000-8000-000000000001', 'purpose', 7, 8, 4, 8),
  ('a0000000-0000-4000-8000-000000000002', 'career', 8, 9, 7, 5),
  ('a0000000-0000-4000-8000-000000000002', 'health', 7, 9, 4, 8),
  ('a0000000-0000-4000-8000-000000000002', 'relationships', 4, 9, 7, 3),
  ('a0000000-0000-4000-8000-000000000002', 'finances', 5, 8, 6, 6),
  ('a0000000-0000-4000-8000-000000000002', 'growth', 7, 9, 3, 8),
  ('a0000000-0000-4000-8000-000000000002', 'purpose', 5, 9, 8, 4),
  ('a0000000-0000-4000-8000-000000000003', 'career', 5, 7, 8, 5),
  ('a0000000-0000-4000-8000-000000000003', 'health', 4, 7, 6, 5),
  ('a0000000-0000-4000-8000-000000000003', 'relationships', 6, 8, 5, 7),
  ('a0000000-0000-4000-8000-000000000003', 'finances', 3, 8, 9, 2),
  ('a0000000-0000-4000-8000-000000000003', 'growth', 6, 9, 4, 6),
  ('a0000000-0000-4000-8000-000000000003', 'purpose', 4, 8, 7, 3)
  on conflict (audit_id, area) do nothing;

insert into gap_maps (audit_id, ranked_areas, total_gap) values
  ('a0000000-0000-4000-8000-000000000001', '[{"area":"health","gap":5,"stress_flag":true,"awareness_flag":true},{"area":"relationships","gap":3,"stress_flag":true,"awareness_flag":false},{"area":"career","gap":3,"stress_flag":false,"awareness_flag":false},{"area":"growth","gap":2,"stress_flag":false,"awareness_flag":true},{"area":"finances","gap":2,"stress_flag":false,"awareness_flag":false},{"area":"purpose","gap":1,"stress_flag":false,"awareness_flag":false}]'::jsonb, 16),
  ('a0000000-0000-4000-8000-000000000002', '[{"area":"relationships","gap":5,"stress_flag":true,"awareness_flag":true},{"area":"purpose","gap":4,"stress_flag":true,"awareness_flag":true},{"area":"finances","gap":3,"stress_flag":false,"awareness_flag":false},{"area":"career","gap":1,"stress_flag":true,"awareness_flag":false},{"area":"growth","gap":2,"stress_flag":false,"awareness_flag":false},{"area":"health","gap":2,"stress_flag":false,"awareness_flag":false}]'::jsonb, 17),
  ('a0000000-0000-4000-8000-000000000003', '[{"area":"finances","gap":5,"stress_flag":true,"awareness_flag":true},{"area":"purpose","gap":4,"stress_flag":true,"awareness_flag":true},{"area":"career","gap":2,"stress_flag":true,"awareness_flag":false},{"area":"health","gap":3,"stress_flag":false,"awareness_flag":false},{"area":"relationships","gap":2,"stress_flag":false,"awareness_flag":false},{"area":"growth","gap":3,"stress_flag":false,"awareness_flag":false}]'::jsonb, 19)
  on conflict (audit_id) do nothing;