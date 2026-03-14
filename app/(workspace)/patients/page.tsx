import { redirect } from "next/navigation";
import Link from "next/link";
import { CasesTable } from "@/components/features/patients/cases-table";
import { OrganizerPatientsTable } from "@/components/features/organizer/organizer-patients-table";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCaseList } from "@/services/patients";
import { getOrganizerPatientsPage } from "@/services/organizer";
import { requireViewerContext } from "@/services/viewer";

export const dynamic = "force-dynamic";

type PatientsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    direction?: string;
  }>;
};

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q ?? "";
  const viewer = await requireViewerContext();

  if (viewer.role === "patient") {
    redirect("/claims");
  }

  if (viewer.role === "admin") {
    const snapshot = await getOrganizerPatientsPage({
      query,
      page: resolvedSearchParams.page ?? "1",
      sort: resolvedSearchParams.sort ?? "created_at",
      direction: resolvedSearchParams.direction ?? "desc"
    });
    const buildPatientsUrl = (page: number) => {
      const next = new URLSearchParams();

      if (query) {
        next.set("q", query);
      }

      next.set("sort", snapshot.sort);
      next.set("direction", snapshot.direction);
      next.set("page", String(page));

      return `/patients?${next.toString()}`;
    };

    return (
      <WorkspaceShell pathname="/patients" viewer={viewer}>
        <PageIntro
          action={
            <Link href="/patients/manage/new">
              <Button>Create patient</Button>
            </Link>
          }
          description="Manage organization patient records with direct create, update, and delete actions. Search, sorting, and pagination keep the dataset navigable without leaving the workspace."
          eyebrow="Patients"
          title="Patient registry"
        />

        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get">
          <Input defaultValue={query} name="q" placeholder="Search by patient, email, or phone" />
          <select
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-brand/10"
            defaultValue={snapshot.sort}
            name="sort"
          >
            <option value="created_at">Newest</option>
            <option value="last_name">Last name</option>
            <option value="first_name">First name</option>
          </select>
          <select
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-brand/10"
            defaultValue={snapshot.direction}
            name="direction"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>

        <OrganizerPatientsTable snapshot={snapshot} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Showing page {snapshot.page} of {snapshot.totalPages} ({snapshot.total} patient
            {snapshot.total === 1 ? "" : "s"})
          </div>
          <div className="flex gap-3">
            {snapshot.page <= 1 ? (
              <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-400">
                Previous
              </span>
            ) : (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                href={buildPatientsUrl(snapshot.page - 1)}
              >
                Previous
              </a>
            )}
            {snapshot.page >= snapshot.totalPages ? (
              <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-400">
                Next
              </span>
            ) : (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                href={buildPatientsUrl(snapshot.page + 1)}
              >
                Next
              </a>
            )}
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const cases = await getCaseList(query);
  const isDoctor = viewer.role === "provider";
  const canCreateCase = ["admin", "case_manager"].includes(viewer.role);

  return (
    <WorkspaceShell pathname="/patients" viewer={viewer}>
      <PageIntro
        action={
          canCreateCase ? (
            <Link href="/intake">
              <Button>Add patient case</Button>
            </Link>
          ) : (
            <div className="rounded-2xl border border-slate-200 px-4 py-3 text-xs text-slate-600">
              {isDoctor
                ? "Open an assigned patient to review details and send feedback."
                : "Ask your administrator to create cases or grant broader permissions."}
            </div>
          )
        }
        description={
          isDoctor
            ? "This doctor queue is limited to patients assigned to you. Open any case to review the timeline and send feedback to the access team."
            : "Track the cases that matter now. This queue emphasizes next action, affordability state, payer progress, and ownership instead of only listing names."
        }
        eyebrow={isDoctor ? "Assigned patients" : "Case queue"}
        title={isDoctor ? "Doctor patient queue" : "Patient access cases"}
      />

      <form className="max-w-md" method="get">
        <Input
          defaultValue={query}
          name="q"
          placeholder={isDoctor ? "Search assigned patient, therapy, or payer" : "Search patient, therapy, or payer"}
        />
      </form>

      <CasesTable cases={cases} />
    </WorkspaceShell>
  );
}
