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
                  {row.city || row.state || row.zipCode
                    ? [row.city, row.state, row.zipCode].filter(Boolean).join(", ")
                    : "Location pending"}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Address
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {[row.addressLine1, row.addressLine2].filter(Boolean).join(", ") ||
                    "Address pending"}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Contacts
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {[row.phone, row.email].filter(Boolean).length > 0 ? (
                    [row.phone, row.email]
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((contact) => <div key={contact}>{contact}</div>)
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
