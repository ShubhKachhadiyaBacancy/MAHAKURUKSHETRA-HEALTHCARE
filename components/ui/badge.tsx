import { cn } from "@/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "warning" | "critical" | "accent";
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        tone === "default" && "badge--default",
        tone === "warning" && "badge--warning",
        tone === "critical" && "badge--critical",
        tone === "accent" && "badge--accent"
      )}
    >
      {children}
    </span>
  );
}
