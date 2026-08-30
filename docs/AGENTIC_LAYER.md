# Agentic Layer

## v1: No Agentic Actions
The audit, Gap Map, and email capture are all direct user actions. No agent acts autonomously in v1.

## Later: Draftable Actions (low risk — auto)
- Tag a completed audit as `hot_lead` / `warm_lead` / `nurture` based on total_gap + number of stress flags. Stored on audits row.
- Generate AI narrative summary of the Gap Map (low risk — draft only, queued for review if low confidence).

## Later: Executable After Approval (medium risk)
- Draft a personalised follow-up email referencing the woman's top gap areas and fight/flight zones. Sent only after human approval.
- Route a hot lead to Phoenix Realm or Theta Collective CRM — creates a lead record after approval.

## Human-Only (high / critical risk)
- Send any outbound email (approval does not auto-send — a person reviews and clicks send).
- Delete an audit or email record.
- Export or share PII (email addresses) outside the system.

## Named Tools (later)
| Tool | Boundary | Risk |
|---|---|---|
| `draft_follow_up_email` | Reads audit + gap_map; produces draft text; cannot send | medium |
| `score_lead` | Reads gap_map totals; writes lead_tier tag on audits | low |
| `generate_gap_summary` | Reads gap_map; writes ai_summary; cannot trigger external calls | low |

## Audit-Log Fields (later)
| Field | Type |
|---|---|
| id | uuid PK |
| actor | text (user email or 'agent') |
| action | text (e.g. 'draft_follow_up_email') |
| target_id | uuid (audit or gap_map id) |
| outcome | text ('drafted' / 'approved' / 'sent' / 'rejected') |
| risk_level | text ('low' / 'medium' / 'high' / 'critical') |
| created_at | timestamptz |