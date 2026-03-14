import { cn } from "@/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "warning" | "critical" | "accent";
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em]",
        tone === "default" && "bg-slate-100 text-slate-700",
        tone === "warning" && "bg-amber-100 text-amber-800",
        tone === "critical" && "bg-rose-100 text-rose-800",
        tone === "accent" && "bg-blue-100 text-blue-800"
      )}
    >
      {children}
    </span>
  );
}
