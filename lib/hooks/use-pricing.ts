"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pricingApi } from "@/lib/api/pricing";
import { parseApiError } from "@/lib/api/client";
import type { MarkupRule, DiscountRule, FeeSlab } from "@/lib/types/pricing.types";

const KEYS = {
  markup:   ["pricing", "markup"]   as const,
  discount: ["pricing", "discount"] as const,
  fees:     ["pricing", "fees"]     as const,
};

/* ── Markup Rules ── */
export function useMarkupRules() {
  return useQuery({ queryKey: KEYS.markup, queryFn: pricingApi.listMarkupRules });
}

export function useCreateMarkupRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.createMarkupRule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.markup }); toast.success("Markup rule created."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useUpdateMarkupRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<MarkupRule> & { id: string }) =>
      pricingApi.updateMarkupRule(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.markup }); toast.success("Markup rule updated."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useDeleteMarkupRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.deleteMarkupRule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.markup }); toast.success("Markup rule deleted."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

/* ── Discount Rules ── */
export function useDiscountRules() {
  return useQuery({ queryKey: KEYS.discount, queryFn: pricingApi.listDiscountRules });
}

export function useCreateDiscountRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.createDiscountRule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.discount }); toast.success("Discount code created."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useUpdateDiscountRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<DiscountRule> & { id: string }) =>
      pricingApi.updateDiscountRule(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.discount }); toast.success("Discount rule updated."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useDeleteDiscountRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.deleteDiscountRule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.discount }); toast.success("Discount code deleted."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

/* ── Fee Slabs ── */
export function useFeeSlabs() {
  return useQuery({ queryKey: KEYS.fees, queryFn: pricingApi.listFeeSlabs });
}

export function useCreateFeeSlab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.createFeeSlab,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.fees }); toast.success("Fee slab created."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useUpdateFeeSlab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FeeSlab> & { id: string }) =>
      pricingApi.updateFeeSlab(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.fees }); toast.success("Fee slab updated."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

export function useDeleteFeeSlab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pricingApi.deleteFeeSlab,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.fees }); toast.success("Fee slab deleted."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
