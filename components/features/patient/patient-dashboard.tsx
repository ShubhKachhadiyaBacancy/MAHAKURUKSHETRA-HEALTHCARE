import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusPill } from "@/components/shared/status-pill";
import type { PatientDashboardSnapshot } from "@/types/patient";

type PatientDashboardProps = {
  snapshot: PatientDashboardSnapshot;
};

export function PatientDashboard({ snapshot }: PatientDashboardProps) {
  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.metrics.map((metric) => (
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
        <Card className="space-y-5 p-6">
          <div>
            <span className="eyebrow">Assigned care team</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              {snapshot.organizationName}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock label="Assigned office" value={snapshot.officeName} />
            <InfoBlock label="Care coordinator" value={snapshot.careCoordinator} />
            <InfoBlock label="Next action" value={snapshot.nextAction} />
            <InfoBlock label="Claims workspace" value="Create, update, and track your own claims." />
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="eyebrow">Assigned medications</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
                Current therapies
              </h2>
            </div>
            <Link className="text-sm font-medium text-slate-900 underline dark:text-white" href="/profile">
              View profile
            </Link>
          </div>

          <div className="space-y-4">
            {snapshot.medications.map((row) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4" key={row.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-semibold text-slate-950">{row.medicationName}</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {row.therapyArea}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {row.dosage} | {row.diagnosis}
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                  {row.providerName} | {row.officeName} | {row.writtenAt}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <span className="eyebrow">Recent claims</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              Claim activity
            </h2>
          </div>
          <Link className="text-sm font-medium text-slate-900 underline dark:text-white" href="/claims">
            Manage claims
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
                <th className="px-6 py-4 font-medium">Claim</th>
                <th className="px-6 py-4 font-medium">Medication</th>
                <th className="px-6 py-4 font-medium">Office</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshot.claims.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-950">{row.claimNumber}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {row.serviceDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.medicationName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.officeName}</td>
                  <td className="px-6 py-4">
                    <StatusPill
                      tone={
                        row.status === "denied"
                          ? "critical"
                          : row.status === "approved" || row.status === "paid"
                            ? "default"
                            : "warning"
                      }
                    >
                      {row.status.replaceAll("_", " ")}
                    </StatusPill>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{value}</div>
    </div>
  );
}
