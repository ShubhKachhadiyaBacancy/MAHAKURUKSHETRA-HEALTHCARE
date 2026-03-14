import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <span className="eyebrow">Empty state</span>
      <div>
        <h3 className="font-display text-2xl tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>
      {action}
    </Card>
  );
}
