import { apiClient } from "./client";
import type { CompanyProfile, DashboardStats, AdminUser, AdminBooking, AnalyticsResponse } from "@/lib/types/admin.types";

export const adminApi = {
  /* ── Dashboard ── */
  getDashboardStats: () =>
    apiClient.get<DashboardStats>("/admin/dashboard/stats").then((r) => r.data),

  getBookingAnalytics: (params?: { start_date?: string; end_date?: string }) =>
    apiClient
      .get<AnalyticsResponse>("/admin/analytics/bookings", { params })
      .then((r) => r.data),

  /* ── Users / Agents ── */
  getUsers: (params?: { role?: string; page?: number; size?: number; is_approved?: boolean }) =>
    apiClient.get<{ items: AdminUser[]; total: number }>("/admin/users", { params }).then((r) => r.data),

  getUserById: (userId: string) =>
    apiClient.get<AdminUser>(`/admin/users/${userId}`).then((r) => r.data),

  approveAgent: (agentId: string) =>
    apiClient.put(`/admin/agents/${agentId}/approve`).then((r) => r.data),

  updateUserStatus: (userId: string, is_active: boolean) =>
    apiClient.put(`/admin/users/${userId}/status`, { is_active }).then((r) => r.data),

  /* ── Bookings ── */
  getBookings: (params?: { page?: number; size?: number; status?: string; booking_type?: string }) =>
    apiClient
      .get<{ items: AdminBooking[]; total: number }>("/admin/bookings", { params })
      .then((r) => r.data),

  updateBookingStatus: (bookingId: string, status: string) =>
    apiClient.put(`/admin/bookings/${bookingId}/status`, { status }).then((r) => r.data),

  /* ── Company ── */
  getCompanyProfile: () =>
    apiClient.get<CompanyProfile>("/admin/company/profile").then((r) => r.data),

  updateCompanyProfile: (data: Partial<CompanyProfile>) =>
    apiClient.put<CompanyProfile>("/admin/company/profile", data).then((r) => r.data),

  updateBranding: (data: CompanyProfile["branding"]) =>
    apiClient.put("/admin/company/profile/branding", data).then((r) => r.data),

  updateSEO: (data: CompanyProfile["seo"]) =>
    apiClient.put("/admin/company/profile/seo", data).then((r) => r.data),
};
