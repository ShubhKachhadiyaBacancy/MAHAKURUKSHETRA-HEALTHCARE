import { notFound } from "next/navigation";
import { OrganizerDeletePatientButton } from "@/components/features/organizer/organizer-delete-patient-button";
import { OrganizerPatientForm } from "@/components/features/organizer/organizer-patient-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  OrganizerServiceError,
  getOrganizerPatientDetail
} from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

type OrganizerPatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
};

export default async function OrganizerPatientDetailPage({
  params,
  searchParams
}: OrganizerPatientDetailPageProps) {
  const viewer = await requireViewerContext();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  if (viewer.role !== "organizer") {
    return (
      <WorkspaceShell pathname="/patients" viewer={viewer}>
        <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Organizer patient management is only available to organizers.
        </Card>
      </WorkspaceShell>
    );
  }

  try {
    const patient = await getOrganizerPatientDetail(id);
    const isEditMode = resolvedSearchParams.mode === "edit";

    return (
      <WorkspaceShell pathname="/patients" viewer={viewer}>
        <PageIntro
          action={
            <div className="flex gap-3">
              <OrganizerDeletePatientButton patientId={patient.id} redirectTo="/patients" />
              <a href={`/patients/manage/${patient.id}?mode=${isEditMode ? "view" : "edit"}`}>
                <Button variant="secondary">
                  {isEditMode ? "View summary" : "Edit record"}
                </Button>
              </a>
            </div>
          }
          description="Review the patient record, linked insurance coverage, prescriptions, and case activity from the organizer workspace."
          eyebrow="Patient details"
          title={`${patient.firstName} ${patient.lastName}`}
        />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
          <OrganizerPatientForm mode="edit" patient={patient} />

          <div className="section-stack">
            <Card className="space-y-4 p-6">
              <span className="eyebrow">Record summary</span>
              <div className="grid gap-4 text-sm text-slate-700 dark:text-slate-300">
                <div>Created: {patient.createdAt}</div>
                <div>Updated: {patient.updatedAt}</div>
                <div>Preferred channel: {patient.preferredChannel}</div>
                <div>Consent: {patient.consentStatus}</div>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <span className="eyebrow">Prescriptions</span>
              {patient.relatedPrescriptions.length > 0 ? (
                patient.relatedPrescriptions.map((entry) => (
                  <div
                    className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300"
                    key={entry.id}
                  >
                    <div className="font-medium text-slate-950 dark:text-white">
                      {entry.medication}
                    </div>
                    <div className="mt-2">{entry.therapyArea}</div>
                    <div className="mt-1">{entry.dosage}</div>
                    <div className="mt-1">{entry.diagnosis}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  No prescriptions linked yet.
                </div>
              )}
            </Card>

            <Card className="space-y-4 p-6">
              <span className="eyebrow">Insurance</span>
              {patient.insurancePolicies.length > 0 ? (
                patient.insurancePolicies.map((entry) => (
                  <div
                    className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300"
                    key={entry.id}
                  >
                    <div className="font-medium text-slate-950 dark:text-white">
                      {entry.payerName}
                    </div>
                    <div className="mt-2">{entry.planName}</div>
                    <div className="mt-1">{entry.memberId}</div>
                    <div className="mt-1">{entry.status}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  No insurance policies linked yet.
                </div>
              )}
            </Card>
          </div>
        </section>
      </WorkspaceShell>
    );
  } catch (error) {
    if (error instanceof OrganizerServiceError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
