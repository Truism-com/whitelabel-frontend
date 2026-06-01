import { apiClient } from "./client";
import type {
  CustomerStats,
  CustomerBooking,
  CustomerBookingsResponse,
} from "@/lib/types/customer.types";
import type {
  FlightSearchParams,
  FlightSearchResponse,
  CreateBookingRequest,
} from "@/lib/types/agent.types";
import type { WalletSummary, WalletTransaction, TopupRequest } from "@/lib/types/wallet.types";

export const customerApi = {
  /* ── Dashboard ── */
  getStats: () =>
    apiClient.get<CustomerStats>("/customer/stats").then((r) => r.data),

  getUpcomingTrips: () =>
    apiClient.get<CustomerBooking[]>("/customer/bookings/upcoming").then((r) => r.data),

  /* ── Flight search (shared endpoint) ── */
  searchFlights: (params: FlightSearchParams) =>
    apiClient.post<FlightSearchResponse>("/flights/search", params).then((r) => r.data),

  /* ── Bookings ── */
  getBookings: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
    apiClient
      .get<CustomerBookingsResponse>("/customer/bookings", { params })
      .then((r) => {
        const raw = r.data;
        return { results: raw.results ?? raw.items ?? [], total: raw.total };
      }),

  getBookingById: (id: string) =>
    apiClient.get<CustomerBooking>(`/customer/bookings/${id}`).then((r) => r.data),

  createBooking: (data: CreateBookingRequest) =>
    apiClient.post<CustomerBooking>("/bookings", data).then((r) => r.data),

  cancelBooking: (id: string, reason?: string) =>
    apiClient.post(`/customer/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  downloadTicket: (id: string) =>
    apiClient
      .get<Blob>(`/customer/bookings/${id}/ticket`, { responseType: "blob" })
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

  requestTopup: (data: { amount: number; payment_method: string; reference?: string; notes?: string }) =>
    apiClient.post("/wallet/topup/request", data).then((r) => r.data),

  getTopupHistory: () =>
    apiClient.get<TopupRequest[]>("/customer/wallet/topups").then((r) => r.data),
};
