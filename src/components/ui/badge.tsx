import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "purple" | "green" | "amber" | "slate" | "red";

const tones: Record<BadgeTone, string> = {
  purple: "bg-primary-soft text-primary-dark dark:text-purple-100",
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "purple", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
