# Agentic Layer

## v1: No Agentic Actions
The core is entirely user-driven and rule-based. No AI calls, no automated actions.

## Later Actions (by risk level)

### Low risk — auto
- **generate_area_insight**: Input: area scores. Output: 1–2 sentence insight text + confidence. Stored as ai_summary / ai_source / ai_confidence / ai_review_status. If confidence < 0.7, flagged for review and not shown to user.

### Medium risk — light approval
- **draft_action_plan**: Input: full gap map. Output: recommended actions per high-priority area. User reviews and approves before plan is saved.

### Critical risk — human-only
- **delete_assessment**: Permanent data deletion. No automation.
- **export_data**: Data export. Requires explicit user action.

## Named Tools
| Tool | Input | Output | Risk |
|------|-------|--------|------|
| generate_area_insight | area scores | insight text + confidence | low |
| draft_action_plan | gap map | action items per area | medium |

No raw execution tools. Each tool has a strict input/output schema and returns structured errors (retryable vs terminal, human-readable reason).

## Audit Log Fields
id, user_id, action, tool_name, input_summary, output_summary, risk_level, approved_by, created_at.

Every AI-generated output is logged. Every approval is recorded.
