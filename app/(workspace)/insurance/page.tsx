import Link from "next/link";
import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrganizerInsurancePage } from "@/services/organizer";
import { getAdminInsurancePage } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type InsurancePageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function InsurancePage({ searchParams }: InsurancePageProps) {
  const viewer = await requireViewerContext();
  const resolvedSearchParams = await searchParams;
  const snapshot =
    viewer.role === "admin"
      ? await getAdminInsurancePage({
          query: resolvedSearchParams.q ?? "",
          page: resolvedSearchParams.page ?? "1"
        })
      : await getOrganizerInsurancePage({
          query: resolvedSearchParams.q ?? "",
          page: resolvedSearchParams.page ?? "1"
        });

  if (viewer.role !== "admin" && viewer.role !== "organizer") {
    return (
      <WorkspaceShell pathname="/insurance" viewer={viewer}>
        <PageIntro
          description="Insurance management is reserved for admins and organizers."
          eyebrow="Insurance"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell pathname="/insurance" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/insurance/new">
            <Button>Create insurance</Button>
          </Link>
        }
        description={
          viewer.role === "admin"
            ? "Admins can create, update, delete, and review insurance policies across the system."
            : "Organizers can create, update, delete, and review insurance policies across the organization."
        }
        eyebrow="Insurance"
        title="Insurance management"
      />

      <form className="max-w-md" method="get">
        <Input defaultValue={snapshot.query} name="q" placeholder="Search payer, plan, or member ID" />
      </form>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Payer</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Member ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
              {snapshot.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {row.patientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.payerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.planName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.memberId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.status}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/insurance/${row.id}`}
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton
                        apiPath={
                          viewer.role === "admin"
                            ? `/api/admin/insurance/${row.id}`
                            : `/api/organizer/insurance/${row.id}`
                        }
                        confirmationMessage="Delete this insurance policy?"
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
