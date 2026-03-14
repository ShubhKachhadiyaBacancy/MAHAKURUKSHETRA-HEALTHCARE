import { SettingsPanels } from "@/components/features/settings/settings-panels";
import { RolePrivileges } from "@/components/features/permissions/role-privileges";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getSettingsSnapshot } from "@/services/settings";
import { requireViewerContext } from "@/services/viewer";

export default async function SettingsPage() {
  const viewer = await requireViewerContext();
  const snapshot = await getSettingsSnapshot();

  return (
    <WorkspaceShell pathname="/settings" viewer={viewer}>
      <PageIntro
        description="Keep preferences lightweight and operational. The settings surface defines default pharmacies, programs, alerts, and escalation behavior without forcing a sprawling admin module."
        eyebrow="Settings"
        title="Workflow preferences"
      />
      <SettingsPanels snapshot={snapshot} />
      <RolePrivileges role={viewer.role} />
    </WorkspaceShell>
  );
}
