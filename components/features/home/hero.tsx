import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TherapyCommandCenter } from "@/components/features/home/therapy-command-center";

const heroMetrics = [
  { value: "36 hrs", label: "from intake to payer-ready packet" },
  { value: "1 queue", label: "for benefits, PA, affordability, and outreach" },
  { value: "100%", label: "of critical next actions visible on arrival" }
];

const heroPillars = [
  "Structured enrollment with therapy context from the first touch",
  "Operational visibility that shows blockers before the start date slips",
  "A calmer experience for providers, patients, and the access team"
];

export function Hero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center">
      <div className="space-y-8">
        <div className="space-y-5">
          <span className="eyebrow">Modern specialty access orchestration</span>
          <h1 className="max-w-5xl font-display text-5xl tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            A clinical-grade command system for therapy starts, not another
            generic admin panel.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            SpecialtyRx Connect gives access teams one operating surface for
            enrollment, coverage, prior authorization, affordability, and
            treatment readiness so cases move forward with less reconstruction
            and fewer blind spots.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>Create live account</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {heroMetrics.map((item) => (
            <div className="panel-muted rounded-[28px] p-4" key={item.label}>
              <div className="font-display text-3xl tracking-tight text-slate-950">
                {item.value}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="panel-muted rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="eyebrow">Designed for the access layer</span>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                The experience is tuned for the part of the therapy journey
                where momentum is lost most often: documentation, payer work,
                affordability decisions, and the handoff into first fill.
              </p>
            </div>

            <div className="space-y-3 sm:max-w-sm">
              {heroPillars.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-[22px] border border-slate-200/80 bg-white/60 px-4 py-3 text-sm leading-6 text-slate-700"
                  key={item}
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TherapyCommandCenter />
    </section>
  );
}
