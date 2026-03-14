import { OrganizerOfficesPanel } from "@/components/features/organizer/organizer-offices-panel";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { getOrganizerOfficesSnapshot } from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function OfficesPage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "admin") {
    return (
      <WorkspaceShell pathname="/offices" viewer={viewer}>
        <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Office management is only available to organizers.
        </Card>
      </WorkspaceShell>
    );
  }

  const snapshot = await getOrganizerOfficesSnapshot();

  return (
    <WorkspaceShell pathname="/offices" viewer={viewer}>
      <PageIntro
        description="The current schema does not include a dedicated offices table, so this page derives organization footprint from provider practices while keeping strict organization scoping."
        eyebrow="Offices"
        title="Office footprint"
      />
      <OrganizerOfficesPanel snapshot={snapshot} />
    </WorkspaceShell>
  );
}
