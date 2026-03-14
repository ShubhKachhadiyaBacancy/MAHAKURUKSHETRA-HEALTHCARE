import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/login/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { ViewerContext } from "@/types/workspace";

type NavItem = {
  href: Route;
  label: string;
  caption: string;
  icon: React.ReactNode;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const organizerNavSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        caption: "Monitor flow and blockers",
        icon: <DashboardIcon />
      },
      {
        href: "/patients",
        label: "Patients",
        caption: "Track active access work",
        icon: <PatientsIcon />
      },
      {
        href: "/offices",
        label: "Offices",
        caption: "Manage office locations",
        icon: <OfficeIcon />
      },
      {
        href: "/insurance",
        label: "Insurance",
        caption: "Maintain payer policies",
        icon: <ShieldIcon />
      },
      {
        href: "/medications",
        label: "Medications",
        caption: "Review organization therapies",
        icon: <PillIcon />
      },
      {
        href: "/intake",
        label: "Intake",
        caption: "Open new cases quickly",
        icon: <ClipboardIcon />
      },
      {
        href: "/reports",
        label: "Reports",
        caption: "Export operational views",
        icon: <ReportsIcon />
      }
    ]
  },
  {
    title: "Workspace",
    items: [
      {
        href: "/settings",
        label: "Settings",
        caption: "Tune workspace behavior",
        icon: <SettingsIcon />
      },
      {
        href: "/help",
        label: "Help",
        caption: "Reference support topics",
        icon: <HelpIcon />
      }
    ]
  }
];

const doctorNavSections: NavSection[] = [
  {
    title: "Clinical queue",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        caption: "Watch assigned case movement",
        icon: <DashboardIcon />
      },
      {
        href: "/patients",
        label: "Patients",
        caption: "Review assigned patients",
        icon: <PatientsIcon />
      },
      {
        href: "/reports",
        label: "Reports",
        caption: "Download doctor exports",
        icon: <ReportsIcon />
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        href: "/help",
        label: "Help",
        caption: "Reference workflow help",
        icon: <HelpIcon />
      }
    ]
  }
];

const adminNavSections: NavSection[] = [
  {
    title: "Control center",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        caption: "Organization-wide visibility",
        icon: <DashboardIcon />
      },
      {
        href: "/users",
        label: "Users",
        caption: "Administer accounts and roles",
        icon: <UsersIcon />
      },
      {
        href: "/insurance",
        label: "Insurance",
        caption: "Maintain payer coverage data",
        icon: <ShieldIcon />
      },
      {
        href: "/medications",
        label: "Medications",
        caption: "Curate formulary surfaces",
        icon: <PillIcon />
      },
      {
        href: "/reports",
        label: "Reports",
        caption: "Generate admin exports",
        icon: <ReportsIcon />
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        href: "/settings",
        label: "Settings",
        caption: "Control organization defaults",
        icon: <SettingsIcon />
      },
      {
        href: "/admin",
        label: "Access",
        caption: "Configure privileged workflows",
        icon: <LockIcon />
      }
    ]
  }
];

