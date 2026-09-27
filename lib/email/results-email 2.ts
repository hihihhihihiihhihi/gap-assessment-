import { AREA_LABELS, type RankedArea } from "@/lib/scoring/gap-calculator";

/**
 * The results email a participant receives the moment she leaves her address.
 *
 * Copy follows voice.md: direct opening line, no em dashes, British spelling,
 * short paragraphs, no exclamation marks, and it ends on a real question
 * rather than a pitch. Colours are the Phoenix Realm tokens from design.md.
 */

const UMBER = "#713600";
const CACAO = "#38240D";
const CANVAS = "#FAF6EC";
const INK = "#2B1C0A";
const CLAY = "#CE8946";
const STONE = "#5D5645";

// Cormorant Garamond and Inter are not available in most mail clients, so the
// stacks fall back to the nearest widely installed serif and sans.
const SERIF = "'Cormorant Garamond', Garamond, Georgia, 'Times New Roman', serif";
const SANS =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function resultsSubject(areas: RankedArea[]): string {
  const widest = areas[0];
  if (!widest) return "Your Gap Map";
  return `Your Gap Map, and the widest gap in it: ${AREA_LABELS[widest.area]}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function areaRow(area: RankedArea): string {
  const zones: string[] = [];
  if (area.stress_flag) zones.push("fight/flight");
  if (area.awareness_flag) zones.push("low awareness");
  const zoneLine = zones.length
    ? `<div style="font-family:${SANS};font-size:12px;color:${CLAY};padding-top:4px;">${zones.join(", ")}</div>`
    : "";

  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid #E3DCCB;">
      <div style="font-family:${SANS};font-size:16px;font-weight:600;color:${INK};">${escapeHtml(AREA_LABELS[area.area])}</div>
      <div style="font-family:${SANS};font-size:13px;color:${STONE};padding-top:3px;">The current ${area.now}. Where you want to be ${area.want}.</div>
      ${zoneLine}
    </td>
    <td align="right" style="padding:14px 0;border-bottom:1px solid #E3DCCB;white-space:nowrap;vertical-align:top;">
      <span style="font-family:${SERIF};font-size:26px;color:${UMBER};">${area.gap > 0 ? `+${area.gap}` : area.gap}</span>
    </td>
  </tr>`;
}

export function resultsHtml({
  areas,
  totalGap,
  resultsUrl,
}: {
  areas: RankedArea[];
  totalGap: number;
  resultsUrl?: string;
}): string {
  const widest = areas[0];
  const fightFlight = areas.filter((a) => a.stress_flag);
  const lowAwareness = areas.filter((a) => a.awareness_flag);

  const paragraphs: string[] = [];

  if (widest) {
    paragraphs.push(
      `Your widest gap is ${escapeHtml(AREA_LABELS[widest.area])}, ${widest.gap} points between where you are and where you want to be.`,
    );
  }

  if (fightFlight.length > 0) {
    const names = fightFlight.map((a) => AREA_LABELS[a.area]).join(", ");
    paragraphs.push(
      `${fightFlight.length === 1 ? "One area is" : `${fightFlight.length} areas are`} running on fight/flight: ${escapeHtml(names)}. That is not a character flaw. It is what happens when you have been holding it together for a long time.`,
    );
  }

  if (lowAwareness.length > 0) {
    const names = lowAwareness.map((a) => AREA_LABELS[a.area]).join(", ");
    paragraphs.push(
      `${lowAwareness.length === 1 ? "One area is" : `${lowAwareness.length} areas are`} running without you noticing: ${escapeHtml(names)}. Those are usually the ones that cost the most.`,
    );
  }

  if (fightFlight.length === 0 && lowAwareness.length === 0) {
    paragraphs.push(
      "Nothing is flagged as fight/flight or low awareness. That is worth protecting, not assuming.",
    );
  }

  const prose = paragraphs
    .map(
      (p) =>
        `<p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">${p}</p>`,
    )
    .join("");

  const link = resultsUrl
    ? `<p style="font-family:${SANS};font-size:13px;line-height:1.6;color:${STONE};margin:26px 0 0;">Your full Gap Map is here: <a href="${escapeHtml(resultsUrl)}" style="color:${UMBER};">${escapeHtml(resultsUrl)}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Your Gap Map</title></head>
<body style="margin:0;padding:0;background:${CANVAS};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:28px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E3DCCB;">

        <tr><td style="background:${CACAO};padding:26px 28px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${CLAY};">The Gap Audit</div>
          <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#FDFBD4;padding-top:8px;">Here is what you just told yourself.</div>
        </td></tr>

        <tr><td style="padding:28px 28px 8px;">
          ${prose}
        </td></tr>

        <tr><td style="padding:0 28px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${STONE};padding-bottom:6px;">Widest gap first</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${areas.map(areaRow).join("")}
            <tr>
              <td style="padding:14px 0;font-family:${SANS};font-size:14px;font-weight:600;color:${INK};">Total gap</td>
              <td align="right" style="padding:14px 0;font-family:${SERIF};font-size:26px;color:${UMBER};">${totalGap}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:10px 28px 30px;">
          <p style="font-family:${SERIF};font-size:22px;line-height:1.4;color:${UMBER};margin:18px 0 20px;font-style:italic;">You cannot close a gap you cannot see. You have just seen it.</p>
          <p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">If one of those areas surprised you, reply and tell me which one.</p>
          <p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0;">Glenda</p>
          ${link}
        </td></tr>

        <tr><td style="background:${CANVAS};padding:16px 28px;border-top:1px solid #E3DCCB;">
          <div style="font-family:${SANS};font-size:11px;line-height:1.6;color:${STONE};">You are getting this because you completed the Gap Audit and asked for your results. Reply with the word stop and I will not write again.</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text alternative, required for deliverability. */
export function resultsText({
  areas,
  totalGap,
}: {
  areas: RankedArea[];
  totalGap: number;
}): string {
  const lines = ["Here is what you just told yourself.", ""];
  const widest = areas[0];
  if (widest) {
    lines.push(
      `Your widest gap is ${AREA_LABELS[widest.area]}, ${widest.gap} points between where you are and where you want to be.`,
      "",
    );
  }
  lines.push("Widest gap first:");
  for (const a of areas) {
    const zones: string[] = [];
    if (a.stress_flag) zones.push("fight/flight");
    if (a.awareness_flag) zones.push("low awareness");
    lines.push(
      `  ${AREA_LABELS[a.area]}: gap ${a.gap}. The current ${a.now}, where you want to be ${a.want}.${zones.length ? ` (${zones.join(", ")})` : ""}`,
    );
  }
  lines.push(
    "",
    `Total gap: ${totalGap}`,
    "",
    "You cannot close a gap you cannot see. You have just seen it.",
    "",
    "If one of those areas surprised you, reply and tell me which one.",
    "",
    "Glenda",
  );
  return lines.join("\n");
}
