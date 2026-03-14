import { AdminInsuranceForm } from "@/components/features/admin/admin-insurance-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getOrganizerPatientOptions } from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function NewInsurancePage() {
  const viewer = await requireViewerContext();
  const patients = await getOrganizerPatientOptions();

  return (
    <WorkspaceShell pathname="/insurance" viewer={viewer}>
      <PageIntro
        description="Create an insurance policy directly from the organizer workspace."
        eyebrow="Insurance"
        title="Create insurance"
      />
      <AdminInsuranceForm mode="create" patients={patients} />
    </WorkspaceShell>
  );
}
