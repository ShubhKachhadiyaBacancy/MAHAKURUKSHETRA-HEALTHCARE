import { OrganizerOfficeForm } from "@/components/features/organizer/organizer-office-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function NewOfficePage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "organizer") {
    return (
      <WorkspaceShell pathname="/offices" viewer={viewer}>
        <PageIntro
          description="Office management is reserved for organizers."
          eyebrow="Offices"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell pathname="/offices" viewer={viewer}>
      <PageIntro
        description="Add a new office location and contact details."
        eyebrow="Offices"
        title="Create office"
      />
      <OrganizerOfficeForm mode="create" />
    </WorkspaceShell>
  );
}
