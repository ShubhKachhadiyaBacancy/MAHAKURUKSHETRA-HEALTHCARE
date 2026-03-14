import type { Route } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { AdminDashboardSnapshot } from "@/types/admin";

type AdminDashboardOverviewProps = {
  snapshot: AdminDashboardSnapshot;
};

export function AdminDashboardOverview({
  snapshot
}: AdminDashboardOverviewProps) {
  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.summary.map((entry) => (
          <Card className="space-y-3 p-6" key={entry.label}>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {entry.label}
            </div>
            <div className="font-display text-4xl tracking-tight text-slate-950 dark:text-white">
              {entry.value}
            </div>
            <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {entry.detail}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_minmax(0,1.1fr)]">
        <Card className="space-y-5 p-6">
          <div>
            <span className="eyebrow">Role split</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              User distribution
            </h2>
          </div>

          <div className="space-y-4">
            {snapshot.roleDistribution.map((entry) => (
              <div className="space-y-2" key={entry.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {entry.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {entry.value} users
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                    style={{ width: `${Math.max(entry.share, entry.value > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  {entry.share}% of org users
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="section-stack">
          <Card className="p-6">
            <span className="eyebrow">Recent users</span>
            <div className="mt-5 space-y-4">
              {snapshot.recentUsers.map((entry) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40"
                  key={entry.id}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {entry.fullName}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {entry.email}
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {entry.role.replaceAll("_", " ")} • {entry.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <span className="eyebrow">Recent insurance</span>
            <div className="mt-5 space-y-4">
              {snapshot.recentInsurance.map((entry) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40"
                  key={entry.id}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {entry.patientName}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {entry.payerName}
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {entry.status} • {entry.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="section-stack">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Per-user charts</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              User dashboard slices
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Each card turns the user records already shown in the workspace into a role-aware
              workload chart.
            </p>
          </div>
          <Link className="ui-link-button" href="/users">
            Manage users
          </Link>
        </div>

        {snapshot.userCharts.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {snapshot.userCharts.map((entry) => {
              const maxValue = Math.max(...entry.metrics.map((metric) => metric.value), 1);

              return (
                <Card className="overflow-hidden p-6" key={entry.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                        {entry.role.replaceAll("_", " ")}
                      </div>
                      <h3 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
                        {entry.fullName}
                      </h3>
                    </div>
                    <Link
                      className="text-sm font-semibold text-slate-900 underline underline-offset-4 dark:text-white"
                      href={`/users/${entry.id}` as Route}
                    >
                      Open record
                    </Link>
                  </div>

                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {entry.email}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    <span>{entry.title}</span>
                    <span>Created {entry.createdAt}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {entry.detail}
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {entry.metrics.map((metric) => (
                      <div className="flex flex-col items-center gap-3" key={metric.label}>
                        <div className="flex h-40 w-full items-end rounded-[24px] bg-slate-100/80 p-3 dark:bg-slate-900/70">
                          <div
                            className={cn(
                              "w-full rounded-[18px] shadow-[0_20px_40px_-28px_rgba(15,23,42,0.8)] transition-transform duration-300 hover:-translate-y-1",
                              metric.tone === "sky" &&
                                "bg-gradient-to-t from-sky-700 via-sky-500 to-cyan-300",
                              metric.tone === "emerald" &&
                                "bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-300",
                              metric.tone === "amber" &&
                                "bg-gradient-to-t from-amber-700 via-amber-500 to-orange-300"
                            )}
                            style={{
                              height: `${Math.max(
                                (metric.value / maxValue) * 100,
                                metric.value > 0 ? 14 : 0
                              )}%`
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-slate-950 dark:text-white">
                            {metric.value}
                          </div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            {metric.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
            User charts will appear once the workspace has scoped user records to analyze.
          </Card>
        )}
      </section>
    </div>
  );
}
