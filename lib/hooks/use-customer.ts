"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerApi } from "@/lib/api/customer";
import { parseApiError } from "@/lib/api/client";
import type { CreateBookingRequest, FlightSearchParams } from "@/lib/types/agent.types";

/* --- Dashboard --- */
const fetchDashboardSummary = async () => {
  const [stats, upcoming] = await Promise.all([
    customerApi.getStats(),
    customerApi.getUpcomingTrips(),
  ]);
  return { stats, upcoming };
};

export function useCustomerStats() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn:  fetchDashboardSummary,
    select:   (data) => data.stats,
    refetchInterval: 60_000,
  });
}

export function useUpcomingTrips() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn:  fetchDashboardSummary,
    select:   (data) => data.upcoming,
  });
}

/* ── Flights ── */
export function useSearchFlights() {
  return useMutation({
    mutationFn: (params: FlightSearchParams) => customerApi.searchFlights(params),
    onError: (e) => toast.error(parseApiError(e)),
  });
}

/* ── Bookings ── */
export function useCustomerBookings(params?: { page?: number; size?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["customer", "bookings", params],
    queryFn:  () => customerApi.getBookings(params),
  });
}

export function useCustomerBooking(id: string) {
  return useQuery({
    queryKey: ["customer", "bookings", id],
    queryFn:  () => customerApi.getBookingById(id),
    enabled:  !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => customerApi.createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Booking confirmed! Check your email for the e-ticket.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      customerApi.cancelBooking(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Booking cancelled.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

/* ── Wallet ── */
export function useCustomerWallet() {
  return useQuery({
    queryKey: ["customer", "wallet"],
    queryFn:  customerApi.getWallet,
    refetchInterval: 30_000,
  });
}

export function useCustomerTransactions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["customer", "transactions", params],
    queryFn:  () => customerApi.getTransactions(params),
  });
}

export function useRequestTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; payment_method: string; reference?: string; notes?: string }) =>
      customerApi.requestTopup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "wallet"] });
      toast.success("Top-up request submitted! It will be processed within 24 hours.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}
