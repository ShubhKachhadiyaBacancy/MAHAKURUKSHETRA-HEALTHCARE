import type { Route } from "next";
import Link from "next/link";
import { OrganizerDeletePatientButton } from "@/components/features/organizer/organizer-delete-patient-button";
import { Card } from "@/components/ui/card";
import type { OrganizerPatientsPage } from "@/types/organizer";

type OrganizerPatientsTableProps = {
  snapshot: OrganizerPatientsPage;
};

export function OrganizerPatientsTable({ snapshot }: OrganizerPatientsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
          <thead>
            <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              <th className="px-6 py-4 font-medium">Patient</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Preferences</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
            {snapshot.rows.length > 0 ? (
              snapshot.rows.map((row) => (
                <tr className="align-top" key={row.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-950 dark:text-white">{row.name}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Consent {row.consentStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                    <div>{row.email}</div>
                    <div>{row.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.preferredChannel}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/patients/manage/${row.id}` as Route}
                      >
                        View
                      </Link>
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/patients/manage/${row.id}?mode=edit` as Route}
                      >
                        Edit
                      </Link>
                      <OrganizerDeletePatientButton patientId={row.id} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-slate-600 dark:text-slate-300"
                  colSpan={6}
                >
                  No patients matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
