import { redirect } from "next/navigation";
import { CaseDetailView } from "@/components/features/patients/case-detail-view";
import { ProviderFeedbackForm } from "@/components/features/provider/provider-feedback-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getCaseDetail } from "@/services/patients";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientDetailPage({
  params
}: PatientDetailPageProps) {
  const resolvedParams = await params;
  const viewer = await requireViewerContext();

  if (viewer.role === "patient") {
    redirect("/claims");
  }

  const detail = await getCaseDetail(resolvedParams.id);

  return (
    <WorkspaceShell pathname="/patients" viewer={viewer}>
      <PageIntro
        description={
          viewer.role === "provider"
            ? "Review the full assigned patient record and send doctor feedback directly into the case communication timeline."
            : "Each case combines patient identity, therapy, coverage, prior authorization, financial assistance, communications, and documents into one operational record."
        }
        eyebrow="Case detail"
        title={detail.patient.fullName}
      />
      {viewer.role === "provider" ? (
        <ProviderFeedbackForm caseId={detail.id} patientName={detail.patient.fullName} />
      ) : null}
      <CaseDetailView detail={detail} />
    </WorkspaceShell>
  );
}
