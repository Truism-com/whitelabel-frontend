"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Fire a GET request to /health using the raw fetch API to warm up the backend
    fetch("/health").catch(() => {});
  }, []);

  useEffect(() => {
    let pendingCount = 0;
    let timer: NodeJS.Timeout | null = null;

    const unsubscribe = clientEvents.subscribe((event) => {
      if (event === "request-start") {
        pendingCount++;
        if (pendingCount === 1) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            setShowOverlay(true);
          }, 3000);
        }
      } else if (event === "response-received") {
        pendingCount = Math.max(0, pendingCount - 1);
        if (pendingCount === 0) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          setShowOverlay(false);
        }
      }
    });

    return () => {
      unsubscribe();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <QueryProvider>
      <TenantProvider initialConfig={tenantConfig}>
        {children}
        {showOverlay && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="max-w-md p-6 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 mx-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                Waking up the demo server, this takes about 30 seconds on first load.
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The backend is hosted on a free dyno which goes to sleep after inactivity. Thank you for your patience!
              </p>
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
