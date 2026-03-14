import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { getOrganizerOfficesSnapshot } from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function OfficesPage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "organizer") {
    return (
      <WorkspaceShell pathname="/offices" viewer={viewer}>
        <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Office management is only available to organizers.
        </Card>
      </WorkspaceShell>
    );
  }

  const snapshot = await getOrganizerOfficesSnapshot();

  return (
    <WorkspaceShell pathname="/offices" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/offices/new">
            <Button>Create office</Button>
          </Link>
        }
        description="Create, update, and maintain office locations and contact details for the organization."
        eyebrow="Offices"
        title="Office management"
      />

      <Card className="rounded-[32px] border border-dashed border-slate-200 bg-white/80 p-5 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        {snapshot.note}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Office</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
              {snapshot.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-950 dark:text-white">{row.name}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Updated {row.updatedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {[row.addressLine1, row.addressLine2, row.city, row.state, row.zipCode]
                      .filter(Boolean)
                      .join(", ") || "Location pending"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {[row.phone, row.email].filter(Boolean).join(" • ") || "Contact pending"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/offices/${row.id}`}
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton
                        apiPath={`/api/organizer/offices/${row.id}`}
                        confirmationMessage="Delete this office?"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {snapshot.rows.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-8 text-sm text-slate-600 dark:text-slate-300"
                    colSpan={4}
                  >
                    No offices have been added yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </WorkspaceShell>
  );
}
