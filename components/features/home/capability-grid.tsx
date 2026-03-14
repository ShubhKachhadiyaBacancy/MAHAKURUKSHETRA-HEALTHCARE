import { SectionHeading } from "@/components/ui/section-heading";

const capabilities = [
  {
    label: "Enrollment",
    stat: "41 fields mapped",
    title: "Enrollment that captures the full case upfront",
    description:
      "Collect demographics, therapy context, payer details, and patient support needs in one structured intake path."
  },
  {
    label: "Operations",
    stat: "Live triage",
    title: "A real operational dashboard",
    description:
      "Move beyond welcome cards. Highlight urgent cases, auth blockers, affordability gaps, and outreach due today."
  },
  {
    label: "Coverage",
    stat: "Status tracked",
    title: "Prior authorization visibility",
    description:
      "Track pending documentation, payer review, approvals, denials, and appeal readiness from the same case record."
  },
  {
    label: "Affordability",
    stat: "Savings attached",
    title: "Affordability coordination",
    description:
      "Tie copay programs, patient assistance, and savings estimates directly to the treatment journey."
  },
  {
    label: "Comms",
    stat: "Shared timeline",
    title: "Embedded communication history",
    description:
      "Keep patient, provider, payer, and pharmacy touchpoints in one timeline instead of scattered inboxes."
  },
  {
    label: "Platform",
    stat: "RLS prepared",
    title: "RLS-ready Supabase data model",
    description:
      "The backend is organized for organization-scoped security, server-side data access, and future storage workflows."
  }
];

export function CapabilityGrid() {
  return (
    <section className="section-stack">
      <SectionHeading
        eyebrow="Core modules"
        title="The first release is built around the moments that actually delay therapy."
        description="Every module is aimed at the front-line specialty workflow: intake completeness, payer progress, affordability coordination, and the daily decision surface for the team moving cases forward."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((item, index) => (
          <article className="home-feature-card p-6" key={item.title}>
            <div className="flex items-start justify-between gap-4">
              <div className="home-feature-icon">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
                {item.stat}
              </span>
            </div>

            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-strong)]">
                {item.label}
              </div>
              <h3 className="mt-3 font-display text-2xl tracking-tight text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
