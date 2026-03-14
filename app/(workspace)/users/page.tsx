import Link from "next/link";
import { AdminDeleteButton } from "@/components/features/admin/admin-delete-button";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminUsersPage } from "@/services/admin-workspace";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    role?: string;
  }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const viewer = await requireViewerContext();
  const resolvedSearchParams = await searchParams;
  const snapshot = await getAdminUsersPage({
    query: resolvedSearchParams.q ?? "",
    page: resolvedSearchParams.page ?? "1",
    role: resolvedSearchParams.role ?? "all"
  });

  const buildPageUrl = (page: number) => {
    const next = new URLSearchParams();
    if (snapshot.query) {
      next.set("q", snapshot.query);
    }
    next.set("role", snapshot.role);
    next.set("page", String(page));
    return `/users?${next.toString()}`;
  };

  return (
    <WorkspaceShell pathname="/users" viewer={viewer}>
      <PageIntro
        action={
          <Link href="/users/new">
            <Button>Create user</Button>
          </Link>
        }
        description="Admins can create, update, and delete any workspace user, including other admins, while keeping every profile inside the current organization."
        eyebrow="Users"
        title="User management"
      />

      <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
        <Input defaultValue={snapshot.query} name="q" placeholder="Search by name, email, or title" />
        <select
          className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-brand/10"
          defaultValue={snapshot.role}
          name="role"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="patient">Patient</option>
          <option value="provider">Provider</option>
          <option value="case_manager">Case manager</option>
          <option value="staff">Staff</option>
        </select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
              {snapshot.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-950 dark:text-white">
                      {row.fullName}
                    </div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {row.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.role.replaceAll("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {row.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900/70"
                        href={`/users/${row.id}`}
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton
                        apiPath={`/api/admin/users/${row.id}`}
                        confirmationMessage="Delete this user account?"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Showing page {snapshot.page} of {snapshot.totalPages}
        </div>
        <div className="flex gap-3">
          {snapshot.page > 1 ? (
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              href={buildPageUrl(snapshot.page - 1)}
            >
              Previous
            </a>
          ) : null}
          {snapshot.page < snapshot.totalPages ? (
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              href={buildPageUrl(snapshot.page + 1)}
            >
              Next
            </a>
          ) : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}
