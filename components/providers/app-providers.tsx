"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { TenantProvider } from "./tenant-provider";
import type { TenantConfig } from "@/lib/types/tenant.types";
import { clientEvents } from "@/lib/api/client";

interface AppProvidersProps {
  children: React.ReactNode;
  tenantConfig?: TenantConfig | null;
}

export function AppProviders({ children, tenantConfig }: AppProvidersProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Fire a GET request to /health using the raw fetch API to warm up the backend
    fetch("/health").catch(() => {});
  }, []);

  useEffect(() => {
    let pendingCount = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = clientEvents.subscribe((event) => {
      if (event === "request-start") {
        pendingCount++;
        if (pendingCount === 1) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            setShowOverlay(true);
            setElapsed(0);
            elapsedRef.current = setInterval(() => {
              setElapsed((s) => s + 1);
            }, 1000);
          }, 3000);
        }
      } else if (event === "response-received") {
        pendingCount = Math.max(0, pendingCount - 1);
        if (pendingCount === 0) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          if (elapsedRef.current) {
            clearInterval(elapsedRef.current);
            elapsedRef.current = null;
          }
          setShowOverlay(false);
          setElapsed(0);
        }
      }
    });

    return () => {
      unsubscribe();
      if (timer) {
        clearTimeout(timer);
      }
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
      }
    };
  }, []);

  return (
    <QueryProvider>
      <TenantProvider initialConfig={tenantConfig}>
        {children}
        {showOverlay && (
          <div className="fixed bottom-4 right-4 z-[9999] max-w-xs w-full">
            <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Connecting to server{elapsed > 0 ? ` (${elapsed}s)` : "..."}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Server wakes from sleep on first use. Usually under 45s.
                </p>
              </div>
            </div>
          </div>
        )}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: "var(--font-sans)" },
            classNames: {
              toast: "rounded-lg border shadow-md",
              title: "font-semibold text-sm",
              description: "text-xs text-slate-500",
            },
          }}
        />
      </TenantProvider>
    </QueryProvider>
  );
}