const patientNavSections: NavSection[] = [
  {
    title: "My workspace",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        caption: "See care progress at a glance",
        icon: <DashboardIcon />
      },
      {
        href: "/claims",
        label: "Claims",
        caption: "Create and track submissions",
        icon: <ClaimsIcon />
      },
      {
        href: "/reports",
        label: "Reports",
        caption: "Review export-ready summaries",
        icon: <ReportsIcon />
      }
    ]
  },
  {
    title: "Support",
    items: [
      {
        href: "/help",
        label: "Help",
        caption: "Find support answers",
        icon: <HelpIcon />
      }
    ]
  }
];

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

  const navSections =
    viewer.role === "admin"
      ? adminNavSections
      : viewer.role === "patients"
        ? patientNavSections
        : viewer.role === "doctor"
          ? doctorNavSections
          : organizerNavSections;

  const navItems = navSections.flatMap((section) => section.items);
  const activeItem =
    navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0] ?? null;
  const activeSectionTitle =
    navSections.find((section) =>
      section.items.some((item) => isActivePath(pathname, item.href))
    )?.title ?? navSections[0]?.title ?? null;
  const initials = getInitials(viewer.displayName);
  const routeCountLabel = `${navItems.length} ${navItems.length === 1 ? "route" : "routes"}`;
  const sectionCountLabel = `${navSections.length} ${navSections.length === 1 ? "zone" : "zones"}`;
  const roleSummary =
    viewer.role === "admin"
      ? "Administer the system, secure role access, and keep master data aligned."
      : viewer.role === "patients"
        ? "Follow claims, therapy updates, and next support steps from one personal workspace."
        : viewer.role === "doctor"
          ? "Review assigned patients, add feedback, and clear clinical blockers faster."
          : "Coordinate intake, payer movement, and affordability work without losing the thread.";

  return (
    <main className="page-shell workspace-app-shell">
      <div className="workspace-app">
        <aside className="workspace-sidebar">
          <div className="workspace-sidebar__backdrop" aria-hidden="true" />
          <div className="workspace-sidebar__glow" aria-hidden="true" />
          <div className="workspace-sidebar__scroll">
            <div className="workspace-sidebar__header">
              <Link className="workspace-brand" href="/">
                <span className="workspace-brand__mark" aria-hidden="true">
                  <BrandMarkIcon />
                </span>
                <span className="workspace-brand__copy">
                  <span className="workspace-brand__eyebrow">Operational workspace</span>
                  <span className="workspace-brand__title">SpecialtyRx Connect</span>
                </span>
              </Link>

              <div className="workspace-sidebar__header-tools">
                <Badge tone={viewer.mode === "live" ? "accent" : "default"}>
                  {viewer.mode === "live" ? "Live sync" : "Preview mode"}
                </Badge>
              </div>
            </div>

            <section className="workspace-sidebar__hero">
              <div className="workspace-sidebar__hero-grid" aria-hidden="true" />
              <div className="workspace-sidebar__hero-topline">
                <span className="workspace-sidebar__hero-kicker">Current lane</span>
                <span className="workspace-sidebar__hero-chip">
                  {activeSectionTitle ?? "Workspace"}
                </span>
              </div>
              <div className="workspace-sidebar__hero-title">
                {activeItem?.label ?? "Workspace"}
              </div>
              <p className="workspace-sidebar__hero-copy">
                {activeItem?.caption ?? "Review the latest work happening in your workspace."}
              </p>
              <div className="workspace-sidebar__hero-metrics">
                <div className="workspace-sidebar__hero-metric">
                  <span className="workspace-sidebar__hero-metric-value">{navSections.length}</span>
                  <span className="workspace-sidebar__hero-metric-label">Zones</span>
                </div>
                <div className="workspace-sidebar__hero-metric">
                  <span className="workspace-sidebar__hero-metric-value">{navItems.length}</span>
                  <span className="workspace-sidebar__hero-metric-label">Routes</span>
                </div>
                <div className="workspace-sidebar__hero-metric">
                  <span className="workspace-sidebar__hero-metric-value">
                    {viewer.mode === "live" ? "Live" : "Demo"}
                  </span>
                  <span className="workspace-sidebar__hero-metric-label">Mode</span>
                </div>
              </div>
            </section>

            <div className="workspace-sidebar__identity">
              <div className="workspace-sidebar__avatar">{initials}</div>
              <div className="min-w-0 flex-1">
                <div className="workspace-sidebar__identity-topline">
                  <div className="workspace-sidebar__name">{viewer.displayName}</div>
                  <span className="workspace-sidebar__presence" aria-hidden="true" />
                </div>
                <div className="workspace-sidebar__meta">{viewer.roleLabel}</div>
                <div className="workspace-sidebar__org">{viewer.organizationName}</div>
                <div className="workspace-sidebar__identity-pills">
                  <span className="workspace-sidebar__identity-pill">
                    {viewer.mode === "live" ? "Connected" : "Preview"}
                  </span>
                  <span className="workspace-sidebar__identity-pill">
                    {activeSectionTitle ?? "Workspace"}
                  </span>
                </div>
              </div>
            </div>

            <div className="workspace-sidebar__nav">
              <div className="workspace-sidebar__nav-heading">
                <span className="workspace-sidebar__nav-heading-label">Route map</span>
                <span className="workspace-sidebar__nav-heading-copy">{routeCountLabel}</span>
              </div>
              {navSections.map((section, index) => {
                const sectionActiveItem =
                  section.items.find((item) => isActivePath(pathname, item.href)) ?? null;
                const sectionIsActive = section.title === activeSectionTitle;

                return (
                  <section
                    className={cn(
                      "workspace-sidebar__section",
                      sectionIsActive && "workspace-sidebar__section--active"
                    )}
                    key={section.title}
                  >
                    <div className="workspace-sidebar__section-head">
                      <span className="workspace-sidebar__section-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="workspace-sidebar__section-heading">
                        <span className="workspace-sidebar__section-title">{section.title}</span>
                        <span className="workspace-sidebar__section-meta">
                          {sectionActiveItem?.label ?? `${section.items.length} destinations`}
                        </span>
                      </span>
                      <span className="workspace-sidebar__section-count">
                        {section.items.length}
                      </span>
                    </div>

                    <nav className="workspace-nav" aria-label={section.title}>
                      {section.items.map((item) => (
                        <Link
                          className={cn(
                            "workspace-nav__link",
                            isActivePath(pathname, item.href) && "workspace-nav__link--active"
                          )}
                          href={item.href}
                          key={item.href}
                        >
                          <span className="workspace-nav__icon" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="workspace-nav__copy">
                            <span className="workspace-nav__label">{item.label}</span>
                            <span className="workspace-nav__caption">{item.caption}</span>
                          </span>
                          <span className="workspace-nav__trail">
                            {isActivePath(pathname, item.href) ? "Now" : "Go"}
                          </span>
                        </Link>
                      ))}
                    </nav>
                  </section>
                );
              })}
            </div>
            <div className="workspace-sidebar__deck">
              <div className="workspace-sidebar__deck-head">
                <span className="workspace-sidebar__deck-title">Command brief</span>
                <span className="workspace-sidebar__deck-indicator" aria-hidden="true" />
              </div>
              <p className="workspace-sidebar__deck-copy">{roleSummary}</p>
              <div className="workspace-chip-row">
                <span className="workspace-chip">{viewer.roleLabel}</span>
                <span className="workspace-chip">{sectionCountLabel}</span>
                <span className="workspace-chip">
                  {viewer.mode === "live" ? "Connected" : "Preview"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="workspace-main">
          <div className="workspace-topline">
            <div>
              <div className="workspace-topline__eyebrow">Current focus</div>
              <div className="workspace-topline__title">{activeItem?.label ?? "Workspace"}</div>
              <p className="workspace-topline__copy">
                {activeItem?.caption ?? "Review the latest work happening in your workspace."}
              </p>
            </div>

            <div className="workspace-topline__actions">
              <ThemeToggle />

              <details className="workspace-account-menu">
                <summary className="workspace-account-menu__trigger">
                  <span className="workspace-account-menu__trigger-copy">
                    <span className="workspace-account-menu__trigger-label">Account</span>
                    <span className="workspace-account-menu__trigger-role">{viewer.roleLabel}</span>
                  </span>
                  <span className="workspace-account-menu__trigger-avatar">{initials}</span>
                  <span className="workspace-account-menu__trigger-chevron" aria-hidden="true">
                    <ChevronDownIcon />
                  </span>
                </summary>

                <div className="workspace-account-menu__panel">
                  <div className="workspace-account-menu__identity">
                    <div className="workspace-account-menu__name">{viewer.displayName}</div>
                    <div className="workspace-account-menu__meta">
                      {viewer.roleLabel} | {viewer.organizationName}
                    </div>
                  </div>

                  <Link className="workspace-account-menu__link" href="/profile">
                    Profile
                  </Link>

                  {viewer.hasSession ? (
                    <form action={signOutAction}>
                      <Button className="w-full" type="submit" variant="secondary">
                        Logout
                      </Button>
                    </form>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full" variant="secondary">
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </details>
            </div>
          </div>

          <div className="workspace-main__content">{children}</div>
        </section>
      </div>
    </main>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function DashboardIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M4 5.5h7v5H4zm9 0h7v8h-7zm-9 7h7v6H4zm9 5h7v1.5h-7z" />
    </svg>
  );
}

function PatientsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M9 11a3 3 0 100-6 3 3 0 000 6zm7 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.5 19a4.5 4.5 0 019 0v.5h-9zm9.5.5a3.5 3.5 0 017 0z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M9 4.5h6l.75 1.5H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3.25zM8 10.5h8M8 14.5h8" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M6 19.5V10m6 9.5V4.5m6 15V13M4 19.5h16" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8 3.5l-1.8.8a6.9 6.9 0 01-.5 1.2l.7 1.9-1.8 1.8-1.9-.7c-.4.2-.8.4-1.2.5L12 20l-1.3-1.8c-.4-.1-.8-.3-1.2-.5l-1.9.7-1.8-1.8.7-1.9a6.9 6.9 0 01-.5-1.2L4 12l1.8-.8c.1-.4.3-.8.5-1.2l-.7-1.9 1.8-1.8 1.9.7c.4-.2.8-.4 1.2-.5L12 4l1.3 1.8c.4.1.8.3 1.2.5l1.9-.7 1.8 1.8-.7 1.9c.2.4.4.8.5 1.2z" />
    </svg>
  );
}

function BrandMarkIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M4 12c0-4.4 3.6-8 8-8m8 8c0 4.4-3.6 8-8 8" />
      <path d="M6.5 16.5A8 8 0 0117.5 7.5" />
      <circle cx="12" cy="12" r="1.75" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M9.2 9a2.8 2.8 0 115.2 1.4c-.4.7-1 1.1-1.6 1.5-.8.5-1.3 1-1.3 2.1m.5 3.5h.1" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M8 10a3 3 0 100-6 3 3 0 000 6zm8 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3.5 19a4.5 4.5 0 019 0m2.5 0a3.5 3.5 0 017 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M12 3l7 3v5c0 4.7-2.8 7.8-7 10-4.2-2.2-7-5.3-7-10V6zM9 12l2 2 4-4" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M8.5 5a4.5 4.5 0 016.4 0l3.1 3.1a4.5 4.5 0 010 6.4l-2 2a4.5 4.5 0 01-6.4 0L6.5 13.4a4.5 4.5 0 010-6.4zM9 15l6-6" />
    </svg>
  );
}

function OfficeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M4 20.5V6.5l8-3v17m0 0h8V9.5l-8-3m0 14h3m-7-10h2m-2 4h2m6-4h2m-2 4h2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M7 11.5V8a5 5 0 0110 0v3.5M6 11.5h12v9H6z" />
    </svg>
  );
}

function ClaimsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M6 4.5h9l3 3v12H6zm8 0v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M6.5 9.5l5.5 5 5.5-5" />
    </svg>
  );
}
