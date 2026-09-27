import { bandName, questionText, type Scored } from "@/lib/audit/instrument";

/**
 * The results email for The Gap Audit.
 *
 * Copy follows voice.md: direct opening, unsentimental, no em dashes, no
 * exclamation marks, British spelling, and one ask stated once at the end.
 * Colours are the Phoenix Realm tokens from design.md.
 */

const UMBER = "#713600";
const CACAO = "#38240D";
const CANVAS = "#FAF6EC";
const IVORY = "#FDFBD4";
const INK = "#2B1C0A";
const CLAY = "#CE8946";
const STONE = "#5D5645";

const SERIF = "'Cormorant Garamond', Garamond, Georgia, 'Times New Roman', serif";
const SANS =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** One reading per band. Her voice: names it, does not console. */
function reading(total: number): string {
  if (total <= 24) {
    return "You are not running. On most of these you answered rarely or never, and that is worth protecting rather than assuming. The thing to watch is what happens to these answers in your next demanding season.";
  }
  if (total <= 36) {
    return "You are managing it. Managing it is the trap. Nothing in here is loud enough to force a change, which is exactly why it tends to carry on for years.";
  }
  if (total <= 48) {
    return "You have been carrying this for a long time. What your answers show is that the cost has become normal to you, and normal is the point where most women stop noticing it at all.";
  }
  return "Almost every statement here landed. That is not weakness and it is not a character flaw. It is what happens after years of outworking something you were never given room to face.";
}

export function auditSubject(scored: Scored): string {
  return `Your Gap Audit result: ${scored.total} out of 60, ${bandName(scored.total)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function greeting(firstName?: string | null): string {
  const name = (firstName ?? "").trim();
  return name && name !== "—" ? `${escapeHtml(name)}, here is your result.` : "Here is your result.";
}

function ctaBlock(ctaUrl?: string): string {
  const lead = `<p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">Most women read a result like this, recognise every line of it, and carry on exactly as before. That is the expensive option.</p>`;

  if (!ctaUrl) {
    return `${lead}<p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">If one of those statements landed harder than the rest, reply and tell me which one. I read every reply myself.</p>`;
  }

  return `${lead}
  <p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 20px;">The Theta Collective is a Phoenix Realm community and a safe space for women to learn their own language, so that the first person they can speak honestly to is themselves.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
    <tr><td style="background:${UMBER};">
      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:15px;font-weight:600;color:${IVORY};text-decoration:none;">Join The Theta Collective</a>
    </td></tr>
  </table>
  <p style="font-family:${SANS};font-size:15px;line-height:1.65;color:${STONE};margin:0 0 18px;">Not ready for that? Reply and tell me which statement landed hardest. I read every reply myself.</p>`;
}

function sectionRow(label: string, value: number): string {
  return `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid #E3DCCB;font-family:${SANS};font-size:15px;color:${INK};">${escapeHtml(label)}</td>
    <td align="right" style="padding:11px 0;border-bottom:1px solid #E3DCCB;font-family:${SANS};font-size:15px;font-weight:600;color:${INK};white-space:nowrap;">${value} / 20</td>
  </tr>`;
}

