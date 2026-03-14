import type { Route } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/features/contact/contact-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const contactReasons = [
  {
    title: "Implementation",
    body: "Plan onboarding, setup, and rollout before the team touches live data."
  },
  {
    title: "Access support",
    body: "Use the public form when sign-in is blocked or the workspace is not provisioned yet."
  },
  {
    title: "Workflow",
    body: "Share questions around intake, benefits, affordability, or readiness."
  }
];

export default function ContactUsPage() {
  const contactRoute = "/contactus" as Route;

  return (
    <main className="page-shell">
      <div className="content-shell">
        <SiteHeader
          currentPath={contactRoute}
          navItems={[
            { href: "/", label: "Overview" },
            { href: contactRoute, label: "Contact Us" },
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" }
          ]}
        />

        <section className="grid gap-8 xl:grid-cols-[0.92fr_minmax(0,1.08fr)] xl:items-start">
          <div className="section-stack">
            <Card className="cta-panel overflow-hidden p-6 sm:p-8">
              <span className="eyebrow">Pre-login support</span>
              <h1 className="mt-3 max-w-2xl font-display text-5xl tracking-tight text-slate-950 sm:text-6xl">
                Reach the team before workspace access is live.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Use the public form for onboarding and access questions outside the
                authenticated workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login">
                  <Button variant="secondary">Back to login</Button>
                </Link>
                <Link href="/register">
                  <Button>Create account</Button>
                </Link>
              </div>
            </Card>

            <div className="grid gap-4">
              {contactReasons.map((item) => (
                <Card className="p-5" key={item.title}>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                    {item.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <ContactForm />
        </section>
      </div>
    </main>
  );
}
