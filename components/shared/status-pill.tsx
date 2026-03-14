import { cn } from "@/utils/cn";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: "default" | "accent" | "warning" | "critical";
};

export function StatusPill({
  children,
  tone = "default"
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "status-pill",
        tone === "default" && "status-pill--default",
        tone === "accent" && "status-pill--accent",
        tone === "warning" && "status-pill--warning",
        tone === "critical" && "status-pill--critical"
      )}
    >
      {children}
    </span>
  );
}
