import { apiClient } from "./client";
import type { MarkupRule, DiscountRule, FeeSlab } from "@/lib/types/pricing.types";

export const pricingApi = {
  /* ── Markup rules ── */
  listMarkupRules: () =>
    apiClient.get<MarkupRule[]>("/admin/pricing/markup-rules").then((r) => r.data),

  createMarkupRule: (data: Omit<MarkupRule, "id" | "created_at">) =>
    apiClient.post<MarkupRule>("/admin/pricing/markup-rules", data).then((r) => r.data),

  updateMarkupRule: (ruleId: string, data: Partial<MarkupRule>) =>
    apiClient.put<MarkupRule>(`/admin/pricing/markup-rules/${ruleId}`, data).then((r) => r.data),

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
