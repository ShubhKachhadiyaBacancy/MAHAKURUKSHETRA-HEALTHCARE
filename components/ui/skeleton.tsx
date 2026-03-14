import { cn } from "@/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}
