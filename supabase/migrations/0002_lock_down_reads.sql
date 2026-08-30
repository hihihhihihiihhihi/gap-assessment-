-- Close the public read/write hole left by the v1 demo policies.
--
-- The anon key ships in the browser, so the v1 "using (true)" policies meant
-- anyone could read every audit — including the email addresses visitors leave.
-- All database access in this app runs server-side via the service-role client
-- (lib/supabase/admin.ts), which bypasses RLS, so no policy is needed for the
-- app to work. Anonymous visitors keep working with no login.
--
-- RUN THIS ONLY AFTER the service-role deploy is live, or the app loses its
-- database access between the two steps.

drop policy if exists "audits_v1_read" on audits;
drop policy if exists "audits_v1_write" on audits;
drop policy if exists "area_responses_v1_read" on area_responses;
drop policy if exists "area_responses_v1_write" on area_responses;
drop policy if exists "gap_maps_v1_read" on gap_maps;
drop policy if exists "gap_maps_v1_write" on gap_maps;

-- RLS stays enabled with no policies: the anon key can now do nothing at all,
-- while the service-role key is unaffected.
alter table audits enable row level security;
alter table area_responses enable row level security;
alter table gap_maps enable row level security;
