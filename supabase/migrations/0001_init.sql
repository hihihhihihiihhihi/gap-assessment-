create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table assessments enable row level security;
drop policy if exists "assessments_v1_read" on assessments;
create policy "assessments_v1_read" on assessments for select using (true);
drop policy if exists "assessments_v1_write" on assessments;
create policy "assessments_v1_write" on assessments for all using (true) with check (true);

create table if not exists area_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  user_id uuid,
  area text not null check (area in ('career','health','relationships','finances','growth','purpose')),
  current_score int not null check (current_score between 1 and 10),
  desired_score int not null check (desired_score between 1 and 10),
  stress_level int not null check (stress_level between 1 and 10),
  awareness_level int not null check (awareness_level between 1 and 10),
  created_at timestamptz not null default now(),
  unique (assessment_id, area)
);

alter table area_responses enable row level security;
drop policy if exists "area_responses_v1_read" on area_responses;
create policy "area_responses_v1_read" on area_responses for select using (true);
drop policy if exists "area_responses_v1_write" on area_responses;
create policy "area_responses_v1_write" on area_responses for all using (true) with check (true);

create table if not exists gap_maps (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references assessments(id) on delete cascade,
  user_id uuid,
  ranked_areas jsonb not null,
  overall_gap numeric not null,
  created_at timestamptz not null default now()
);

alter table gap_maps enable row level security;
drop policy if exists "gap_maps_v1_read" on gap_maps;
create policy "gap_maps_v1_read" on gap_maps for select using (true);
drop policy if exists "gap_maps_v1_write" on gap_maps;
create policy "gap_maps_v1_write" on gap_maps for all using (true) with check (true);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references assessments(id) on delete cascade,
  user_id uuid,
  email text not null,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

insert into assessments (id, status, started_at, completed_at) values
  ('a0000000-0000-0000-0000-000000000001', 'completed', now() - interval '2 hours', now() - interval '1 hour'),
  ('a0000000-0000-0000-0000-000000000002', 'completed', now() - interval '1 day', now() - interval '23 hours'),
  ('a0000000-0000-0000-0000-000000000003', 'completed', now() - interval '3 days', now() - interval '2 days')
on conflict (id) do nothing;

insert into area_responses (assessment_id, area, current_score, desired_score, stress_level, awareness_level) values
  ('a0000000-0000-0000-0000-000000000001', 'career', 6, 9, 8, 2),
  ('a0000000-0000-0000-0000-000000000001', 'health', 5, 9, 7, 3),
  ('a0000000-0000-0000-0000-000000000001', 'relationships', 7, 8, 4, 6),
  ('a0000000-0000-0000-0000-000000000001', 'finances', 8, 9, 5, 7),
  ('a0000000-0000-0000-0000-000000000001', 'growth', 4, 9, 6, 4),
  ('a0000000-0000-0000-0000-000000000001', 'purpose', 3, 10, 9, 1),
  ('a0000000-0000-0000-0000-000000000002', 'career', 7, 8, 5, 6),
  ('a0000000-0000-0000-0000-000000000002', 'health', 6, 8, 6, 5),
  ('a0000000-0000-0000-0000-000000000002', 'relationships', 4, 9, 8, 2),
  ('a0000000-0000-0000-0000-000000000002', 'finances', 5, 8, 7, 3),
  ('a0000000-0000-0000-0000-000000000002', 'growth', 7, 9, 4, 7),
  ('a0000000-0000-0000-0000-000000000002', 'purpose', 6, 9, 5, 5),
  ('a0000000-0000-0000-0000-000000000003', 'career', 8, 9, 3, 8),
  ('a0000000-0000-0000-0000-000000000003', 'health', 3, 9, 9, 1),
  ('a0000000-0000-0000-0000-000000000003', 'relationships', 6, 8, 6, 4),
  ('a0000000-0000-0000-0000-000000000003', 'finances', 7, 10, 8, 2),
  ('a0000000-0000-0000-0000-000000000003', 'growth', 5, 8, 5, 6),
  ('a0000000-0000-0000-0000-000000000003', 'purpose', 4, 10, 7, 3)
on conflict do nothing;

insert into gap_maps (assessment_id, ranked_areas, overall_gap) values
  ('a0000000-0000-0000-0000-000000000001', '[{"area":"purpose","gap_size":7,"priority_score":12.6,"stress_flag":true,"awareness_flag":true},{"area":"growth","gap_size":5,"priority_score":7.2,"stress_flag":false,"awareness_flag":false},{"area":"health","gap_size":4,"priority_score":6.16,"stress_flag":true,"awareness_flag":true},{"area":"career","gap_size":3,"priority_score":5.4,"stress_flag":true,"awareness_flag":true},{"area":"finances","gap_size":1,"priority_score":1.35,"stress_flag":false,"awareness_flag":false},{"area":"relationships","gap_size":1,"priority_score":1.2,"stress_flag":false,"awareness_flag":false}]'::jsonb, 3.5),
  ('a0000000-0000-0000-0000-000000000002', '[{"area":"relationships","gap_size":5,"priority_score":9.0,"stress_flag":true,"awareness_flag":true},{"area":"finances","gap_size":3,"priority_score":5.13,"stress_flag":true,"awareness_flag":true},{"area":"career","gap_size":1,"priority_score":1.4,"stress_flag":false,"awareness_flag":false},{"area":"health","gap_size":2,"priority_score":3.12,"stress_flag":false,"awareness_flag":false},{"area":"growth","gap_size":2,"priority_score":2.24,"stress_flag":false,"awareness_flag":false},{"area":"purpose","gap_size":3,"priority_score":4.05,"stress_flag":false,"awareness_flag":false}]'::jsonb, 2.67),
  ('a0000000-0000-0000-0000-000000000003', '[{"area":"health","gap_size":6,"priority_score":11.88,"stress_flag":true,"awareness_flag":true},{"area":"purpose","gap_size":6,"priority_score":10.2,"stress_flag":true,"awareness_flag":true},{"area":"finances","gap_size":3,"priority_score":5.94,"stress_flag":true,"awareness_flag":true},{"area":"growth","gap_size":3,"priority_score":3.78,"stress_flag":false,"awareness_flag":false},{"area":"relationships","gap_size":2,"priority_score":2.88,"stress_flag":false,"awareness_flag":false},{"area":"career","gap_size":1,"priority_score":1.17,"stress_flag":false,"awareness_flag":false}]'::jsonb, 3.5)
on conflict (assessment_id) do nothing;

insert into leads (assessment_id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'sarah.demo@example.com'),
  ('a0000000-0000-0000-0000-000000000002', 'michaela.demo@example.com')
on conflict (assessment_id) do nothing;