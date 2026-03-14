import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandMarkIcon } from "@/components/ui/icons";

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
      <Link className="flex items-center gap-3.5" href="/">
        <div className="site-header__mark">
          <BrandMarkIcon />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--text-muted)]">
            Care operations platform
          </span>
          <span className="text-sm font-semibold tracking-[-0.01em] text-[color:var(--text-primary)]">
            SpecialtyRx Connect
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3 sm:justify-end">
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
