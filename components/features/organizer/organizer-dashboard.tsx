import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrganizerDashboardSnapshot } from "@/types/organizer";

type OrganizerDashboardProps = {
  snapshot: OrganizerDashboardSnapshot;
};

export function OrganizerDashboard({ snapshot }: OrganizerDashboardProps) {
  const maxGrowth = Math.max(...snapshot.growth.map((entry) => entry.value), 1);

  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.summary.map((entry) => (
          <Card className="space-y-4 p-6" key={entry.label}>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {entry.label}
            </div>
            <div className="font-display text-4xl tracking-tight text-slate-950 dark:text-white">
              {entry.value}
            </div>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {entry.detail}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_minmax(0,0.95fr)]">
        <Card className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow">Patient growth</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
                New patients over time
              </h2>
            </div>
            <Badge tone="accent">{snapshot.sourceLabel}</Badge>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {snapshot.growth.map((entry) => (
              <div className="flex flex-col items-center gap-3" key={entry.label}>
                <div className="flex h-48 w-full items-end rounded-[28px] bg-slate-100/80 p-3 dark:bg-slate-900/70">
                  <div
                    className="w-full rounded-[22px] bg-gradient-to-t from-sky-600 via-cyan-500 to-emerald-400"
                    style={{
                      height: `${Math.max(
                        (entry.value / maxGrowth) * 100,
                        entry.value > 0 ? 14 : 0
                      )}%`
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {entry.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    {entry.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div>
            <span className="eyebrow">Organization mix</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              Workflow distribution
            </h2>
          </div>

          <div className="space-y-4">
            {snapshot.distribution.length > 0 ? (
              snapshot.distribution.map((entry) => (
                <div className="space-y-2" key={entry.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {entry.label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {entry.value} cases
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                      style={{ width: `${Math.max(entry.share, entry.value > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    {entry.share}% of active workflow volume
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Distribution will appear once cases are created for this organization.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(0,0.8fr)]">
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow">Recent intake</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
                Fresh patient registrations
              </h2>
            </div>
            <Link href="/patients">
              <Button variant="secondary">Manage patients</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {snapshot.recentPatients.map((entry) => (
              <div
                className="rounded-[28px] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/40"
                key={entry.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-950 dark:text-white">
                      {entry.name}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {entry.location}
                    </div>
                  </div>
                  <Badge tone={entry.consentStatus === "received" ? "accent" : "default"}>
                    {entry.consentStatus}
                  </Badge>
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Added {entry.createdAt}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <span className="eyebrow">Actions</span>
          <h2 className="font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Organizer shortcuts
          </h2>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Move from oversight into action without leaving the organization shell.
          </p>
          <div className="grid gap-3">
            <Link href="/patients/manage/new">
              <Button className="w-full">Create patient</Button>
            </Link>
            <Link href="/reports">
              <Button className="w-full" variant="secondary">
                Generate reports
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full" variant="ghost">
                Update organizer profile
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