export function auditResultsHtml({
  scored,
  answers,
  firstName,
  ctaUrl,
}: {
  scored: Scored;
  answers: Record<number, number>;
  firstName?: string | null;
  ctaUrl?: string;
}): string {
  const highest = [...scored.sections].sort((a, b) => b.score - a.score)[0];

  const answerRows = Object.keys(answers)
    .map(Number)
    .sort((a, b) => a - b)
    .map(
      (n) =>
        `<tr><td style="padding:7px 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${STONE};">${n}. ${escapeHtml(questionText(n))}</td><td align="right" style="padding:7px 0;font-family:${SANS};font-size:13px;font-weight:600;color:${INK};vertical-align:top;">${answers[n]}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Your Gap Audit result</title></head>
<body style="margin:0;padding:0;background:${CANVAS};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:28px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E3DCCB;">

        <tr><td style="background:${CACAO};padding:26px 28px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${CLAY};">The Gap Audit</div>
          <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${IVORY};padding-top:8px;">${greeting(firstName)}</div>
        </td></tr>

        <tr><td align="center" style="padding:28px 28px 6px;">
          <div style="font-family:${SERIF};font-size:54px;line-height:1;color:${UMBER};">${scored.total}</div>
          <div style="font-family:${SANS};font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${STONE};padding-top:6px;">out of 60</div>
          <div style="font-family:${SANS};font-size:16px;font-weight:600;color:${INK};padding-top:12px;">${escapeHtml(scored.band)}</div>
        </td></tr>

        <tr><td style="padding:18px 28px 6px;">
          <p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">${reading(scored.total)}</p>
          ${highest ? `<p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 18px;">Your highest section is ${escapeHtml(highest.label)}, at ${highest.score} out of 20. That is where this is costing you most.</p>` : ""}
        </td></tr>

        <tr><td style="padding:0 28px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${STONE};padding-bottom:4px;">Your three sections</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${scored.sections.map((s) => sectionRow(s.label, s.score)).join("")}
          </table>
        </td></tr>

        <tr><td style="padding:22px 28px 0;">
          <p style="font-family:${SERIF};font-size:21px;line-height:1.45;color:${UMBER};margin:0;font-style:italic;">You cannot outwork what you haven't faced. I tried for ten years.</p>
          <p style="font-family:${SERIF};font-size:21px;line-height:1.45;color:${UMBER};margin:8px 0 22px;font-style:italic;">The current is only a current while you're swimming against it.</p>
        </td></tr>

        <tr><td style="padding:0 28px 8px;">
          ${ctaBlock(ctaUrl)}
          <p style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};margin:0 0 22px;">Glenda</p>
        </td></tr>

        <tr><td style="padding:0 28px 26px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${STONE};padding-bottom:4px;">What you answered</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${answerRows}</table>
        </td></tr>

        <tr><td style="background:${CANVAS};padding:16px 28px;border-top:1px solid #E3DCCB;">
          <div style="font-family:${SANS};font-size:11px;line-height:1.6;color:${STONE};">You are getting this because you completed The Gap Audit and asked for your result. Reply with the word stop and I will not write again.</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function auditResultsText({
  scored,
  answers,
  firstName,
  ctaUrl,
}: {
  scored: Scored;
  answers: Record<number, number>;
  firstName?: string | null;
  ctaUrl?: string;
}): string {
  const name = (firstName ?? "").trim();
  const highest = [...scored.sections].sort((a, b) => b.score - a.score)[0];

  const lines = [
    name && name !== "—" ? `${name}, here is your result.` : "Here is your result.",
    "",
    `${scored.total} out of 60`,
    scored.band,
    "",
    reading(scored.total),
    "",
  ];

  if (highest) {
    lines.push(
      `Your highest section is ${highest.label}, at ${highest.score} out of 20. That is where this is costing you most.`,
      "",
    );
  }

  lines.push("Your three sections:");
  for (const s of scored.sections) lines.push(`  ${s.label}: ${s.score} / 20`);
  lines.push(
    "",
    "You cannot outwork what you haven't faced. I tried for ten years.",
    "The current is only a current while you're swimming against it.",
    "",
    "Most women read a result like this, recognise every line of it, and carry on exactly as before. That is the expensive option.",
    "",
  );

  if (ctaUrl) {
    lines.push(
      "The Theta Collective is a Phoenix Realm community and a safe space for women to learn their own language, so that the first person they can speak honestly to is themselves.",
      "",
      ctaUrl,
      "",
      "Not ready for that? Reply and tell me which statement landed hardest. I read every reply myself.",
      "",
    );
  } else {
    lines.push(
      "If one of those statements landed harder than the rest, reply and tell me which one. I read every reply myself.",
      "",
    );
  }

  lines.push("Glenda", "", "What you answered:");
  for (const n of Object.keys(answers).map(Number).sort((a, b) => a - b)) {
    lines.push(`  ${n}. ${questionText(n)} [${answers[n]}]`);
  }

  return lines.join("\n");
}
