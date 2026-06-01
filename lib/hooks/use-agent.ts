"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentApi } from "@/lib/api/agent";
import { parseApiError } from "@/lib/api/client";
import type { CreateBookingRequest, FlightSearchParams, TopupRequestPayload } from "@/lib/types/agent.types";

/* ── Dashboard stats ── */
export function useAgentStats() {
  return useQuery({
    queryKey: ["agent", "stats"],
    queryFn:  agentApi.getStats,
    refetchInterval: 60_000,
  });
}

/* ── Flight search ── */
export function useSearchFlights() {
  return useMutation({
    mutationFn: (params: FlightSearchParams) => agentApi.searchFlights(params),
    onError: (e) => toast.error(parseApiError(e)),
  });
}

/* ── Bookings ── */
export function useAgentBookings(params?: { page?: number; size?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["agent", "bookings", params],
    queryFn:  () => agentApi.getBookings(params),
  });
}

export function useAgentBooking(id: string) {
  return useQuery({
    queryKey: ["agent", "bookings", id],
    queryFn:  () => agentApi.getBookingById(id),
    enabled:  !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => agentApi.createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent", "bookings"] });
      qc.invalidateQueries({ queryKey: ["agent", "stats"] });
      toast.success("Booking confirmed!");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      agentApi.cancelBooking(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent", "bookings"] });
      qc.invalidateQueries({ queryKey: ["agent", "stats"] });
      toast.success("Booking cancelled.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}

/* ── Wallet ── */
export function useAgentWallet() {
  return useQuery({
    queryKey: ["agent", "wallet"],
    queryFn:  agentApi.getWallet,
    refetchInterval: 30_000,
  });
}

export function useAgentTransactions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["agent", "transactions", params],
    queryFn:  () => agentApi.getTransactions(params),
  });
}

export function useRequestTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TopupRequestPayload) => agentApi.requestTopup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent", "wallet"] });
      toast.success("Topup request submitted! It will be reviewed by admin.");
    },
    onError: (e) => toast.error(parseApiError(e)),
  });
}
