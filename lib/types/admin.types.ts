export interface DashboardStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  active_agents: number;
  pending_agents: number;
  revenue_mtd: number;          // paise/cents
  total_wallet_balance: number; // paise/cents
  /* legacy compat */
  total_revenue?: number;
  bookings_this_month?: number;
  revenue_this_month?: number;
  booking_growth_pct?: number;
  revenue_growth_pct?: number;
  pending_approvals?: number;
}

export interface BookingDataPoint {
  date: string;
  bookings: number;
  revenue: number;
}

export interface AnalyticsResponse {
  booking_trend: BookingDataPoint[];
  total_revenue: number;
  total_bookings: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_approved?: boolean;
  company_name?: string;
  phone?: string;
  pan_number?: string;
  commission_rate?: number;
  credit_limit?: number;
  wallet_balance?: number;
  total_bookings?: number;
  created_at: string;
}

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "refunded" | "ticketing_failed" | "expired";
export type BookingType   = "flight" | "hotel" | "bus";

export interface AdminBooking {
  id: string;
  pnr?: string;
  booking_ref?: string;
  booking_type?: BookingType;
  passenger_name: string;
  user_name?: string;
  agent_name?: string;
  agent_id?: string;
  origin?: string;
  destination?: string;
  route?: string;
  total_amount: number;
  amount?: number;
  travel_date?: string;
  status: BookingStatus;
  created_at: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  items?: T[];
  total: number;
  page?: number;
  pages?: number;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  website?: string;
  logo_url?: string;
  gstin?: string;
  pan?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
}
