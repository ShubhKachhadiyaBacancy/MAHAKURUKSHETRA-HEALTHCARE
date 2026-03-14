import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TherapyCommandCenter } from "@/components/features/home/therapy-command-center";
import {
  ClipboardPulseIcon,
  QueueIcon,
  ShieldCheckIcon
} from "@/components/ui/icons";

const heroSignals = [
  {
    label: "Benefits",
    icon: ShieldCheckIcon
  },
  {
    label: "Authorizations",
    icon: ClipboardPulseIcon
  },
  {
    label: "Queue control",
    icon: QueueIcon
  }
];

const heroMetrics = [
  {
    value: "1 workspace",
    label: "Coverage, prior auth, and affordability tracked in one place."
  },
  {
    value: "3 key signals",
    label: "Owner, blocker, and due time stay visible on arrival."
  }
];

export function Hero() {
  return (
    <section className="grid gap-8 xl:grid-cols-[0.8fr_minmax(0,1.2fr)] xl:items-start">
      <div className="space-y-7 xl:sticky xl:top-28">
        <div className="space-y-5">
          <span className="eyebrow">Specialty care coordination</span>
          <h1 className="max-w-2xl font-display text-5xl tracking-tight text-slate-950 sm:text-6xl xl:text-[4.6rem] xl:leading-[0.94]">
            A clearer operating surface for therapy access teams.
          </h1>
          <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Bring enrollment, benefits verification, prior authorization,
            affordability, and patient follow-up into one readable workspace with
            stronger hierarchy and less visual noise.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {heroSignals.map(({ label, icon: Icon }) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[color:var(--text-primary)]"
              key={label}
              style={{
                borderColor:
                  "color-mix(in oklab, var(--line-strong), transparent 16%)",
                background: "color-mix(in oklab, var(--bg-panel), white 10%)"
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>Create workspace</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {heroMetrics.map((item) => (
            <div className="panel-muted p-5" key={item.label}>
              <div className="font-display text-[2rem] tracking-tight text-slate-950">
                {item.value}
              </div>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <TherapyCommandCenter />
    </section>
  );
}
