-- Track delivery of the results email so a send is never silently lost
-- and nobody is emailed the same Gap Map twice.

alter table audits
  add column if not exists results_sent_at timestamptz;
