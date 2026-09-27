import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Serves The Gap Audit exactly as published, with only its CONFIG block
 * rewritten: submissions come here instead of Formspree, and the Theta
 * Collective button points at CTA_URL when one is set.
 *
 * The page itself (lib/audit/gap-audit.html) is her file. Do not edit its
 * statements, scale, bands or design.
 */
export async function GET() {
  const file = path.join(process.cwd(), "lib", "audit", "gap-audit.html");
  let html = await readFile(file, "utf8");

  html = html.replace(
    /FORM_ENDPOINT:\s*"[^"]*"/,
    'FORM_ENDPOINT: "/api/audit/submit"',
  );

  const cta = process.env.CTA_URL;
  if (cta) {
    html = html.replace(
      /CTA_THETA_URL:\s*"[^"]*"/,
      `CTA_THETA_URL: ${JSON.stringify(cta)}`,
    );
  }

  // Results now arrive immediately, so the holding promise is no longer true.
  html = html.replace(
    /will arrive in your inbox shortly[^<]*/,
    "is on its way to your inbox now",
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
