import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { AdminUserForm } from "@/components/features/admin/admin-user-form";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { getAdminUserDetail } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type UserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const viewer = await requireViewerContext();
  const { id } = await params;

  if (viewer.role !== "admin") {
    return (
      <WorkspaceShell pathname="/users" viewer={viewer}>
        <PageIntro
          description="User administration is reserved for admins."
          eyebrow="Users"
          title="Access restricted"
        />
      </WorkspaceShell>
    );
  }

  const user = await getAdminUserDetail(id);

  return (
    <WorkspaceShell pathname="/users" viewer={viewer}>
      <PageIntro
        action={
          <AdminDeleteButton
            apiPath={`/api/admin/users/${user.id}`}
            confirmationMessage="Delete this user account?"
            redirectTo="/users"
          />
        }
        description="Update profile details, role assignment, and any linked doctor metadata."
        eyebrow="Users"
        title={user.fullName}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_minmax(0,0.9fr)]">
        <AdminUserForm mode="edit" user={user} />

        <Card className="space-y-4 p-6">
          <span className="eyebrow">Linked records</span>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <div>Created: {user.createdAt}</div>
            <div className="mt-2">
              Doctor record: {user.linkedProvider ? "Available" : "Not linked"}
            </div>
            <div className="mt-2">
              Organizer record: {user.linkedCaseManager ? "Available" : "Not linked"}
            </div>
            <div className="mt-2">
              Patient record: {user.linkedPatient ? "Available" : "Not linked"}
            </div>
          </div>
        </Card>
      </section>
    </WorkspaceShell>
  );
}
