import Link from "next/link";
import { PatientRegistrationForm } from "@/components/features/intake/patient-registration-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const viewer = await requireViewerContext();

  return (
    <WorkspaceShell pathname="/intake" viewer={viewer}>
      <PageIntro
        eyebrow="Patient registration"
        title="Register patients inside the workspace"
        description="Authenticated admins, providers, and case managers add new patients, prescriptions, and cases without leaving their workspace."
        action={
          <Link href="/patients">
            <Button variant="secondary">Open patient queue</Button>
          </Link>
        }
      />

      <section className="section-stack">
        <PatientRegistrationForm />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <span className="eyebrow">Visibility</span>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Registered patients show up immediately across the dashboard, reports, and communications timelines.
            </p>
          </Card>

          <Card className="p-6">
            <span className="eyebrow">Operational data</span>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The form seeds prescriptions, insurance policies, and cases so benefits investigation can start without manual setup.
            </p>
          </Card>

          <Card className="p-6">
            <span className="eyebrow">Next step</span>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              After submitting, the case flows into prior authorization, affordability, and pharmacy coordination workstreams.
            </p>
          </Card>
        </div>
      </section>
    </WorkspaceShell>
  );
}
