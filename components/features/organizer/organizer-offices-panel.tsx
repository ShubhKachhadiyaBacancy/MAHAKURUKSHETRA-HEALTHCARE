import { Card } from "@/components/ui/card";
import type { OrganizerOfficesSnapshot } from "@/types/organizer";

type OrganizerOfficesPanelProps = {
  snapshot: OrganizerOfficesSnapshot;
};

export function OrganizerOfficesPanel({ snapshot }: OrganizerOfficesPanelProps) {
  return (
    <div className="section-stack">
      <Card className="rounded-[32px] border border-dashed border-slate-200 bg-white/80 p-5 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        {snapshot.note}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.rows.length > 0 ? (
          snapshot.rows.map((row) => (
            <Card className="space-y-4 p-6" key={row.id}>
              <div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">
                  {row.name}
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {row.providerCount} linked provider{row.providerCount === 1 ? "" : "s"}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Specialties
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {row.specialties.length > 0 ? (
                    row.specialties.map((specialty) => (
                      <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                        key={specialty}
                      >
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Specialty data pending
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Contacts
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {row.contacts.length > 0 ? (
                    row.contacts.slice(0, 3).map((contact) => (
                      <div key={contact}>{contact}</div>
                    ))
                  ) : (
                    <div>Contact data pending</div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-sm text-slate-600 dark:text-slate-300">
            No office-like provider groups are available yet.
          </Card>
        )}
      </div>
    </div>
  );
}
