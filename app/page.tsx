import type { Route } from "next";
import Link from "next/link";
import { CapabilityGrid } from "@/components/features/home/capability-grid";
import { Hero } from "@/components/features/home/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const contactRoute = "/contactus" as Route;

  return (
    <main className="page-shell">
      <div className="content-shell">
        <SiteHeader
          currentPath="/"
          navItems={[
            { href: "/", label: "Overview" },
            { href: contactRoute, label: "Contact Us" },
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" }
          ]}
        />

        <Hero />

        <CapabilityGrid />

        <Card className="cta-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="eyebrow">Implementation ready</span>
            <h2 className="mt-2 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
              Launch a care operations workspace that reads clearly from day one.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Set up the organizer account, invite the team, and start from a
              system where hierarchy, spacing, and status language already feel
              production-ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={contactRoute}>
              <Button variant="secondary">Contact us</Button>
            </Link>
            <Link href="/register">
              <Button>Create account</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
