import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { AdminMedicationForm } from "@/components/features/admin/admin-medication-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getMedicationDetail } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type MedicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MedicationDetailPage({
  params
}: MedicationDetailPageProps) {
  const viewer = await requireViewerContext();
  const { id } = await params;
  const medication = await getMedicationDetail(id);

  return (
    <WorkspaceShell pathname="/medications" viewer={viewer}>
      <PageIntro
        action={
          <AdminDeleteButton
            apiPath={`/api/admin/medications/${medication.id}`}
            confirmationMessage="Delete this medication?"
            redirectTo="/medications"
          />
        }
        description="Update medication metadata, support program information, and catalog status."
        eyebrow="Medications"
        title={medication.name}
      />
      <AdminMedicationForm medication={medication} mode="edit" />
    </WorkspaceShell>
  );
}
