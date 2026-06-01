"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SIZE_MAP = {
  xs:  "max-w-sm",
  sm:  "max-w-md",
  md:  "max-w-lg",
  lg:  "max-w-2xl",
  xl:  "max-w-4xl",
  full:"max-w-full",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function Dialog({ open, onClose, children, size = "md", className }: DialogProps) {
  /* Close on Escape */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Scroll-lock */
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 w-full animate-slide-up",
          SIZE_MAP[size],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/** DialogHeader — accepts either a `title` prop (with optional onClose button) or free children */
export function DialogHeader({
  title,
  description,
  onClose,
  children,
}: {
  title?: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
      {children ?? (
        <div>
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-0.5 shrink-0"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl", className)}>
      {children}
    </div>
  );
}
