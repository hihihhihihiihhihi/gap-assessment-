"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "◆" },
  { href: "/assessment", label: "Assessment", icon: "✎" },
  { href: "/results", label: "Results", icon: "▲" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-purple-100 text-purple-900"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <span aria-hidden className="text-xs text-purple-500">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <Link href="/" className="text-base font-bold tracking-tight text-neutral-900">
          Gap Assessment
        </Link>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
        >
          {menuOpen ? (
            <span aria-hidden className="block text-xl leading-none">✕</span>
          ) : (
            <span aria-hidden className="block text-xl leading-none">☰</span>
          )}
        </button>
      </header>
      {menuOpen && (
        <div className="border-b border-neutral-200 bg-white md:hidden">{nav}</div>
      )}

      <div className="mx-auto flex max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
          <div className="px-7 pt-8 pb-2">
            <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
              Gap Assessment
            </Link>
            <p className="mt-1 text-xs text-neutral-500">
              From survival mode to your epic life
            </p>
          </div>
          {nav}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
