import type { BookingStatus, CabinClass, FlightSegment, FareBreakdown, Passenger } from "./agent.types";

/* ─── Re-export shared types ─────────────────────────────────────── */
export type { BookingStatus, CabinClass };

/* ─── Customer booking ───────────────────────────────────────────── */
export interface CustomerBooking {
  id:               string;
  booking_ref:      string;
  pnr?:             string;
  status:           BookingStatus;
  origin:           string;
  origin_name?:     string;
  destination:      string;
  destination_name?: string;
  travel_date:      string;
  return_date?:     string;
  cabin_class?:     CabinClass;
  airline?:         string;
  airline_code?:    string;
  flight_number?:   string;
  departure_time?:  string;
  arrival_time?:    string;
  duration_minutes?: number;
  stops?:           number;
  passenger_count:  number;
  passengers?:      Passenger[];
  contact_email?:   string;
  contact_phone?:   string;
  total_amount:     number;      // rupees float
  fare_breakdown?:  FareBreakdown;
  ticket_url?:      string;
  segments?:        FlightSegment[];
  is_refundable?:   boolean;
  cancellation_reason?: string;
  created_at:       string;
  updated_at?:      string;
}

export interface CustomerBookingsResponse {
  results: CustomerBooking[];
  items?:  CustomerBooking[];
  total:   number;
}

/* ─── Customer stats ─────────────────────────────────────────────── */
export interface CustomerStats {
  total_bookings:     number;
  upcoming_trips:     number;
  completed_trips:    number;
  cancelled_bookings: number;
  total_spent:        number;    // rupees float
  wallet_balance:     number;    // rupees float
  savings?:           number;    // rupees float (discounts applied)
}

/* ─── Upcoming trip (dashboard card) ────────────────────────────── */
export interface UpcomingTrip {
  id:            string;
  booking_ref:   string;
  pnr?:          string;
  origin:        string;
  origin_name?:  string;
  destination:   string;
  destination_name?: string;
  travel_date:   string;
  departure_time?: string;
  airline?:      string;
  flight_number?: string;
  cabin_class?:  CabinClass;
  status:        BookingStatus;
  ticket_url?:   string;
}
