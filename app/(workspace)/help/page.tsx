import { HelpTopics } from "@/components/features/help/help-topics";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Card } from "@/components/ui/card";
import { helpTopics } from "@/services/demo-data";
import { requireViewerContext } from "@/services/viewer";

export default async function HelpPage() {
  const viewer = await requireViewerContext();

  return (
    <WorkspaceShell pathname="/help" viewer={viewer}>
      <PageIntro
        description="Support stays inside the product. The help center mirrors the workflow areas so users can resolve access, coverage, and affordability questions without leaving context."
        eyebrow="Help"
        title="Embedded support"
      />

      <HelpTopics topics={helpTopics} />

      <Card className="p-6">
        <span className="eyebrow">Customer support</span>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-slate-950">
          Need direct help?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Route support through your internal customer support queue or connect
          the contact form flow to a Supabase Edge Function. The schema already
          supports notifications, communications, and audit logging for support
          events.
        </p>
      </Card>
    </WorkspaceShell>
  );
}
