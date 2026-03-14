import { Card } from "@/components/ui/card";
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
    </div>
  );
}
