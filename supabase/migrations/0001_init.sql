create table if not exists life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table life_areas enable row level security;
drop policy if exists "life_areas_v1_read" on life_areas;
create policy "life_areas_v1_read" on life_areas for select using (true);
drop policy if exists "life_areas_v1_write" on life_areas;
create policy "life_areas_v1_write" on life_areas for all using (true) with check (true);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'in_progress',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table assessments enable row level security;
drop policy if exists "assessments_v1_read" on assessments;
create policy "assessments_v1_read" on assessments for select using (true);
drop policy if exists "assessments_v1_write" on assessments;
create policy "assessments_v1_write" on assessments for all using (true) with check (true);

create table if not exists assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  life_area_id uuid not null references life_areas(id),
  user_id uuid,
  current_score int not null default 5 check (current_score between 1 and 10),
  desired_score int not null default 8 check (desired_score between 1 and 10),
  stress_level int not null default 3 check (stress_level between 1 and 5),
  awareness_level int not null default 3 check (awareness_level between 1 and 5),
  ai_summary text,
  ai_source text,
  ai_confidence numeric,
  ai_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table assessment_scores enable row level security;
drop policy if exists "assessment_scores_v1_read" on assessment_scores;
create policy "assessment_scores_v1_read" on assessment_scores for select using (true);
drop policy if exists "assessment_scores_v1_write" on assessment_scores;
create policy "assessment_scores_v1_write" on assessment_scores for all using (true) with check (true);

create unique index if not exists assessment_scores_assessment_area_uidx on assessment_scores (assessment_id, life_area_id);

insert into life_areas (id, name, description, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', 'Career & Business', 'Your professional life, ambitions, and business ventures.', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Health & Wellness', 'Physical health, energy, sleep, fitness, and nutrition.', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Relationships & Connection', 'Quality of relationships with partner, family, friends, and community.', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Finances & Wealth', 'Financial stability, income, investments, and money management.', 4),
  ('a0000000-0000-0000-0000-000000000005', 'Personal Growth & Learning', 'Growth, learning, creativity, and skill development.', 5),
  ('a0000000-0000-0000-0000-000000000006', 'Spirituality & Purpose', 'Meaning, purpose, faith, and connection to something greater.', 6)
on conflict (id) do nothing;

insert into assessments (id, user_id, status, started_at, completed_at) values
  ('b0000000-0000-0000-0000-000000000001', null, 'completed', now() - interval '5 days', now() - interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', null, 'completed', now() - interval '3 days', now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', null, 'completed', now() - interval '1 day', now() - interval '1 day')
on conflict (id) do nothing;

insert into assessment_scores (assessment_id, life_area_id, current_score, desired_score, stress_level, awareness_level) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 6, 9, 4, 2),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 4, 9, 5, 1),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 5, 8, 3, 3),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 7, 9, 3, 4),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 3, 8, 4, 2),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 2, 9, 5, 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 7, 8, 3, 4),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 6, 8, 3, 3),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 6, 9, 2, 4),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 5, 9, 4, 2),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 6, 7, 2, 5),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 5, 8, 3, 3),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4, 10, 5, 1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 3, 9, 5, 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 4, 8, 4, 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 6, 9, 3, 3),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 2, 8, 5, 1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 3, 10, 4, 2)
on conflict (assessment_id, life_area_id) do nothing;