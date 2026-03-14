import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type NavItem = {
  href: Route;
  label: string;
};

type SiteHeaderProps = {
  navItems: NavItem[];
  currentPath?: string;
};

export function SiteHeader({ navItems, currentPath }: SiteHeaderProps) {
  return (
    <header className="site-header panel sticky top-4 z-20 flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <Link className="flex items-center gap-3" href="/">
        <div className="site-header__mark">
          SR
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Specialty therapy platform
          </span>
          <span className="text-sm font-medium text-slate-900">
            SpecialtyRx Connect
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="site-status hidden xl:flex">
          Intake, access, affordability, and readiness in one queue
        </div>
        <ThemeToggle />
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              className={cn(
                "site-nav__link",
                currentPath === item.href && "site-nav__link--active"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
