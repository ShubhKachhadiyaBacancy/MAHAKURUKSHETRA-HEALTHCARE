import { AdminMedicationForm } from "@/components/features/admin/admin-medication-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function NewMedicationPage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "admin") {
    return (
      <WorkspaceShell pathname="/medications" viewer={viewer}>
        <PageIntro
          description="Medication creation is reserved for admins."
          eyebrow="Medications"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell pathname="/medications" viewer={viewer}>
      <PageIntro
        description="Add a medication to the shared catalog."
        eyebrow="Medications"
        title="Create medication"
      />
      <AdminMedicationForm mode="create" />
    </WorkspaceShell>
  );
}
