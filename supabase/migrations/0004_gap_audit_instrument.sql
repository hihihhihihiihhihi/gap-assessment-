-- The Gap Audit instrument as published at the-gap-audit-5.vercel.app:
-- 12 statements, three sections (The Mask, The Current, The Gap), each rated
-- 1 to 5, scored out of 60 and placed in a band.
--
-- Self-contained on purpose. Running this alone brings the database up to
-- date, including the results_sent_at column from 0003.

alter table audits add column if not exists first_name text;
alter table audits add column if not exists consent boolean not null default false;
alter table audits add column if not exists total_score int;
alter table audits add column if not exists band text;
alter table audits add column if not exists section_mask int;
alter table audits add column if not exists section_current int;
alter table audits add column if not exists section_gap int;
alter table audits add column if not exists results_sent_at timestamptz;

-- One row per statement, so her raw answers are kept, not just the totals.
create table if not exists audit_answers (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  question_number int not null check (question_number between 1 and 12),
  value int not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  unique (audit_id, question_number)
);

alter table audit_answers enable row level security;
drop policy if exists "audit_answers_v1_read" on audit_answers;
create policy "audit_answers_v1_read" on audit_answers for select using (true);
drop policy if exists "audit_answers_v1_write" on audit_answers;
create policy "audit_answers_v1_write" on audit_answers for all using (true) with check (true);

create index if not exists audit_answers_audit_idx on audit_answers (audit_id);
