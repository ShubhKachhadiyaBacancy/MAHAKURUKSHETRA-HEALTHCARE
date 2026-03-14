import { AdminUserForm } from "@/components/features/admin/admin-user-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const viewer = await requireViewerContext();

  if (viewer.role !== "admin") {
    return (
      <WorkspaceShell pathname="/users" viewer={viewer}>
        <PageIntro
          description="User provisioning is reserved for admins."
          eyebrow="Users"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell pathname="/users" viewer={viewer}>
      <PageIntro
        description="Create a new workspace user."
        eyebrow="Users"
        title="Create user"
      />
      <AdminUserForm mode="create" />
    </WorkspaceShell>
  );
}
