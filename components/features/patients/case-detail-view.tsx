import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/shared/status-pill";
import type { CaseDetail } from "@/types/workspace";

type CaseDetailViewProps = {
  detail: CaseDetail;
};

export function CaseDetailView({ detail }: CaseDetailViewProps) {
  return (
    <div className="section-stack">
      <section className="workspace-grid">
        <Card className="p-6">
          <span className="eyebrow">Patient snapshot</span>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-slate-950">
            {detail.patient.fullName}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoBlock label="Date of birth" value={detail.patient.dob} />
            <InfoBlock label="Preferred channel" value={detail.patient.preferredChannel} />
            <InfoBlock label="Contact" value={detail.patient.contact} />
            <InfoBlock label="Location" value={detail.patient.location} />
          </div>
        </Card>

        <Card className="p-6">
          <span className="eyebrow">Case state</span>
          <div className="mt-3 flex items-center gap-3">
            <StatusPill tone={detail.caseState.priority.toLowerCase() === "critical" ? "critical" : "warning"}>
              {detail.caseState.status}
            </StatusPill>
            <span className="text-sm text-slate-600">
              Owner: {detail.caseState.owner}
            </span>
          </div>
          <div className="mt-5 space-y-4">
            <InfoBlock label="Next action" value={detail.caseState.nextAction} />
            <InfoBlock label="Due" value={detail.caseState.dueAt} />
            <InfoBlock label="Barrier summary" value={detail.caseState.barrierSummary} />
          </div>
        </Card>
      </section>

      <section className="detail-grid">
        <Card className="p-6">
          <span className="eyebrow">Therapy</span>
          <h3 className="mt-3 font-display text-2xl tracking-tight text-slate-950">
            {detail.therapy.medication}
          </h3>
          <div className="mt-5 space-y-4">
            <InfoBlock label="Therapy area" value={detail.therapy.therapyArea} />
            <InfoBlock label="Dosage" value={detail.therapy.dosage} />
            <InfoBlock label="Diagnosis" value={detail.therapy.diagnosis} />
          </div>
        </Card>

        <Card className="p-6">
          <span className="eyebrow">Coverage</span>
          <h3 className="mt-3 font-display text-2xl tracking-tight text-slate-950">
            {detail.coverage.payer}
          </h3>
          <div className="mt-5 space-y-4">
            <InfoBlock label="Plan" value={detail.coverage.plan} />
            <InfoBlock label="Member ID" value={detail.coverage.memberId} />
            <InfoBlock label="Status" value={detail.coverage.status} />
            <InfoBlock label="Notes" value={detail.coverage.notes} />
          </div>
        </Card>
      </section>

      <section className="detail-grid">
        <Card className="p-6">
          <span className="eyebrow">Prior authorization</span>
          <div className="mt-5 space-y-4">
            {detail.priorAuthorization.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4" key={item.id}>
                <div className="font-medium text-slate-900">{item.status}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Submitted {item.submittedAt} • Due {item.dueAt}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <span className="eyebrow">Financial assistance</span>
          <div className="mt-5 space-y-4">
            {detail.financialAssistance.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4" key={item.id}>
                <div className="font-medium text-slate-900">{item.program}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {item.status} • {item.savings}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="detail-grid">
        <Card className="p-6">
          <span className="eyebrow">Communications</span>
          <div className="mt-5 space-y-4">
            {detail.communications.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4" key={item.id}>
                <div className="font-medium text-slate-900">
                  {item.direction} • {item.channel}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                  {item.timestamp}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <span className="eyebrow">Documents</span>
          <div className="mt-5 space-y-4">
            {detail.documents.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4" key={item.id}>
                <div className="font-medium text-slate-900">{item.title}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">{item.category}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Added {item.addedAt}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-7 text-slate-700">{value}</div>
    </div>
  );
}
