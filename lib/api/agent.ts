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
  /* --- Dashboard --- */
  getStats: (): Promise<AgentStats> => {
    // The backend agent stats endpoint does not exist.
    // Instead, we aggregate stats client-side via parallel calls to GET /wallet/summary and GET /bookings.
    // We gracefully handle partial failures if either endpoint fails.
    const fetchWallet = apiClient
      .get<any>("/wallet/summary")
      .then((r) => r.data)
      .catch((err) => {
        console.warn("Failed to fetch wallet summary for agent stats:", err);
        return { balance: 0, credit_limit: 0 };
      });

    const fetchBookings = apiClient
      .get<any>("/bookings", { params: { page: 1, page_size: 100 } })
      .then((r) => r.data)
      .catch((err) => {
        console.warn("Failed to fetch bookings list for agent stats:", err);
        return { items: [], total: 0 };
      });

    return Promise.all([fetchWallet, fetchBookings]).then(([walletSummary, bookingsResponse]) => {
      // backend: WalletSummary
      // backend: BookingsResponse
      const bookings = bookingsResponse.items ?? bookingsResponse.results ?? [];

      const total_bookings = bookings.length;
      const confirmed_bookings = bookings.filter((b: any) => b.status === "confirmed").length;
      const pending_bookings = bookings.filter((b: any) => b.status === "pending").length;
      const cancelled_bookings = bookings.filter((b: any) => b.status === "cancelled").length;

      const confirmedList = bookings.filter((b: any) => b.status === "confirmed");
      const revenue_mtd = confirmedList.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const commission_mtd = confirmedList.reduce((sum: number, b: any) => sum + (b.commission || 0), 0);

      const wallet_balance = (walletSummary.balance || 0) * 100; // rupees to paise
      const credit_limit = (walletSummary.credit_limit || 0) * 100; // rupees to paise

      return {
        total_bookings,
        confirmed_bookings,
        pending_bookings,
        cancelled_bookings,
        revenue_mtd,
        commission_mtd,
        wallet_balance,
        credit_limit,
      };
    });
  },

  /* --- Flight search --- */
  searchFlights: (params: FlightSearchParams): Promise<FlightSearchResponse> => {
    const payload: any = {
      origin: params.origin,
      destination: params.destination,
      depart_date: params.travel_date,
      adults: params.adults,
    };
    if (params.return_date) payload.return_date = params.return_date;
    if (params.children !== undefined) payload.children = params.children;
    if (params.infants !== undefined) payload.infants = params.infants;
    if (params.cabin_class) payload.travel_class = params.cabin_class;

    return apiClient
      .post<FlightSearchResponse>("/search/flights", payload)
      .then((r) => r.data);
  },

  /* --- Bookings --- */
  getBookings: (params?: { page?: number; size?: number; status?: string; search?: string }): Promise<AgentBookingsResponse> => {
    const queryParams: any = {};
    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.size) queryParams.page_size = params.size;
      if (params.status) queryParams.status = params.status;
      if (params.search) queryParams.search = params.search;
    }
    return apiClient
      .get<any>("/bookings", { params: queryParams })
      .then((r) => {
        // backend: BookingsResponse
        const raw = r.data;
        const results = raw.items ?? raw.results ?? [];
        return { results, total: raw.total ?? results.length };
      });
  },

  getBookingById: (id: string): Promise<AgentBooking> =>
    apiClient.get<AgentBooking>(`/bookings/${id}`).then((r) => r.data),

  createBooking: (data: CreateBookingRequest): Promise<AgentBooking> =>
    apiClient.post<AgentBooking>("/bookings", data).then((r) => r.data),

  cancelBooking: (id: string, reason?: string): Promise<any> =>
    apiClient.put(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  downloadTicket: (id: string): Promise<Blob> =>
    apiClient
      .get<Blob>(`/bookings/${id}/ticket`, { responseType: "blob" })
      .then((r) => r.data),

  /* --- Wallet --- */
  getWallet: (): Promise<WalletSummary> =>
    apiClient.get<WalletSummary>("/wallet/").then((r) => r.data),

  getTransactions: (params?: { page?: number; size?: number }): Promise<{ results: WalletTransaction[]; total: number }> =>
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

  requestTopup: (data: TopupRequestPayload): Promise<any> =>
    apiClient.post("/wallet/topup/request", data).then((r) => r.data),
};
