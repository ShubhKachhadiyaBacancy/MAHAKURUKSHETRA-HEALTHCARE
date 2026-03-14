import { OrganizerPatientForm } from "@/components/features/organizer/organizer-patient-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { requireViewerContext } from "@/services/viewer";

export default async function NewOrganizerPatientPage() {
  const viewer = await requireViewerContext();

  return (
    <WorkspaceShell pathname="/patients" viewer={viewer}>
      <PageIntro
        description="Create a patient record directly in the organizer workspace. This flow manages the patients table only and keeps data scoped to the current organization."
        eyebrow="Patients"
        title="Create patient"
      />

      {viewer.role === "admin" ? (
        <OrganizerPatientForm mode="create" />
      ) : (
        <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Organizer patient creation is only available to organization administrators.
        </Card>
      )}
    </WorkspaceShell>
  );
}
