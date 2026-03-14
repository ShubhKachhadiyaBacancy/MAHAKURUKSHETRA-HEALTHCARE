import Link from "next/link";
import { OrganizerReportsPanel } from "@/components/features/organizer/organizer-reports-panel";
import { PatientReportsPanel } from "@/components/features/patient/patient-reports-panel";
import { ReportTable } from "@/components/features/reports/report-table";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { getOrganizerReportsSnapshot } from "@/services/organizer";
import { getPatientReportsSnapshot } from "@/services/patient";
import { getReportsSnapshot } from "@/services/reports";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const viewer = await requireViewerContext();

  if (viewer.role === "admin") {
    const snapshot = await getOrganizerReportsSnapshot();

    return (
      <WorkspaceShell pathname="/reports" viewer={viewer}>
        <PageIntro
          description="Generate organization-scoped exports, inspect report history, and download the current live dataset without leaving the admin workspace."
          eyebrow="Reports"
          title="Admin reports"
        />
        <OrganizerReportsPanel snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  if (viewer.role === "patient") {
    const snapshot = await getPatientReportsSnapshot();

    return (
      <WorkspaceShell pathname="/reports" viewer={viewer}>
        <PageIntro
          action={
            <Link href="/reports/export">
              <Button>Download CSV</Button>
            </Link>
          }
          description="Export your own claim history and review the medication and office assignments linked to each row."
          eyebrow="Reports"
          title="My claim reports"
        />
        <PatientReportsPanel snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  const snapshot = await getReportsSnapshot();
  const isDoctor = viewer.role === "provider";

  return (
    <WorkspaceShell pathname="/reports" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/reports/export">
            <Button>{isDoctor ? "Download assigned CSV" : "Download CSV"}</Button>
          </Link>
        }
        description={
          isDoctor
            ? "Export a doctor-scoped report of your assigned patients and review the current workload before handing anything back to the team."
            : "Reporting starts with exportability, but this MVP also highlights operating metrics so the team can react before they export."
        }
        eyebrow="Reports"
        title={isDoctor ? "Doctor reporting" : "Submission and throughput visibility"}
      />

      <section className="metric-grid">
        {snapshot.metrics.map((metric) => (
          <MetricCard
            detail={metric.note}
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </section>

      <ReportTable snapshot={snapshot} />
    </WorkspaceShell>
  );
}
