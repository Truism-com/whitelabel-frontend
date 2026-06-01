import { apiClient } from "./client";
import type { TenantConfig } from "@/lib/types/tenant.types";

export const tenantApi = {
  /** Fetches public config for the current tenant (no auth required). */
  getPublicConfig: async (slug?: string) => {
    const headers = slug ? { "X-Tenant-Slug": slug } : undefined;
    const res = await apiClient.get<TenantConfig>("/v1/config/public", {
      headers,
    });
    return res.data;
  },

  /** SuperAdmin: list all tenants */
  listTenants: async () => {
    const res = await apiClient.get<TenantConfig[]>("/v1/admin/tenants");
    return res.data;
  },

  /** SuperAdmin: create a new tenant */
  createTenant: async (data: Partial<TenantConfig>) => {
    const res = await apiClient.post<TenantConfig>("/v1/admin/tenants", data);
    return res.data;
  },

  /** SuperAdmin: get a single tenant */
  getTenant: async (tenantId: string) => {
    const res = await apiClient.get<TenantConfig>(
      `/v1/admin/tenants/${tenantId}`
    );
    return res.data;
  },

  /** SuperAdmin: delete a tenant */
  deleteTenant: async (tenantId: string) => {
    await apiClient.delete(`/v1/admin/tenants/${tenantId}`);
  },

  /** Admin: update their own tenant's branding */
  updateBranding: async (branding: Partial<TenantConfig["branding"]>) => {
    const res = await apiClient.put("/v1/admin/config/branding", branding);
    return res.data;
  },

  /** SuperAdmin: update any tenant's full config */
  updateTenantConfig: async (
    tenantId: string,
    config: Partial<TenantConfig>
  ) => {
    const res = await apiClient.put(
      `/v1/admin/tenants/${tenantId}/config`,
      config
    );
    return res.data;
  },
};
