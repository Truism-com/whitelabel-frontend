import { apiClient } from "./client";
import type {
  AgentStats,
  AgentBooking,
  AgentBookingsResponse,
  CreateBookingRequest,
  FlightSearchParams,
  FlightSearchResponse,
  TopupRequestPayload,
} from "@/lib/types/agent.types";
import type { WalletSummary, WalletTransaction } from "@/lib/types/wallet.types";

export const agentApi = {
  /* ── Dashboard ── */
  getStats: () =>
    apiClient.get<AgentStats>("/agent/stats").then((r) => r.data),

  /* ── Flight search ── */
  searchFlights: (params: FlightSearchParams) =>
    apiClient.post<FlightSearchResponse>("/flights/search", params).then((r) => r.data),

  /* ── Bookings ── */
  getBookings: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
    apiClient
      .get<AgentBookingsResponse>("/agent/bookings", { params })
      .then((r) => {
        const raw = r.data;
        return { results: raw.results ?? raw.items ?? [], total: raw.total };
      }),

  getBookingById: (id: string) =>
    apiClient.get<AgentBooking>(`/agent/bookings/${id}`).then((r) => r.data),

  createBooking: (data: CreateBookingRequest) =>
    apiClient.post<AgentBooking>("/bookings", data).then((r) => r.data),

  cancelBooking: (id: string, reason?: string) =>
    apiClient.post(`/agent/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  downloadTicket: (id: string) =>
    apiClient
      .get<Blob>(`/agent/bookings/${id}/ticket`, { responseType: "blob" })
      .then((r) => r.data),

  /* ── Wallet ── */
  getWallet: () =>
    apiClient.get<WalletSummary>("/wallet/").then((r) => r.data),

  getTransactions: (params?: { page?: number; size?: number }) =>
    apiClient
      .get<{ results?: WalletTransaction[]; items?: WalletTransaction[]; total?: number } | WalletTransaction[]>(
        "/wallet/transactions",
        { params }
      )
      .then((r) => {
        const raw = r.data;
        if (Array.isArray(raw)) return { results: raw, total: raw.length };
        return { results: raw.results ?? raw.items ?? [], total: raw.total ?? 0 };
      }),

  requestTopup: (data: TopupRequestPayload) =>
    apiClient.post("/wallet/topup/request", data).then((r) => r.data),
};
