import type { Route } from "next";
import Link from "next/link";
import { CapabilityGrid } from "@/components/features/home/capability-grid";
import { Hero } from "@/components/features/home/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const workflow = [
  {
    title: "Enrollment",
    body: "Collect the therapy story, payer details, and support needs without forcing the access team to reconstruct the case later."
  },
  {
    title: "Coverage",
    body: "Track benefits investigation and prior authorization in the same operational lane so handoffs do not disappear into email."
  },
  {
    title: "Affordability",
    body: "Surface copay, bridge, and assistance opportunities alongside the case instead of in separate spreadsheets."
  },
  {
    title: "Readiness",
    body: "Coordinate pharmacy, provider, and patient outreach from one source of truth until therapy begins."
  }
];

const queueSignals = [
  {
    title: "What the team sees first",
    body: "Urgent payer asks, incomplete packets, affordability flags, and outreach due now are surfaced before the team opens a case."
  },
  {
    title: "What the patient feels",
    body: "Fewer repeated questions, clearer next steps, and less time spent waiting for someone to piece the case back together."
  }
];

const commandMetrics = [
  { value: "92%", label: "payer packet completeness" },
  { value: "7", label: "same-day affordability matches" },
  { value: "18", label: "outreach events captured" }
];

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

        <section className="grid gap-4 lg:grid-cols-[1.15fr_minmax(0,0.85fr)]">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-6 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <span className="eyebrow">Operational lens</span>
                  <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
                    The landing surface should tell the team where therapy might
                    stall in the next thirty minutes.
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-500">
                  Case-first design
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {queueSignals.map((item) => (
                  <div className="panel-muted rounded-[28px] p-5" key={item.title}>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                      {item.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="home-metric-card p-6 sm:p-8">
            <span className="eyebrow">System pulse</span>
            <div className="mt-3 max-w-sm font-display text-4xl tracking-tight text-slate-950">
              One operating rhythm across providers, payers, and patients.
            </div>
            <div className="mt-8 grid gap-4">
              {commandMetrics.map((item) => (
                <div
                  className="rounded-[26px] border border-white/60 bg-white/65 px-5 py-4 backdrop-blur"
                  key={item.label}
                >
                  <div className="font-display text-3xl tracking-tight text-slate-950">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <CapabilityGrid />

        <section className="section-stack">
          <SectionHeading
            eyebrow="Workflow model"
            title="Keep the navigation shallow. Make the workflow model deeper."
            description="The design borrows the operational simplicity of the reference products, but upgrades the actual work surface with clearer status modeling, affordability orchestration, and next-action visibility."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (
              <Card className="workflow-card p-5" key={item.title}>
                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                  {item.title}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <Card className="cta-panel flex flex-col gap-6 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="eyebrow">Ready to explore</span>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
              Create the admin account and start onboarding your team.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Registration creates the first administrator. After sign-in, that
              admin can invite providers, case managers, and staff into the live
              workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={contactRoute}>
              <Button variant="secondary">Contact us</Button>
            </Link>
            <Link href="/register">
              <Button>Create live account</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
