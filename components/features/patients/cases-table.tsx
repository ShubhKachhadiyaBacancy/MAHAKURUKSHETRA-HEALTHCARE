import type { Route } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseListItem } from "@/types/workspace";

type CasesTableProps = {
  cases: CaseListItem[];
};

export function CasesTable({ cases }: CasesTableProps) {
  if (cases.length === 0) {
    return (
      <EmptyState
        description="No assigned patients matched the current filters."
        title="No patient cases found"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="workspace-table min-w-full divide-y divide-slate-200 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
              <th className="px-6 py-4 font-medium">Patient</th>
              <th className="px-6 py-4 font-medium">Therapy</th>
              <th className="px-6 py-4 font-medium">Payer</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Affordability</th>
              <th className="px-6 py-4 font-medium">Next action</th>
              <th className="px-6 py-4 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((entry) => (
              <tr className="align-top" key={entry.id}>
                <td className="px-6 py-4">
                  <Link
                    className="font-medium text-slate-950 underline-offset-4 hover:underline"
                    href={`/patients/${entry.id}` as Route}
                  >
                    {entry.patientName}
                  </Link>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                    {entry.therapyArea} | {entry.updatedAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{entry.therapy}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{entry.payer}</td>
                <td className="px-6 py-4">
                  <StatusPill
                    tone={
                      entry.priority === "critical"
                        ? "critical"
                        : entry.priority === "watch"
                          ? "warning"
                          : "default"
                    }
                  >
                    {entry.status}
                  </StatusPill>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {entry.affordabilityStatus}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{entry.nextAction}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{entry.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
