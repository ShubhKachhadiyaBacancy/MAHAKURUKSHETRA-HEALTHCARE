import { PatientClaimsPanel } from "@/components/features/patient/patient-claims-panel";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { getPatientClaimsSnapshot } from "@/services/patient";
import { requireViewerContext } from "@/services/viewer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "patients") {
    return (
      <WorkspaceShell pathname="/claims" viewer={viewer}>
        <PageIntro
          action={
            <Link href="/patients">
              <Button variant="secondary">Open patient queue</Button>
            </Link>
          }
          description="Claims self-service is reserved for the patient workspace."
          eyebrow="Claims"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  const snapshot = await getPatientClaimsSnapshot();

  return (
    <WorkspaceShell pathname="/claims" viewer={viewer}>
      <PageIntro
        description="Create, update, delete, and track your own claims without leaving the patient workspace."
        eyebrow="Claims"
        title="My claims"
      />
      <PatientClaimsPanel snapshot={snapshot} />
    </WorkspaceShell>
  );
}
