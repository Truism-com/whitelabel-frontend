import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, description, className, rightAction }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 transition-all motion-reduce:transition-none duration-300", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {rightAction && (
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
}
