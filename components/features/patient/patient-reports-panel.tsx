import { Card } from "@/components/ui/card";
import type { PatientClaimsSnapshot } from "@/types/patient";

type PatientReportsPanelProps = {
  snapshot: PatientClaimsSnapshot;
};

export function PatientReportsPanel({ snapshot }: PatientReportsPanelProps) {
  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.metrics.map((metric) => (
          <Card className="space-y-3 p-5" key={metric.label}>
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              {metric.label}
            </div>
            <div className="font-display text-4xl tracking-tight text-slate-950 dark:text-white">
              {metric.value}
            </div>
            <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {metric.note}
            </div>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <span className="eyebrow">Claim report</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Export-ready claim summary
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="workspace-table min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
                <th className="px-6 py-4 font-medium">Claim</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Medication</th>
                <th className="px-6 py-4 font-medium">Office</th>
                <th className="px-6 py-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshot.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-950">{row.claimNumber}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {row.serviceDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.claimType}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {row.status.replaceAll("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.medicationName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.officeName}</td>
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
