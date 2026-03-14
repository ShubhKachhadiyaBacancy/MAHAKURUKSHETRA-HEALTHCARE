import { AdminDashboardOverview } from "@/components/features/admin/admin-dashboard-overview";
import { DashboardOverview } from "@/components/features/dashboard/dashboard-overview";
import { PatientDashboard } from "@/components/features/patient/patient-dashboard";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { getAdminDashboardSnapshot } from "@/services/admin-workspace";
import { getDashboardSnapshot } from "@/services/dashboard";
import { getPatientDashboardSnapshot } from "@/services/patient";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const viewer = await requireViewerContext();

  if (viewer.role === "admin") {
    const snapshot = await getAdminDashboardSnapshot();

    return (
      <WorkspaceShell pathname="/dashboard" viewer={viewer}>
        <PageIntro
          action={<Card className="px-4 py-3 text-sm text-slate-600">Live admin data</Card>}
          description="Track users, insurance, medications, and role distribution from one admin dashboard."
          eyebrow="Admin dashboard"
          title="Organization control center"
        />
        <AdminDashboardOverview snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  if (viewer.role === "patient") {
    const snapshot = await getPatientDashboardSnapshot();

    return (
      <WorkspaceShell pathname="/dashboard" viewer={viewer}>
        <PageIntro
          action={<Card className="px-4 py-3 text-sm text-slate-600">{snapshot.sourceLabel}</Card>}
          description="See your own medications, office assignment, claim activity, and next care step from a patient-specific dashboard."
          eyebrow="Patient dashboard"
          title="My care workspace"
        />
        <PatientDashboard snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  const dashboard = await getDashboardSnapshot();
  const isDoctor = viewer.role === "provider";

  return (
    <WorkspaceShell pathname="/dashboard" viewer={viewer}>
      <PageIntro
        action={<Card className="px-4 py-3 text-sm text-slate-600">{dashboard.sourceLabel}</Card>}
        description={
          isDoctor
            ? "Review your assigned patients, spot urgent access blockers, and keep feedback flowing back to the care team from one doctor workspace."
            : "The dashboard is built as a command center, not a vanity surface. It prioritizes the cases, communications, and blockers that change time-to-therapy outcomes."
        }
        eyebrow={isDoctor ? "Doctor dashboard" : "Provider workspace"}
        title={isDoctor ? "Assigned patient command center" : "Access command center"}
      />
      <DashboardOverview data={dashboard} />
    </WorkspaceShell>
  );
}
