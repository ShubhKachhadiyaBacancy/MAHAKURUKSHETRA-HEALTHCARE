import { Card } from "@/components/ui/card";
import { modulePermissions } from "@/lib/permissions";
import type { RegisterRole } from "@/lib/auth/register";
import { cn } from "@/utils/cn";

type RolePrivilegesProps = {
  role: RegisterRole;
};

const actionLabels = {
  add: "Add",
  edit: "Edit",
  delete: "Delete"
} as const;

type ActionKey = keyof typeof actionLabels;

export function RolePrivileges({ role }: RolePrivilegesProps) {
  const roleLabel = role.replaceAll("_", " ");

  return (
    <section className="section-stack">
      <div className="flex flex-col gap-2">
        <span className="eyebrow">Role-based controls</span>
        <h2 className="font-display text-3xl tracking-tight text-slate-950">
          {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)} permissions
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          The workspace shows the actions you can add, edit, or delete across critical modules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modulePermissions.map((entry) => {
          const privileges = entry.privileges[role];
          const actionable = (["add", "edit", "delete"] as ActionKey[]).filter(
            (action) => Boolean(privileges[action])
          );

          return (
            <Card className="p-5" key={entry.id}>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {entry.module}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{entry.description}</p>
                </div>

                {actionable.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(["add", "edit", "delete"] as ActionKey[]).map((action) => (
                      <ActionBadge
                        key={action}
                        active={Boolean(privileges[action])}
                        label={actionLabels[action]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                    Read-only
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ActionBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
        active
          ? "bg-ink text-white shadow-sm"
          : "border border-slate-200 text-slate-500 bg-white/60"
      )}
    >
      {label}
    </span>
  );
}
