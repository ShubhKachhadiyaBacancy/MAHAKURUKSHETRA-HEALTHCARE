import { SectionHeading } from "@/components/ui/section-heading";
import {
  ClipboardPulseIcon,
  PathwayIcon,
  ShieldCheckIcon
} from "@/components/ui/icons";

const capabilities = [
  {
    label: "Coverage",
    title: "Benefits and prior auth stay traceable",
    description:
      "Status, missing documents, and submission readiness are readable without switching between disconnected notes.",
    icon: ShieldCheckIcon
  },
  {
    label: "Workflow",
    title: "Every handoff follows the same path",
    description:
      "Organizers, doctors, and support teams work from aligned case structure instead of custom page-by-page layouts.",
    icon: PathwayIcon
  },
  {
    label: "Readability",
    title: "Important text lands with less effort",
    description:
      "Professional typography, quieter color contrast, and stronger spacing make each screen easier to scan under pressure.",
    icon: ClipboardPulseIcon
  }
];

export function CapabilityGrid() {
  return (
    <section className="section-stack">
      <SectionHeading
        eyebrow="Why it reads better"
        title="Professional UI choices applied consistently."
        description="The public pages and the internal workspace now share a calmer palette, disciplined alignment, and icon language that supports the product instead of distracting from it."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {capabilities.map((item) => (
          <article className="home-feature-card p-6" key={item.title}>
            <div className="flex items-start justify-between gap-4">
              <div className="home-feature-icon">
                <item.icon />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {item.label}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="font-display text-3xl tracking-tight text-slate-950">
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
