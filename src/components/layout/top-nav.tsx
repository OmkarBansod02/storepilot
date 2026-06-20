"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Demo Store", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Experiment Lab", href: "/experiments" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[#faf7f2]/80 shadow-[0_1px_4px_rgba(26,22,20,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 rounded-full bg-primary shadow-[0_0_0_3px_var(--accent),0_0_6px_rgba(200,90,40,0.2)]"
          />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            StorePilot
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button
            size="sm"
            className="ml-3 h-8 px-3.5 text-[12.5px] font-semibold shadow-primary-glow"
            asChild
          >
            <Link href="/demo">
              Open Demo Store
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground sm:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-[#faf7f2]/95 px-5 pb-4 pt-2 backdrop-blur-xl sm:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button
              size="sm"
              className="mt-2 h-9 text-[13px] font-semibold shadow-primary-glow"
              asChild
            >
              <Link href="/demo" onClick={() => setMobileOpen(false)}>
                Open Demo Store
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
