"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { parseApiError } from "@/lib/api/client";
import type { PaginatedResponse, AdminUser, AdminBooking } from "@/lib/types/admin.types";

const KEYS = {
  stats:    ["admin", "stats"]    as const,
  users:    (role?: string) => ["admin", "users", role] as const,
  bookings: (params?: object) => ["admin", "bookings", params] as const,
  analytics:["admin", "analytics"] as const,
  company:  ["admin", "company"]  as const,
};

/* Normalise {items, total} or {results, total} → PaginatedResponse */
function normalise<T>(raw: { items?: T[]; results?: T[]; total: number }): PaginatedResponse<T> {
  return { results: raw.results ?? raw.items ?? [], total: raw.total };
}

export function useAdminStats() {
  return useQuery({ queryKey: KEYS.stats, queryFn: adminApi.getDashboardStats, staleTime: 60_000 });
}

export function useAdminAnalytics(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: [...KEYS.analytics, params] as const,
    queryFn: () => adminApi.getBookingAnalytics(params),
    staleTime: 60_000,
  });
}

export function useAdminUsers(params?: Parameters<typeof adminApi.getUsers>[0]) {
  return useQuery({
    queryKey: KEYS.users(params?.role),
    queryFn: () => adminApi.getUsers(params).then((raw) => normalise<AdminUser>(raw)),
    staleTime: 30_000,
  });
}

export function useAdminBookings(params?: Parameters<typeof adminApi.getBookings>[0]) {
  return useQuery({
    queryKey: KEYS.bookings(params),
    queryFn: () => adminApi.getBookings(params).then((raw) => normalise<AdminBooking>(raw)),
    staleTime: 30_000,
  });
}

export function useApproveAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.approveAgent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Agent approved successfully.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: string; is_active: boolean }) =>
      adminApi.updateUserStatus(userId, is_active),
    onSuccess: (_, { is_active }) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(is_active ? "User activated." : "User deactivated.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

export function useCompanyProfile() {
  return useQuery({ queryKey: KEYS.company, queryFn: adminApi.getCompanyProfile });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateBranding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.company });
      toast.success("Branding updated successfully.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

export function useUpdateCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateCompanyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.company });
      toast.success("Company profile saved.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}
