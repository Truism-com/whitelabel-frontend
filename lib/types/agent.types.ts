/* ─── Flight Search ──────────────────────────────────────────────── */
export type CabinClass = "economy" | "business" | "first" | "premium_economy";
export type TripType   = "one_way" | "round_trip";

export interface FlightSearchParams {
  origin:       string;
  destination:  string;
  travel_date:  string;           // YYYY-MM-DD
  return_date?: string;           // YYYY-MM-DD
  adults:       number;
  children?:    number;
  infants?:     number;
  cabin_class?: CabinClass;
  trip_type?:   TripType;
  depart_date?: string;           // alias; set by the api layer before sending
}

export interface FlightSegment {
  flight_number:    string;
  airline:          string;
  airline_code:     string;
  aircraft?:        string;
  origin:           string;
  origin_name?:     string;
  destination:      string;
  destination_name?: string;
  departure_time:   string;       // ISO datetime
  arrival_time:     string;       // ISO datetime
  duration_minutes: number;
  stops:            number;
  stop_details?:    { airport: string; duration_minutes: number }[];
}

export interface FareBreakdown {
  base_fare:    number;           // paise
  taxes:        number;
  fees:         number;
  markup?:      number;
  total:        number;
}

export interface FlightResult {
  offer_id:         string;
  airline:          string;
  flight_number:    string;
  origin:           string;
  destination:      string;
  departure_time:   string;       // ISO datetime
  arrival_time:     string;       // ISO datetime
  duration:         string;       // e.g. "3h 30m"
  stops:            number;
  aircraft?:        string;
  price:            number;       // rupees float
  currency:         string;
  travel_class:     string;       // cabin class
  baggage_allowance?: string;
  refundable:       boolean;
}

export interface FlightSearchResponse {
  search_id:     string;
  results:       FlightResult[];
  total_results: number;
}

/* --- Passengers --- */
export type PassengerType = "ADT" | "CHD" | "INF";

export interface Passenger {
  type:             PassengerType;
  title:            "Mr" | "Mrs" | "Ms" | "Miss" | "Dr" | "Mstr";
  first_name:       string;
  last_name:        string;
  dob:              string;       // YYYY-MM-DD, REQUIRED
  passport_number?: string;
  nationality?:     string;       // 2-3 letter ISO country code
}

/* --- Booking --- */
export type BookingStatus =
  | "pending" | "confirmed" | "processing"
  | "cancelled" | "refunded" | "failed";

export interface CreateBookingRequest {
  search_id:     string;
  offer_id:      string;
  passengers:    Passenger[];
  payment_details: {
    method: string;
  };
  contact_email: string;
  contact_phone: string;
  special_requests?: string;
  client_name?:  string;
}

export interface AgentBooking {
  id:               string;
  booking_ref:      string;
  pnr?:             string;
  status:           BookingStatus;
  origin:           string;
  destination:      string;
  travel_date:      string;
  return_date?:     string;
  cabin_class?:     CabinClass;
  airline?:         string;
  flight_number?:   string;
  passenger_count:  number;
  passenger_names?: string[];
  client_name?:     string;
  contact_email?:   string;
  contact_phone?:   string;
  total_amount:     number;      // paise
  commission?:      number;      // paise
  ticket_url?:      string;
  created_at:       string;
  updated_at?:      string;
}

export interface AgentBookingsResponse {
  results:  AgentBooking[];
  items?:   AgentBooking[];
  total:    number;
}

/* ─── Agent Stats ─────────────────────────────────────────────────── */
export interface AgentStats {
  total_bookings:     number;
  confirmed_bookings: number;
  pending_bookings:   number;
  cancelled_bookings: number;
  revenue_mtd:        number;    // paise
  commission_mtd:     number;    // paise
  wallet_balance:     number;    // paise
  credit_limit?:      number;    // paise
  bookings_trend?:    { date: string; bookings: number; revenue: number }[];
}

/* ─── Topup ──────────────────────────────────────────────────────── */
export interface TopupRequestPayload {
  amount:         number;        // paise
  payment_method: "upi" | "neft" | "imps" | "rtgs" | "cheque" | "cash";
  reference?:     string;
  proof_url?:     string;
  notes?:         string;
}
