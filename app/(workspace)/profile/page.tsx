import { OrganizerProfileForm } from "@/components/features/organizer/organizer-profile-form";
import { PatientProfileForm } from "@/components/features/patient/patient-profile-form";
import { ProviderProfileForm } from "@/components/features/provider/provider-profile-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { getAdminProfileSnapshot } from "@/services/admin-workspace";
import { getOrganizerProfileSnapshot } from "@/services/organizer";
import { getPatientProfileSnapshot } from "@/services/patient";
import { getProviderProfileSnapshot } from "@/services/provider";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await requireViewerContext();

  if (viewer.role === "patients") {
    const snapshot = await getPatientProfileSnapshot();

    return (
      <WorkspaceShell pathname="/profile" viewer={viewer}>
        <PageIntro
          description="View and update your own profile while keeping assigned medications, organization, and office details visible."
          eyebrow="Profile"
          title="My profile"
        />
        <PatientProfileForm snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  if (viewer.role === "doctor") {
    const snapshot = await getProviderProfileSnapshot();

    return (
      <WorkspaceShell pathname="/profile" viewer={viewer}>
        <PageIntro
          description="View and update the doctor identity attached to your assigned patient cases."
          eyebrow="Profile"
          title="Doctor profile"
        />
        <ProviderProfileForm snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  if (viewer.role === "organizer") {
    const snapshot = await getOrganizerProfileSnapshot();

    return (
      <WorkspaceShell pathname="/profile" viewer={viewer}>
        <PageIntro
          description="View and update the organizer identity that controls the organization workspace."
          eyebrow="Profile"
          title="Organizer profile"
        />
        <OrganizerProfileForm snapshot={snapshot} />
      </WorkspaceShell>
    );
  }

  if (viewer.role !== "admin") {
    return (
      <WorkspaceShell pathname="/profile" viewer={viewer}>
        <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Profile tools for this workspace are currently available to admins, organizers, doctors, and patients.
        </Card>
      </WorkspaceShell>
    );
  }

  const snapshot = await getAdminProfileSnapshot();

  return (
    <WorkspaceShell pathname="/profile" viewer={viewer}>
      <PageIntro
        description="View and update the admin identity that controls system-level access."
        eyebrow="Profile"
        title="Admin profile"
      />
      <OrganizerProfileForm snapshot={snapshot} />
    </WorkspaceShell>
  );
}
