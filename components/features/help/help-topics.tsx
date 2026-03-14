import { Card } from "@/components/ui/card";

type HelpTopicsProps = {
  topics: Array<{
    title: string;
    items: string[];
  }>;
};

export function HelpTopics({ topics }: HelpTopicsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {topics.map((topic) => (
        <Card className="p-6" key={topic.title}>
          <span className="eyebrow">FAQ cluster</span>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-slate-950">
            {topic.title}
          </h2>
          <div className="mt-5 space-y-3">
            {topic.items.map((item) => (
              <details className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" key={item}>
                <summary className="cursor-pointer text-sm font-medium text-slate-900">
                  {item}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This workspace is structured so the answer can live beside the
                  workflow, not in a separate tool. Use the relevant case,
                  document, or report surface to complete the action.
                </p>
              </details>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
