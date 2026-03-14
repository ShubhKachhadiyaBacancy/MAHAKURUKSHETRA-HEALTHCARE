import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminInviteForm } from "@/components/features/admin/admin-invite-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { modulePermissions } from "@/lib/permissions";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

const stats = [
  { label: "Modules tracked", value: `${modulePermissions.length}` },
  { label: "Enforced roles", value: "4 workspace roles" },
  { label: "API endpoint", value: "/api/admin/modules" }
];

function summarizePrivileges(privileges: {
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  view: boolean;
}) {
  if (privileges.add && privileges.edit && privileges.delete) {
    return "Full";
  }
  if (privileges.add && privileges.edit) {
    return "Manage";
  }
  if (privileges.view) {
    return "View";
  }
  return "None";
}

export default async function AdminPage() {
  const viewer = await requireViewerContext();
  const isAdmin = viewer.role === "admin";

  return (
    <WorkspaceShell pathname="/admin" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/settings">
            <Button variant="secondary">Review workflow preferences</Button>
          </Link>
        }
        eyebrow="Admin console"
        title="RBAC control center"
        description="Monitor who can see and modify every module inside the workspace before enforcing it through Supabase."
      />

      {isAdmin ? (
        <>
          <section className="section-stack">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
              <Card className="space-y-4 rounded-[28px] border border-slate-100 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="eyebrow">Quick actions</span>
                <h2 className="font-display text-2xl text-slate-950 dark:text-white">
                  Keep access simple
                </h2>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Start with invites, then review the permission summary below. This is a simplified view of the
                  RBAC matrix so you can verify access without reading dense grids.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/users">
                    <Button>Manage users</Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="secondary">Download reports</Button>
                  </Link>
                </div>
              </Card>

              <Card className="space-y-4 rounded-[28px] border border-slate-100 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="eyebrow">At a glance</span>
                <div className="grid gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                        {stat.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <section className="section-stack">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="eyebrow">Invitations</span>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-900 dark:text-white">
                  Invite new collaborators
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Invite organizers, doctors, or patients with clear, role-specific access.
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Only administrators can send invites.
              </div>
            </div>
            <AdminInviteForm />
          </section>

          <section className="section-stack">
            <Card className="overflow-hidden rounded-[28px] border border-slate-100 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="px-6 pt-6">
                <span className="eyebrow">Access summary</span>
                <h2 className="mt-2 font-display text-2xl text-slate-950 dark:text-white">
                  Permission overview
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Quick labels show each role’s access level per module.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-4 font-medium">Module</th>
                      <th className="px-6 py-4 font-medium">Admin</th>
                      <th className="px-6 py-4 font-medium">Organizer</th>
                      <th className="px-6 py-4 font-medium">Patients</th>
                      <th className="px-6 py-4 font-medium">Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
                    {modulePermissions.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {entry.module}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {summarizePrivileges(entry.privileges.admin)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {summarizePrivileges(entry.privileges.organizer)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {summarizePrivileges(entry.privileges.patients)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {summarizePrivileges(entry.privileges.doctor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </>
      ) : (
        <Card className="space-y-4 rounded-[32px] border border-slate-100 bg-white/80 p-6 text-sm text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Access restricted
            </p>
            <h3 className="mt-2 font-display text-2xl text-slate-900 dark:text-white">
              Admin controls are only available to administrators.
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              This console reflects the RBAC matrix provided in the architecture brief.
              Request elevated rights from another administrator or check your workspace role
              in <Link className="font-medium text-slate-900 underline dark:text-white" href="/settings">
                Settings
              </Link>
              .
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="ghost">Return to dashboard</Button>
          </Link>
        </Card>
      )}
    </WorkspaceShell>
  );
}
