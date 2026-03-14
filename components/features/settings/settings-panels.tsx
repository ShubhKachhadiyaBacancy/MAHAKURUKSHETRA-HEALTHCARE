import { Card } from "@/components/ui/card";
import type { SettingsSnapshot } from "@/types/workspace";

type SettingsPanelsProps = {
  snapshot: SettingsSnapshot;
};

export function SettingsPanels({ snapshot }: SettingsPanelsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-6">
        <span className="eyebrow">Operational defaults</span>
        <div className="mt-5 space-y-4">
          <SettingRow label="Preferred pharmacy" value={snapshot.preferredPharmacy} />
          <SettingRow label="Specialty program" value={snapshot.specialtyProgram} />
          <SettingRow label="Daily digest" value={snapshot.dailyDigest} />
        </div>
      </Card>

      <Card className="p-6">
        <span className="eyebrow">Alerting model</span>
        <div className="mt-5 space-y-4">
          <SettingRow
            label="Notification channels"
            value={snapshot.notificationChannels.join(", ")}
          />
          <SettingRow label="Escalation rule" value={snapshot.escalationRule} />
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-7 text-slate-700">{value}</div>
    </div>
  );
}
