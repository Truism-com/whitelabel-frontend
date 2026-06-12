import { apiClient } from "./client";

// backend: SuperadminStats response schema
export interface SuperadminStats {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_bookings: number;
  total_revenue: number;
}

// backend: SuperadminTenantResponse schema
export interface SuperadminTenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

// backend: TenantStatsResponse schema
export interface TenantStats {
  tenant_id: string;
  name: string;
  total_users: number;
  total_bookings: number;
  total_revenue: number;
}

// backend: SuperadminUserSearchResponse schema
export interface SuperadminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  tenant_id: string;
  tenant_name?: string;
  created_at: string;
}

export const superadminApi = {
  getStats: async (): Promise<SuperadminStats> => {
    const res = await apiClient.get<SuperadminStats>("/superadmin/stats");
    return res.data;
  },

  getTenants: async (): Promise<SuperadminTenant[]> => {
    const res = await apiClient.get<SuperadminTenant[]>("/superadmin/tenants");
    return res.data;
  },

  getTenantStats: async (id: string): Promise<TenantStats> => {
    const res = await apiClient.get<TenantStats>(`/superadmin/tenants/${id}/stats`);
    return res.data;
  },

  searchUsers: async (q: string): Promise<SuperadminUser[]> => {
    const res = await apiClient.get<SuperadminUser[]>("/superadmin/users/search", {
      params: { q },
    });
    return res.data;
  },
};
