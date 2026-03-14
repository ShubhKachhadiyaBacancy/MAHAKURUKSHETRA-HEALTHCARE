import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ReportsSnapshot } from "@/types/workspace";

type ReportTableProps = {
  snapshot: ReportsSnapshot;
};

export function ReportTable({ snapshot }: ReportTableProps) {
  if (snapshot.rows.length === 0) {
    return (
      <EmptyState
        description="No report rows are available for this role yet."
        title="Nothing to export"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
              <th className="px-6 py-4 font-medium">Patient</th>
              <th className="px-6 py-4 font-medium">Therapy</th>
              <th className="px-6 py-4 font-medium">Payer</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {snapshot.rows.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.patientName}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.therapy}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.payer}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.status}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.createdAt}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
