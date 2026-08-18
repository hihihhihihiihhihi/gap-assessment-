import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Gap Assessment — From Survival Mode to Your Epic Life",
  description:
    "Assess six life areas, see where you're running in fight-or-flight mode, and map the gap between where you are and the life you want.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-neutral-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
