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
    // Instead, we aggregate stats client-side via parallel calls to GET /wallet/ and GET /bookings.
    // We gracefully handle partial failures if either endpoint fails.
    const fetchWallet = apiClient
      .get<any>("/wallet/")
      .then((r) => r.data)
      .catch((err) => {
        console.warn("Failed to fetch wallet for agent stats:", err);
        return { balance: 0, credit_limit: 0 };
      });

    const fetchBookings = apiClient
      .get<any>("/bookings", { params: { size: 50 } })
      .then((r) => r.data)
      .catch((err) => {
        console.warn("Failed to fetch bookings list for agent stats:", err);
        return { bookings: [], total: 0 };
      });

    return Promise.all([fetchWallet, fetchBookings]).then(([walletResponse, bookingsResponse]) => {
      // backend: WalletResponse
      // backend: BookingsResponse
      const bookings = bookingsResponse.bookings ?? [];

      const total_bookings = bookings.length;
      const confirmed_bookings = bookings.filter((b: any) => b.status === "confirmed").length;
      const pending_bookings = bookings.filter((b: any) => b.status === "pending").length;
      const cancelled_bookings = bookings.filter((b: any) => b.status === "cancelled").length;

      // revenue_mtd counts only confirmed bookings with travel_date in the current calendar month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const confirmedList = bookings.filter((b: any) => {
        if (b.status !== "confirmed" || !b.travel_date) return false;
        const travelDate = new Date(b.travel_date);
        return travelDate.getFullYear() === currentYear && travelDate.getMonth() === currentMonth;
      });
      const revenue_mtd = confirmedList.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      // commission_mtd is set to 0 per instructions
      const commission_mtd = 0;

      // balance and credit limit are kept as float rupees
      const wallet_balance = walletResponse.balance ?? 0;
      const credit_limit = walletResponse.credit_limit ?? 0;

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
      .then((r) => {
        const data = r.data;
        return {
          ...data,
          results: (data.results || []).map((f: any) => ({
            ...f,
            duration: `${Math.floor(f.duration_minutes / 60)}h ${f.duration_minutes % 60}m`,
            refundable: f.is_refundable,
          })),
        };
      });
  },

  /* --- Bookings --- */
  getBookings: (params?: { page?: number; size?: number; status?: string; search?: string }): Promise<AgentBookingsResponse> => {
    const queryParams: any = {};
    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.size) queryParams.size = params.size;
      if (params.status) queryParams.status = params.status;
      if (params.search) queryParams.search = params.search;
    }
    return apiClient
      .get<any>("/bookings", { params: queryParams })
      .then((r) => {
        // backend: BookingsResponse
        const raw = r.data;
        const bookings = raw.bookings ?? [];
        const results = bookings.map((b: any) => ({
          ...b,
          id: `${b.type}:${b.booking_id}`,
          booking_ref: b.booking_reference,
        }));
        return { results, total: raw.total ?? results.length };
      });
  },

  getBookingById: (id: string): Promise<AgentBooking> => {
    let booking_id = id;
    if (id.includes(":")) {
      booking_id = id.split(":")[1];
    }
    return apiClient.get<AgentBooking>(`/bookings/${booking_id}`).then((r) => r.data);
  },

  createBooking: (data: CreateBookingRequest): Promise<AgentBooking> =>
    apiClient.post<AgentBooking>("/bookings/flights", data).then((r) => r.data),

  cancelBooking: (id: string, reason?: string): Promise<any> => {
    let booking_id = id;
    if (id.includes(":")) {
      booking_id = id.split(":")[1];
    }
    return apiClient.put(`/bookings/${booking_id}/cancel`, { reason }).then((r) => r.data);
  },

  downloadTicket: (id: string): Promise<Blob> => {
    let booking_type = "flight";
    let booking_id = id;
    if (id.includes(":")) {
      const parts = id.split(":");
      booking_type = parts[0];
      booking_id = parts[1];
    }
    if (booking_type !== "flight") {
      throw new Error("NOT_FLIGHT");
    }
    return apiClient
      .get<Blob>(`/dashboard/bookings/flight/${booking_id}/ticket`, { responseType: "blob" })
      .then((r) => r.data);
  },

  /* --- Wallet --- */
  getWallet: (): Promise<WalletSummary> =>
    apiClient.get<WalletSummary>("/wallet/").then((r) => r.data),

  getTransactions: (params?: { page?: number; size?: number }): Promise<{ results: WalletTransaction[]; total: number }> => {
    const queryParams: any = {};
    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.size) queryParams.size = params.size;
    }
    return apiClient
      .get<any>("/wallet/transactions", { params: queryParams })
      .then((r) => {
        const raw = r.data;
        const transactions = raw.transactions ?? [];
        return { results: transactions, total: raw.total ?? transactions.length };
      });
  },

  requestTopup: (data: TopupRequestPayload): Promise<any> =>
    apiClient.post("/wallet/topup/request", data).then((r) => r.data),

  getBookingStatus: (bookingId: string | number): Promise<any> =>
    apiClient.get(`/bookings/flights/${bookingId}/status`).then((r) => r.data),
};
