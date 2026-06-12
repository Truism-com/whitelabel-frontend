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

function parseSummaryOrigin(s: string): string {
  try {
    if (!s) return "";
    const part1 = s.split(",")[0] || "";
    const part2 = part1.split("→")[0] || "";
    return part2.trim().substring(0, 3).toUpperCase();
  } catch {
    return "";
  }
}

function parseSummaryDestination(s: string): string {
  try {
    if (!s) return "";
    const parts = s.split("→");
    if (parts.length < 2) return "";
    const part1 = parts[1] || "";
    const part2 = part1.split(",")[0] || "";
    return part2.trim().substring(0, 3).toUpperCase();
  } catch {
    return "";
  }
}

export const customerApi = {
  /* --- Dashboard --- */
  getStats: (): Promise<CustomerStats> =>
    apiClient.get<any>("/dashboard/summary").then((r) => {
      // backend: DashboardSummary
      // backend: DashboardStats
      const stats = r.data.stats;
      return {
        total_bookings: stats.total_bookings,
        upcoming_trips: stats.upcoming_trips,
        wallet_balance: stats.wallet_balance ?? 0, // balance in float rupees
        total_spent: 0, // backend: DashboardStats field does not exist, set to 0
        completed_trips: 0, // backend: DashboardStats field does not exist, set to 0
        cancelled_bookings: 0, // backend: DashboardStats field does not exist, set to 0
      };
    }),

  getUpcomingTrips: (): Promise<CustomerBooking[]> =>
    apiClient.get<any>("/dashboard/summary").then((r) => {
      // backend: DashboardSummary
      // backend: BookingSummary
      const bookings = r.data.upcoming_bookings || [];
      return bookings.map((b: any) => ({
        id: `${b.booking_type}:${b.id}`,
        booking_ref: b.booking_reference,
        status: b.status,
        travel_date: b.travel_date ? String(b.travel_date) : "",
        // origin/destination are parsed heuristically from the summary string because the /dashboard/summary endpoint does not return structured IATA codes. If the parse fails the card still renders with empty origin/destination rather than crashing.
        origin: parseSummaryOrigin(b.summary),
        destination: parseSummaryDestination(b.summary),
        total_amount: b.total_amount ?? 0, // rupees float
        passenger_count: 1, // backend: BookingSummary passenger_count does not exist, default to 1
        created_at: String(b.created_at),
      }));
    }),

  /* --- Flight search (shared endpoint) --- */
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
  getBookings: (params?: { page?: number; size?: number; status?: string; booking_type?: string }): Promise<CustomerBookingsResponse> => {
    const queryParams: any = {};
    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.size) queryParams.page_size = params.size;
      if (params.status) queryParams.status = params.status;
      if (params.booking_type) queryParams.booking_type = params.booking_type;
    }
    return apiClient
      .get<any>("/dashboard/bookings", { params: queryParams })
      .then((r) => {
        // backend: BookingListResponse
        // backend: BookingSummary
        const raw = r.data;
        const mapped = (raw.items || []).map((b: any) => ({
          id: `${b.booking_type}:${b.id}`,
          booking_ref: b.booking_reference,
          status: b.status,
          travel_date: b.travel_date ? String(b.travel_date) : "",
          // origin/destination are parsed heuristically from the summary string because the /dashboard/summary endpoint does not return structured IATA codes. If the parse fails the card still renders with empty origin/destination rather than crashing.
          origin: parseSummaryOrigin(b.summary),
          destination: parseSummaryDestination(b.summary),
          total_amount: b.total_amount ?? 0, // rupees float
          passenger_count: 1, // backend: BookingSummary passenger_count does not exist, default to 1
          created_at: String(b.created_at),
        }));
        return { results: mapped, total: raw.total ?? 0 };
      });
  },

  getBookingById: (compositeId: string): Promise<CustomerBooking> => {
    let booking_type = "flight";
    let booking_id = compositeId;
    if (compositeId.includes(":")) {
      const parts = compositeId.split(":");
      booking_type = parts[0];
      booking_id = parts[1];
    }
    return apiClient
      .get<any>(`/dashboard/bookings/${booking_type}/${booking_id}`)
      .then((r) => {
        // backend: BookingDetailResponse
        const b = r.data;
        const details = b.details || {};
        return {
          id: String(b.id),
          booking_ref: b.booking_reference,
          status: b.status,
          travel_date: b.travel_date ? String(b.travel_date) : "",
          origin: details.origin || b.origin || parseSummaryOrigin(b.summary || ""),
          destination: details.destination || b.destination || parseSummaryDestination(b.summary || ""),
          airline: details.airline || b.airline || "",
          flight_number: details.flight_number || b.flight_number || "",
          total_amount: b.total_amount ?? 0, // rupees float
          passenger_count: b.passenger_count || 1,
          created_at: String(b.created_at),
          passengers: b.passengers || [],
          fare_breakdown: b.fare_breakdown || null,
          is_refundable: b.is_refundable,
          ticket_url: b.ticket_url,
          segments: b.segments || [],
        };
      });
  },

  createBooking: (data: CreateBookingRequest): Promise<CustomerBooking> =>
    apiClient.post<CustomerBooking>("/bookings/flights", data).then((r) => r.data),

  cancelBooking: (id: string, reason?: string): Promise<any> => {
    let booking_id = id;
    if (id.includes(":")) {
      booking_id = id.split(":")[1];
    }
    return apiClient.put(`/bookings/${booking_id}/cancel`, { reason }).then((r) => r.data);
  },

  downloadTicket: (compositeId: string): Promise<Blob> => {
    let booking_type = "flight";
    let booking_id = compositeId;
    if (compositeId.includes(":")) {
      const parts = compositeId.split(":");
      booking_type = parts[0];
      booking_id = parts[1];
    }
    return apiClient
      .get<Blob>(`/dashboard/bookings/${booking_type}/${booking_id}/ticket`, {
        responseType: "blob",
      })
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

  requestTopup: (data: { amount: number; payment_method: string; reference?: string; notes?: string }): Promise<any> =>
    apiClient.post("/wallet/topup/request", data).then((r) => r.data),

  getTopupHistory: (): Promise<TopupRequest[]> =>
    apiClient.get<any>("/wallet/topup/history").then((r) => r.data.requests || []),
};
