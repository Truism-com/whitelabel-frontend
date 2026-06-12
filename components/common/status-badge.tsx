import { cn } from "@/lib/utils/cn";
import { Clock, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

export type BadgeStatus = "pending" | "confirmed" | "processing" | "cancelled" | "refunded" | "failed";

const STATUS_CFG: Record<BadgeStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: React.ElementType;
  pulse?: boolean;
}> = {
  confirmed:  { label: "Confirmed",  bg: "bg-emerald-50/70",   text: "text-emerald-700",   border: "border-emerald-200/60",   dot: "bg-emerald-500",  icon: CheckCircle2 },
  pending:    { label: "Pending",    bg: "bg-amber-50/70",     text: "text-amber-700",     border: "border-amber-200/60",     dot: "bg-amber-500",    icon: Clock,        pulse: true },
  processing: { label: "Processing", bg: "bg-amber-50/70",     text: "text-amber-700",     border: "border-amber-200/60",     dot: "bg-amber-500",    icon: Clock,        pulse: true },
  cancelled:  { label: "Cancelled",  bg: "bg-rose-50/70",      text: "text-rose-700",      border: "border-rose-200/60",      dot: "bg-rose-500",     icon: XCircle },
  refunded:   { label: "Refunded",   bg: "bg-slate-50/70",     text: "text-slate-700",     border: "border-slate-200/60",      dot: "bg-slate-500",    icon: ArrowUpRight },
  failed:     { label: "Failed",     bg: "bg-rose-50/70",      text: "text-rose-700",      border: "border-rose-200/60",      dot: "bg-rose-500",     icon: XCircle },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-200",
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      {cfg.pulse ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 motion-reduce:hidden", cfg.dot)} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", cfg.dot)} />
        </span>
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      )}
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{cfg.label}</span>
    </span>
  );
}
