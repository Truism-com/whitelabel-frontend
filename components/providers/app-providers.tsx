"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { TenantProvider } from "./tenant-provider";
import type { TenantConfig } from "@/lib/types/tenant.types";

interface AppProvidersProps {
  children: React.ReactNode;
  tenantConfig?: TenantConfig | null;
}

export function AppProviders({ children, tenantConfig }: AppProvidersProps) {
  return (
    <QueryProvider>
      <TenantProvider initialConfig={tenantConfig}>
        {children}
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
