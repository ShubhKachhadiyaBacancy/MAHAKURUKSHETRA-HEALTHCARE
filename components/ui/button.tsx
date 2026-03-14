import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonStyles(variant: ButtonProps["variant"] = "primary") {
  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium tracking-[0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" &&
      "bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_24px_45px_rgba(15,23,42,0.2)]",
    variant === "secondary" &&
      "border border-slate-200/90 bg-white/80 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur hover:border-slate-300 hover:bg-white",
    variant === "ghost" &&
      "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={cn(buttonStyles(variant), className)} {...props} />;
}
