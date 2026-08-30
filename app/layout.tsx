import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Gap Audit",
  description:
    "Six areas, four readings each. See the distance between the life you're living and the life you want — in about three minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-neutral-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-3xl px-5 py-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              The Gap Audit
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-5 py-8 md:py-12">{children}</main>
        <footer className="mx-auto max-w-3xl px-5 pb-10 pt-4 text-xs text-neutral-400">
          No account needed. Your answers stay with your Gap Map.
        </footer>
      </body>
    </html>
  );
}
