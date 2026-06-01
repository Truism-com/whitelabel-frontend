export type RuleValueType = "flat" | "percentage" | "fixed";

export interface MarkupRule {
  id: string;
  name: string;
  markup_type: RuleValueType;
  value: number;           // normalised alias (was markup_value)
  markup_value?: number;   // backend compat
  applies_to: string;      // normalised alias (was airline/route/travel_class)
  airline?: string;
  route?: string;
  travel_class?: string;
  is_active: boolean;
  created_at: string;
}

export interface DiscountRule {
  id: string;
  code: string;
  discount_type: RuleValueType;
  value: number;              // normalised alias (was discount_value)
  discount_value?: number;    // backend compat
  max_uses?: number;
  uses_count?: number;
  min_amount?: number;        // normalised alias (was min_booking_amount)
  min_booking_amount?: number;// backend compat
  expires_at?: string;        // normalised alias (was valid_to)
  valid_from?: string;
  valid_to?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeeSlab {
  id: string;
  name: string;
  fee_type: RuleValueType;
  value: number;           // normalised alias (was fee_value)
  fee_value?: number;      // backend compat
  applies_to: string;      // normalised alias (was payment_method/booking_type)
  payment_method?: string;
  booking_type?: string;
  is_active: boolean;
  created_at: string;
}
