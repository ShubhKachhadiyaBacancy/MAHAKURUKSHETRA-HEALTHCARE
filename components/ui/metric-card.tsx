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
  const toneLabel =
    tone === "critical"
      ? "Critical"
      : tone === "warning"
        ? "Attention"
        : tone === "accent"
          ? "Opportunity"
          : "Stable";

  return (
    <Card className="metric-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          {label}
        </span>
        <Badge tone={tone}>{toneLabel}</Badge>
      </div>
      <div className={cn("metric-card__value")}>{value}</div>
      <p className="metric-card__detail">{detail}</p>
    </Card>
  );
}
