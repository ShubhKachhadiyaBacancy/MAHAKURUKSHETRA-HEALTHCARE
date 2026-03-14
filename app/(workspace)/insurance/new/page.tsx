import { AdminInsuranceForm } from "@/components/features/admin/admin-insurance-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getOrganizerPatientOptions } from "@/services/organizer";
import { getPatientOptions } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function NewInsurancePage() {
  const viewer = await requireViewerContext();
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

  const patients =
    viewer.role === "admin" ? await getPatientOptions() : await getOrganizerPatientOptions();
  const apiBase = viewer.role === "admin" ? "/api/admin" : "/api/organizer";

  return (
    <WorkspaceShell pathname="/insurance" viewer={viewer}>
      <PageIntro
        description="Create an insurance policy directly from the organizer workspace."
        eyebrow="Insurance"
        title="Create insurance"
      />
      <AdminInsuranceForm mode="create" patients={patients} apiBase={apiBase} />
    </WorkspaceShell>
  );
}
