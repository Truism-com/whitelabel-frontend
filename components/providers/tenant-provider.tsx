"use client";

import { useEffect } from "react";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { tenantApi } from "@/lib/api/tenant";
import { DEFAULT_TENANT_CONFIG, type TenantConfig } from "@/lib/types/tenant.types";

interface TenantProviderProps {
  children: React.ReactNode;
  /** Server-fetched config injected at layout level (avoids client waterfall). */
  initialConfig?: TenantConfig | null;
}

/** Applies tenant brand CSS variables to <html> and seeds the store. */
export function TenantProvider({ children, initialConfig }: TenantProviderProps) {
  const { setConfig, setLoading, setError } = useTenantStore();

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      applyBrandVariables(initialConfig);
      return;
    }

    /* Fallback: fetch from client if no server config was injected */
    const slug =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("x-tenant-slug="))
            ?.split("=")[1]
        : undefined;

    if (!slug) {
      /* Platform root — apply defaults */
      applyBrandVariables(DEFAULT_TENANT_CONFIG);
      return;
    }

    setLoading(true);
    tenantApi
      .getPublicConfig(slug)
      .then((config) => {
        setConfig(config);
        applyBrandVariables(config);
      })
      .catch(() => {
        setError("Failed to load site configuration");
        applyBrandVariables(DEFAULT_TENANT_CONFIG);
      });
  }, [initialConfig, setConfig, setLoading, setError]);

  return <>{children}</>;
}

function applyBrandVariables(config: TenantConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--tenant-primary",   config.branding.primaryColor);
  root.style.setProperty("--tenant-secondary", config.branding.secondaryColor);
  root.style.setProperty("--tenant-accent",    config.branding.accentColor);
  if (config.branding.borderRadius) {
    root.style.setProperty("--tenant-radius", config.branding.borderRadius);
  }
}
