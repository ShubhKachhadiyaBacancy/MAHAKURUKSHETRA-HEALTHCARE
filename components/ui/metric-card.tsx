import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "warning" | "critical" | "accent";
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "default"
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
          {label}
        </span>
        <Badge tone={tone}>{tone}</Badge>
      </div>
      <div className={cn("mt-5 font-display text-4xl tracking-tight text-slate-950")}>
        {value}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p>
    </Card>
  );
}
