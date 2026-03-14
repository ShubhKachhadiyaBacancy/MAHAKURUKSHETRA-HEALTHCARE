import {
  ClipboardPulseIcon,
  QueueIcon,
  ShieldCheckIcon,
  TimerIcon,
  TrendUpIcon
} from "@/components/ui/icons";

const caseSummary = [
  {
    label: "Patient",
    value: "Maya Chen",
    icon: ShieldCheckIcon
  },
  {
    label: "Therapy",
    value: "Stelara onboarding",
    icon: ClipboardPulseIcon
  },
  {
    label: "Next move",
    value: "Submit PA packet",
    icon: TimerIcon
  }
];

const readinessChecklist = [
  {
    label: "Benefits verified",
    description: "Plan, channel, and case ownership confirmed.",
    progress: "92%"
  },
  {
    label: "Authorization packet",
    description: "Clinical notes and labs assembled for submission.",
    progress: "84%"
  },
  {
    label: "Affordability options",
    description: "Copay support attached before first fill outreach.",
    progress: "76%"
  }
];

const quickStats = [
  {
    value: "14",
    label: "Cases due today",
    detail: "Response windows prioritized by urgency.",
    icon: TimerIcon
  },
  {
    value: "4",
    label: "Payer escalations",
    detail: "Active blockers routed for follow-up.",
    icon: QueueIcon
  },
  {
    value: "9",
    label: "First fills cleared",
    detail: "Starts progressed without queue drift.",
    icon: TrendUpIcon
  }
];

const focusQueue = [
  "Appeal signature pending from provider",
  "Bridge support available for two starts",
  "Patient callback window closes at 11:40 AM"
];

export function TherapyCommandCenter() {
  return (
    <section className="panel command-stage overflow-hidden p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <span className="eyebrow">Main workspace preview</span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
            Structured for fast clinical operations.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            The active case, queue health, and the next deadline stay visible in
            one frame so teams can act quickly without scanning decorative noise.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]"
          style={{ borderColor: "var(--line)" }}
        >
          <ShieldCheckIcon className="h-4 w-4" />
          Queue healthy
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_18.5rem]">
        <div className="rounded-[28px] border border-slate-200 bg-white/75 p-5 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--accent-strong)]">
                  Active therapy start
                </div>
                <h3 className="mt-2 font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">
                  New start orchestration
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  The workspace opens on the blocker that matters now, then keeps
                  the patient summary and readiness stack close enough to act on
                  without context switching.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-[12rem]">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  <TrendUpIcon className="h-4 w-4 text-[var(--accent-strong)]" />
                  Therapy readiness
                </div>
                <div className="mt-3 font-display text-5xl leading-none tracking-tight text-slate-950">
                  86%
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Submission packet nearly complete.
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {caseSummary.map(({ label, value, icon: Icon }) => (
                <div className="panel-muted p-4" key={label}>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                  <ClipboardPulseIcon className="h-4 w-4" />
                  Progress stack
                </div>
                <div className="text-xs text-slate-500">
                  Three steps visible on arrival
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {readinessChecklist.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-md">
                        <div className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {item.description}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {item.progress}
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[var(--accent)]"
                        style={{ width: item.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {quickStats.map(({ value, label, detail, icon: Icon }) => (
            <div className="panel-muted p-5" key={label}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-4xl tracking-tight text-slate-950">
                  {value}
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {label}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{detail}</div>
            </div>
          ))}

          <div className="rounded-[24px] border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              <QueueIcon className="h-4 w-4" />
              Focus now
            </div>
            <div className="mt-4 space-y-3">
              {focusQueue.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                  key={item}
                >
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <TimerIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
