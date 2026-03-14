import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { AdminInsuranceForm } from "@/components/features/admin/admin-insurance-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import {
  getOrganizerInsuranceDetail,
  getOrganizerPatientOptions
} from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type InsuranceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InsuranceDetailPage({
  params
}: InsuranceDetailPageProps) {
  const viewer = await requireViewerContext();
  const { id } = await params;
  const [insurance, patients] = await Promise.all([
    getOrganizerInsuranceDetail(id),
    getOrganizerPatientOptions()
  ]);

  return (
    <WorkspaceShell pathname="/insurance" viewer={viewer}>
      <PageIntro
        action={
          <AdminDeleteButton
            apiPath={`/api/organizer/insurance/${insurance.id}`}
            confirmationMessage="Delete this insurance policy?"
            redirectTo="/insurance"
          />
        }
        description="Review or update the payer, member data, and verification notes for this policy."
        eyebrow="Insurance"
        title={insurance.patientName}
      />
      <AdminInsuranceForm insurance={insurance} mode="edit" patients={patients} />
    </WorkspaceShell>
  );
}
