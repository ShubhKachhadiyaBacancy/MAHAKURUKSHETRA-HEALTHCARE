import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminInviteForm } from "@/components/features/admin/admin-invite-form";
import { AdminModuleGrid } from "@/components/features/admin/admin-module-grid";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { modulePermissions } from "@/lib/permissions";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

const stats = [
  { label: "Modules tracked", value: `${modulePermissions.length}` },
  { label: "Enforced roles", value: "5 workspace roles" },
  { label: "API endpoint", value: "/api/admin/modules" }
];

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
            <div className="grid gap-6 lg:grid-cols-[1.2fr_minmax(0,0.8fr)]">
              <AdminModuleGrid />

              <Card className="space-y-5 rounded-[32px] border border-slate-100 bg-white/80 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      Snapshot
                    </p>
                    <h3 className="font-display text-2xl text-slate-950 dark:text-white">
                      Admin overview
                    </h3>
                  </div>
                  <Badge tone="accent">Admin only</Badge>
                </div>

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

                <div className="rounded-2xl bg-slate-100/70 p-4 text-xs uppercase tracking-[0.3em] text-slate-500 dark:bg-slate-900/70 dark:text-slate-300">
                  Supabase RLS policies should mirror this matrix and guard the new{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">/api/admin/modules</span>{" "}
                  endpoint.
                </div>
              </Card>
            </div>
          </section>

          <section className="section-stack">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="eyebrow">Invitations</span>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-900 dark:text-white">
                  Grow the workspace safely
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Invite patients, providers, case managers, or staff members so each role can see the views outlined in the RBAC matrix.
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Only administrators can send invites.
              </div>
            </div>
            <AdminInviteForm />
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
