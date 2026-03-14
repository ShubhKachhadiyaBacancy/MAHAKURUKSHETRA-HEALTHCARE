import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { OrganizerMedicationsSnapshot } from "@/types/organizer";

type OrganizerMedicationGridProps = {
  snapshot: OrganizerMedicationsSnapshot;
};

export function OrganizerMedicationGrid({
  snapshot
}: OrganizerMedicationGridProps) {
  return (
    <div className="section-stack">
      <Card className="rounded-[32px] border border-dashed border-slate-200 bg-white/80 p-5 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        {snapshot.note}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.rows.map((row) => (
          <Card className="space-y-4 p-6" key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">
                  {row.name}
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {row.therapyArea}
                </div>
              </div>
              <Badge tone={row.selectedForOrganization ? "accent" : "default"}>
                {row.selectedForOrganization ? "In use" : "Catalog only"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div>Manufacturer: {row.manufacturer}</div>
              <div>Support program: {row.supportProgram}</div>
              <div>Usage in organization: {row.organizationUsageCount}</div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900/70">
                {row.requiresPriorAuth ? "Prior auth" : "No prior auth"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900/70">
                {row.requiresColdChain ? "Cold chain" : "Standard handling"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900/70">
                {row.active ? "Active" : "Inactive"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
