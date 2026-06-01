import { apiClient } from "./client";
import type { Slider, Offer, BlogPost, StaticPage } from "@/lib/types/cms.types";

export const cmsApi = {
  /* ── Sliders ── */
  listSliders: () =>
    apiClient.get<Slider[]>("/cms/admin/sliders").then((r) => r.data),

  createSlider: (data: Omit<Slider, "id" | "created_at">) =>
    apiClient.post<Slider>("/cms/admin/sliders", data).then((r) => r.data),

  updateSlider: (sliderId: string, data: Partial<Slider>) =>
    apiClient.put<Slider>(`/cms/admin/sliders/${sliderId}`, data).then((r) => r.data),

  deleteSlider: (sliderId: string) =>
    apiClient.delete(`/cms/admin/sliders/${sliderId}`),

  /* ── Offers / Coupons ── */
  listOffers: () =>
    apiClient.get<Offer[]>("/cms/admin/offers").then((r) => r.data),

  createOffer: (data: Omit<Offer, "id" | "created_at">) =>
    apiClient.post<Offer>("/cms/admin/offers", data).then((r) => r.data),

  updateOffer: (offerId: string, data: Partial<Offer>) =>
    apiClient.put<Offer>(`/cms/admin/offers/${offerId}`, data).then((r) => r.data),

  deleteOffer: (offerId: string) =>
    apiClient.delete(`/cms/admin/offers/${offerId}`),

  /* ── Blog ── */
  listBlogPosts: () =>
    apiClient.get<BlogPost[]>("/cms/admin/blog/posts").then((r) => r.data),

  createBlogPost: (data: Omit<BlogPost, "id" | "created_at">) =>
    apiClient.post<BlogPost>("/cms/admin/blog/posts", data).then((r) => r.data),

  updateBlogPost: (postId: string, data: Partial<BlogPost>) =>
    apiClient.put<BlogPost>(`/cms/admin/blog/posts/${postId}`, data).then((r) => r.data),

  deleteBlogPost: (postId: string) =>
    apiClient.delete(`/cms/admin/blog/posts/${postId}`),

  /* ── Static Pages ── */
  listStaticPages: () =>
    apiClient.get<StaticPage[]>("/cms/admin/pages").then((r) => r.data),

  createStaticPage: (data: Omit<StaticPage, "id" | "created_at" | "updated_at">) =>
    apiClient.post<StaticPage>("/cms/admin/pages", data).then((r) => r.data),

  updateStaticPage: (pageId: string, data: Partial<StaticPage>) =>
    apiClient.put<StaticPage>(`/cms/admin/pages/${pageId}`, data).then((r) => r.data),

  deleteStaticPage: (pageId: string) =>
    apiClient.delete(`/cms/admin/pages/${pageId}`),
};
