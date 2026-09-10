# Agentic Layer

## v1: None
No agentic actions in v1. The audit, Gap Map computation, and email capture are all deterministic server-side logic and direct DB writes. No drafts, no approvals, no automated external actions.

## Later Phases

### Draftable Actions (low risk — auto)
| Action | Risk | Trigger |
|-------|------|--------|
| Generate Gap Map narrative summary | low | assessment completed |
| Tag lead interest area from top-priority result | low | email submitted |

### Executable After Approval (medium risk)
| Action | Risk | Trigger |
|-------|------|--------|
| Send Gap Map results email to lead | medium | email submitted + approval |
| Route lead to Phoenix Realm / Theta Collective CRM | medium | email submitted + approval |

### Human-Only Actions (high/critical risk)
| Action | Risk | Reason |
|-------|------|--------|
| Send follow-up outreach from named person | high | unsolicited contact |
| Delete lead or assessment data | critical | data-loss |
| Export leads list | high | PII exposure |

### Named Tools (later)
- `send_result_email` — sends saved Gap Map to lead's email. Parameters: assessment_id, email. Returns success/failure.
- `route_to_crm` — pushes lead + top-priority tag to external CRM. Parameters: lead_id, area_tag. Returns CRM record ID.

### Audit Log Fields (later)
| Field | Type |
|-------|------|
| id | uuid |
| action | text |
| actor | text (user_id or 'system') |
| target_table | text |
| target_id | uuid |
| risk_level | text |
| approved_by | uuid (nullable) |
| created_at | timestamptz |

## v1 vs Later
**v1:** No agentic layer. Direct DB writes only.
**Later:** Narrative generation (auto), email sending (approved), CRM routing (approved), audit logging.