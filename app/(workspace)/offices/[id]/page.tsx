import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { OrganizerOfficeForm } from "@/components/features/organizer/organizer-office-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getOrganizerOfficeDetail } from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type OfficeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OfficeDetailPage({ params }: OfficeDetailPageProps) {
  const viewer = await requireViewerContext();
  const { id } = await params;

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

  const office = await getOrganizerOfficeDetail(id);

  return (
    <WorkspaceShell pathname="/offices" viewer={viewer}>
      <PageIntro
        action={
          <AdminDeleteButton
            apiPath={`/api/organizer/offices/${office.id}`}
            confirmationMessage="Delete this office?"
            redirectTo="/offices"
          />
        }
        description="Update the office location, contact details, and metadata."
        eyebrow="Offices"
        title={office.name}
      />
      <OrganizerOfficeForm mode="edit" office={office} />
    </WorkspaceShell>
  );
}
