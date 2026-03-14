import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonStyles(variant: ButtonProps["variant"] = "primary") {
  return cn(
    "btn",
    variant === "primary" && "btn--primary",
    variant === "secondary" && "btn--secondary",
    variant === "ghost" && "btn--ghost"
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={cn(buttonStyles(variant), className)} {...props} />;
}
