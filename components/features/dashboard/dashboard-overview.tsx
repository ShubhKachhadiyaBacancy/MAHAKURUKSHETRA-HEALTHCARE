import type { Route } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import type { ProviderDashboardData } from "@/types/dashboard";

type DashboardOverviewProps = {
  data: ProviderDashboardData;
};

export function DashboardOverview({ data }: DashboardOverviewProps) {
  return (
    <div className="section-stack">
      <section className="metric-grid">
        {data.metrics.map((metric) => (
          <MetricCard
            detail={metric.detail}
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </section>

      <section className="workspace-grid">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <span className="eyebrow">Priority queue</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">
                Cases needing coordinated action
              </h2>
            </div>
            <Link className="text-sm font-medium text-slate-900 underline" href="/patients">
              View all
            </Link>
          </div>

          {data.cases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    <th className="px-6 py-4 font-medium">Patient</th>
                    <th className="px-6 py-4 font-medium">Therapy</th>
                    <th className="px-6 py-4 font-medium">Payer</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Next action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.cases.map((entry) => (
                    <tr className="align-top" key={entry.id}>
                      <td className="px-6 py-4">
                        <Link
                          className="font-medium text-slate-950 underline-offset-4 hover:underline"
                          href={`/patients/${entry.id}` as Route}
                        >
                          {entry.patientName}
                        </Link>
                        <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                          {entry.priorityLabel}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{entry.therapy}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{entry.payer}</td>
                      <td className="px-6 py-4">
                        <StatusPill tone={entry.tone}>{entry.status}</StatusPill>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{entry.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                description="No assigned cases are active right now."
                title="Queue is clear"
              />
            </div>
          )}
        </Card>

        <div className="section-stack">
          <Card className="p-6">
            <span className="eyebrow">Outreach queue</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">
              Next patient touches
            </h2>
            <div className="mt-5 space-y-4">
              {data.outreachQueue.length > 0 ? (
                data.outreachQueue.map((item) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    key={`${item.recipient}-${item.scheduledFor}`}
                  >
                    <div className="text-sm font-medium text-slate-900">{item.recipient}</div>
                    <div className="mt-1 text-sm leading-7 text-slate-600">{item.summary}</div>
                    <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {item.channel} | {item.scheduledFor}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-600">
                  No scheduled patient touches are waiting for you.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <span className="eyebrow">Recent activity</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">
              Workflow movement
            </h2>
            <div className="mt-5 space-y-4">
              {data.activityLog.length > 0 ? (
                data.activityLog.map((item) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    key={`${item.timestamp}-${item.title}`}
                  >
                    <div className="text-sm font-medium text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm leading-7 text-slate-600">
                      {item.description}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {item.timestamp}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-600">
                  Activity will appear here after your assigned cases move.
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
