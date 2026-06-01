import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Separator({
  orientation = "horizontal",
  label,
  className,
  ...props
}: SeparatorProps) {
  if (label) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        role="separator"
        {...props}
      >
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium shrink-0">
          {label}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-slate-200"
          : "h-full w-px bg-slate-200",
        className
      )}
      {...props}
    />
  );
}
