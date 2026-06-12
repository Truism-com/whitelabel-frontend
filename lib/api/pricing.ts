import { apiClient } from "./client";
import type { MarkupRule, DiscountRule, FeeSlab } from "@/lib/types/pricing.types";

export const pricingApi = {
  /* ── Markup rules ── */
  listMarkupRules: () =>
    apiClient.get<{ items: any[]; total: number }>("/admin/pricing/markup-rules").then((r) =>
      (r.data.items || []).map((item) => ({
        ...item,
        id: String(item.id),
        value: Number(item.markup_value ?? 0),
        applies_to: item.airline_code || item.origin_city || "all",
      }))
    ),

  createMarkupRule: (data: Omit<MarkupRule, "id" | "created_at">) => {
    const payload = {
      name: data.name,
      markup_type: data.markup_type,
      markup_value: Number(data.value),
      is_active: data.is_active,
      min_markup: data.min_markup ? Number(data.min_markup) : undefined,
      max_markup: data.max_markup ? Number(data.max_markup) : undefined,
      min_fare: data.min_fare ? Number(data.min_fare) : undefined,
      max_fare: data.max_fare ? Number(data.max_fare) : undefined,
      user_type: data.user_type || "all",
    };
    return apiClient.post<any>("/admin/pricing/markup-rules", payload).then((r) => {
      const item = r.data;
      return {
        ...item,
        id: String(item.id),
        value: Number(item.markup_value ?? 0),
        applies_to: item.airline_code || item.origin_city || "all",
      };
    });
  },

  updateMarkupRule: (ruleId: string, data: Partial<MarkupRule>) => {
    const payload = {
      name: data.name,
      markup_type: data.markup_type,
      markup_value: data.value !== undefined ? Number(data.value) : undefined,
      is_active: data.is_active,
      min_markup: data.min_markup !== undefined ? (data.min_markup ? Number(data.min_markup) : null) : undefined,
      max_markup: data.max_markup !== undefined ? (data.max_markup ? Number(data.max_markup) : null) : undefined,
      min_fare: data.min_fare !== undefined ? (data.min_fare ? Number(data.min_fare) : null) : undefined,
      max_fare: data.max_fare !== undefined ? (data.max_fare ? Number(data.max_fare) : null) : undefined,
      user_type: data.user_type,
    };
    return apiClient.put<any>(`/admin/pricing/markup-rules/${ruleId}`, payload).then((r) => {
      const item = r.data;
      return {
        ...item,
        id: String(item.id),
        value: Number(item.markup_value ?? 0),
        applies_to: item.airline_code || item.origin_city || "all",
      };
    });
  },

  deleteMarkupRule: (ruleId: string) =>
    apiClient.delete(`/admin/pricing/markup-rules/${ruleId}`),

  /* ── Discount rules ── */
  listDiscountRules: () =>
    apiClient.get<DiscountRule[]>("/admin/pricing/discount-rules").then((r) => r.data),

  createDiscountRule: (data: Omit<DiscountRule, "id" | "created_at" | "uses_count">) =>
    apiClient.post<DiscountRule>("/admin/pricing/discount-rules", data).then((r) => r.data),

  updateDiscountRule: (ruleId: string, data: Partial<DiscountRule>) =>
    apiClient.put<DiscountRule>(`/admin/pricing/discount-rules/${ruleId}`, data).then((r) => r.data),

  deleteDiscountRule: (ruleId: string) =>
    apiClient.delete(`/admin/pricing/discount-rules/${ruleId}`),

  /* ── Fee slabs ── */
  listFeeSlabs: () =>
    apiClient.get<FeeSlab[]>("/admin/pricing/fee-slabs").then((r) => r.data),

  createFeeSlab: (data: Omit<FeeSlab, "id" | "created_at">) =>
    apiClient.post<FeeSlab>("/admin/pricing/fee-slabs", data).then((r) => r.data),

  updateFeeSlab: (slabId: string, data: Partial<FeeSlab>) =>
    apiClient.put<FeeSlab>(`/admin/pricing/fee-slabs/${slabId}`, data).then((r) => r.data),

  deleteFeeSlab: (slabId: string) =>
    apiClient.delete(`/admin/pricing/fee-slabs/${slabId}`),
};
