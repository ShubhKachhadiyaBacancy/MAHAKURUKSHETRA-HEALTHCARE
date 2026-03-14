import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { ViewerContext } from "@/types/workspace";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
  { href: "/help", label: "Help" }
] satisfies Array<{ href: Route; label: string }>;

const doctorNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Assigned patients" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" }
] satisfies Array<{ href: Route; label: string }>;

const adminNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/insurance", label: "Insurance" },
  { href: "/medications", label: "Medications" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Access" }
] satisfies Array<{ href: Route; label: string }>;

const patientNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/claims", label: "Claims" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" },
  { href: "/help", label: "Help" }
] satisfies Array<{ href: Route; label: string }>;

type WorkspaceShellProps = {
  viewer: ViewerContext;
  pathname: string;
  children: React.ReactNode;
};

export function WorkspaceShell({
  viewer,
  pathname,
  children
}: WorkspaceShellProps) {
  if (!viewer.hasSession) {
    redirect("/login");
  }

  const navItems =
    viewer.role === "admin"
      ? adminNavItems
      : viewer.role === "patient"
        ? patientNavItems
        : viewer.role === "provider"
        ? doctorNavItems
        : baseNavItems;

  return (
    <main className="page-shell">
      <div className="content-shell">
        <header className="panel flex flex-col gap-5 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link className="flex items-center gap-3" href="/">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
                SR
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  SpecialtyRx Connect
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {viewer.organizationName}
                </div>
              </div>
            </Link>

            <Badge tone={viewer.mode === "live" ? "accent" : "default"}>
              {viewer.mode === "live" ? "Live workspace" : "Workspace"}
            </Badge>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Workspace">
            {navItems.map((item) => (
              <Link
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full px-4 text-sm transition",
                  pathname === item.href
                    ? "bg-ink text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {viewer.displayName}
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {viewer.roleLabel}
              </div>
            </div>

            {viewer.hasSession ? (
              <form action={signOutAction}>
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            ) : (
              <Link href="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
            )}
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
