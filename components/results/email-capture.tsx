"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { validEmail } from "@/lib/scoring/gap-calculator";

export default function EmailCapture({
  initialEmail,
  variant = "confirm",
}: {
  initialEmail: string | null;
  /** "unlock" gates the Gap Map behind the address; "confirm" sits under it. */
  variant?: "unlock" | "confirm";
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [saved, setSaved] = useState(Boolean(initialEmail));
  const [emailed, setEmailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    // Client-side check first: an invalid address never reaches the DB.
    if (!validEmail(email)) {
      setError("That doesn't look like an email address.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/audit/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.reason ?? "We couldn't save that.");
      setEmailed(Boolean(data.emailed));
      setSaved(true);
      // Unlocks the Gap Map: the server re-reads the audit and renders it.
      if (variant === "unlock") router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "We couldn't reach the server. Try again in a moment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
        <p className="font-semibold text-emerald-900">
          {emailed ? "Your Gap Map is on its way." : "Your Gap Map is kept."}
        </p>
        <p className="mt-1 text-emerald-800">
          {emailed ? (
            <>
              Sent to <strong>{email}</strong>. If it isn&apos;t there in a few
              minutes, check your spam folder.
            </>
          ) : (
            <>
              Saved to <strong>{email}</strong>. Nothing else happens without
              your say-so.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setSaved(false)}
          className="mt-3 text-xs font-medium text-emerald-900 underline underline-offset-2"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      noValidate
    >
      <label htmlFor="email" className="text-sm font-semibold text-neutral-900">
        {variant === "unlock"
          ? "Your Gap Map is ready. Tell me where to send it."
          : "Leave your email to keep your Gap Map"}
      </label>
      <p className="mt-1 text-xs text-neutral-500">
        {variant === "unlock"
          ? "Your results open on the next screen and land in your inbox. Not a newsletter signup."
          : "So you can come back to it. Not a newsletter signup."}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "email-error" : undefined}
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:bg-stone-300"
        >
          {saving
            ? "Sending…"
            : variant === "unlock"
              ? "Show my Gap Map"
              : "Keep my Gap Map"}
        </button>
      </div>
      {error && (
        <p id="email-error" role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
