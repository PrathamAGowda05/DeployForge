"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/projects", label: "Projects", index: "01" },
  { href: "/profile", label: "Profile", index: "02" },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border-subtle bg-bg-elevated lg:flex lg:flex-col">
        <div className="border-b border-border-subtle px-5 py-6">
          <Link href="/" className="group block">
            <span className="font-mono text-[10px] tracking-widest text-text-muted">
              DEPLOYFORGE
            </span>
            <span className="mt-0.5 block text-sm font-medium text-text-primary group-hover:text-text-secondary transition-colors">
              Infrastructure
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="mb-3 px-2 font-mono text-xs uppercase tracking-widest text-text-muted">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 border px-3 py-2.5 text-sm transition-colors duration-150",
                      isActive
                        ? "border-border-strong bg-bg-surface text-text-primary"
                        : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-bg-surface hover:text-text-primary",
                    )}
                  >
                    <span className="font-mono text-[10px] text-text-muted">
                      {item.index}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border-subtle px-4 py-3">
          <p className="font-mono text-[10px] text-text-muted">v0.1.0</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle bg-bg-elevated px-4 py-3 lg:hidden">
          <Link href="/" className="font-mono text-xs text-text-primary">
            DEPLOYFORGE
          </Link>
          <nav className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
