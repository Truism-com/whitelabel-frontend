"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cmsApi } from "@/lib/api/cms";
import { parseApiError } from "@/lib/api/client";
import type { Slider, Offer } from "@/lib/types/cms.types";

const KEYS = {
  sliders: ["cms", "sliders"] as const,
  offers:  ["cms", "offers"]  as const,
  blog:    ["cms", "blog"]    as const,
};

/* ── Sliders ── */
export function useSliders() {
  return useQuery({ queryKey: KEYS.sliders, queryFn: cmsApi.listSliders });
}
export function useCreateSlider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cmsApi.createSlider,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.sliders }); toast.success("Slider created."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
export function useUpdateSlider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Slider> & { id: string }) => cmsApi.updateSlider(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.sliders }); toast.success("Slider updated."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
export function useDeleteSlider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cmsApi.deleteSlider,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.sliders }); toast.success("Slider deleted."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}

/* ── Offers ── */
export function useOffers() {
  return useQuery({ queryKey: KEYS.offers, queryFn: cmsApi.listOffers });
}
export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cmsApi.createOffer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.offers }); toast.success("Offer created."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Offer> & { id: string }) => cmsApi.updateOffer(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.offers }); toast.success("Offer updated."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cmsApi.deleteOffer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.offers }); toast.success("Offer deleted."); },
    onError:   (e) => toast.error(parseApiError(e)),
  });
}
