import "server-only";

/**
 * Email transport, Resend over plain fetch so there is no extra dependency.
 *
 * If RESEND_API_KEY is not set the send is skipped and reported as "skipped"
 * rather than thrown. Capturing the address must never fail because email
 * delivery is misconfigured.
 */

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "skipped",
      reason: "RESEND_API_KEY is not set, no email was sent.",
    };
  }

  // Must be an address on a domain verified in Resend, otherwise Resend rejects it.
  const from = process.env.RESULTS_FROM_EMAIL ?? "Glenda <onboarding@resend.dev>";
  const replyTo = process.env.RESULTS_REPLY_TO ?? "glendayn@gmail.com";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!res.ok) {
      // Never log the recipient address: it is PII (docs/SECURITY.md).
      return {
        status: "failed",
        reason: body.message ?? `Resend returned ${res.status}.`,
      };
    }

    return { status: "sent", id: body.id ?? "unknown" };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Unknown transport error.",
    };
  }
}
