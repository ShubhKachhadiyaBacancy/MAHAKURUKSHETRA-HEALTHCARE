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
        "inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em]",
        tone === "default" && "bg-slate-100 text-slate-700",
        tone === "accent" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-amber-100 text-amber-800",
        tone === "critical" && "bg-rose-100 text-rose-800"
      )}
    >
      {children}
    </span>
  );
}
