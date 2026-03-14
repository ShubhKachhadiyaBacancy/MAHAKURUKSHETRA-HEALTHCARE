import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { getMedicationCatalog } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function MedicationsPage() {
  const viewer = await requireViewerContext();
  const snapshot = await getMedicationCatalog({ query: "", page: "1" });

  return (
    <WorkspaceShell pathname="/medications" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/medications/new">
            <Button>Create medication</Button>
          </Link>
        }
        description="Admins can create, update, and delete medications in the shared catalog."
        eyebrow="Medications"
        title="Medication catalog"
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Medication</th>
                <th className="px-6 py-4 font-medium">Manufacturer</th>
                <th className="px-6 py-4 font-medium">Therapy area</th>
                <th className="px-6 py-4 font-medium">Program</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
              {snapshot.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.manufacturer}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.therapyArea}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.supportProgram}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/medications/${row.id}`}
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton
                        apiPath={`/api/admin/medications/${row.id}`}
                        confirmationMessage="Delete this medication?"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </WorkspaceShell>
  );
}
