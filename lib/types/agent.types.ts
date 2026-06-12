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
  result_id:        string;
  segments:         FlightSegment[];
  cabin_class:      CabinClass;
  fare:             FareBreakdown;
  seats_available:  number;
  is_refundable:    boolean;
  baggage_info?:    string;
  meal_included?:   boolean;
}

export interface FlightSearchResponse {
  search_id:   string;
  results:     FlightResult[];
  total:       number;
}

/* ─── Passengers ─────────────────────────────────────────────────── */
export type PassengerType = "ADT" | "CHD" | "INF";

export interface Passenger {
  type:         PassengerType;
  title:        "Mr" | "Mrs" | "Ms" | "Master" | "Miss";
  first_name:   string;
  last_name:    string;
  dob?:         string;           // YYYY-MM-DD
  passport_no?: string;
  nationality?: string;
}

/* ─── Booking ─────────────────────────────────────────────────────── */
export type BookingStatus =
  | "pending" | "confirmed" | "processing"
  | "cancelled" | "refunded" | "failed";

export interface CreateBookingRequest {
  search_id:    string;
  result_id:    string;
  passengers:   Passenger[];
  contact_email: string;
  contact_phone: string;
  client_name?:  string;         // name the booking is for
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
