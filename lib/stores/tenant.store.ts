"use client";

import { create } from "zustand";
import { DEFAULT_TENANT_CONFIG, type TenantConfig } from "@/lib/types/tenant.types";

interface TenantStore {
  config: TenantConfig;
  isLoading: boolean;
  error: string | null;

  setConfig: (config: TenantConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTenantStore = create<TenantStore>()((set) => ({
  config: DEFAULT_TENANT_CONFIG,
  isLoading: false,
  error: null,

  setConfig: (config) => set({ config, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
