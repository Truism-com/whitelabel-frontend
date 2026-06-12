import { apiClient } from "./client";
import type { TopupRequest, WalletActionRequest, WalletSummary, WalletTransaction } from "@/lib/types/wallet.types";

export const walletApi = {
  /* ── Admin wallet ops ── */
  getUserWallet: (userId: string) =>
    apiClient.get<WalletSummary>(`/admin/wallet/user/${userId}`).then((r) => r.data),

  creditWallet: (data: WalletActionRequest) =>
    apiClient.post("/admin/wallet/credit", data).then((r) => r.data),

  debitWallet: (data: WalletActionRequest) =>
    apiClient.post("/admin/wallet/debit", data).then((r) => r.data),

  setCreditLimit: (data: { user_id: number; new_limit: number; reason: string; effective_until?: string }) =>
    apiClient.post("/admin/wallet/credit-limit", data).then((r) => r.data),

  getCreditLimitHistory: (userId: string) =>
    apiClient.get<{ history: any[]; current_limit: number; current_used: number; available_credit: number }>(`/admin/wallet/credit-limit/${userId}/history`).then((r) => r.data),

  suspendWallet: (userId: string) =>
    apiClient.post(`/admin/wallet/suspend/${userId}`).then((r) => r.data),

  activateWallet: (userId: string) =>
    apiClient.post(`/admin/wallet/activate/${userId}`).then((r) => r.data),

  /* ── Topup requests ── */
  getPendingTopups: () =>
    apiClient.get<TopupRequest[]>("/admin/wallet/topup/pending").then((r) => r.data),

  approveTopup: (requestId: string) =>
    apiClient.post(`/admin/wallet/topup/${requestId}/approve`).then((r) => r.data),

  rejectTopup: (requestId: string, reason?: string) =>
    apiClient.post(`/admin/wallet/topup/${requestId}/reject`, { reason }).then((r) => r.data),

  initiateOnlineTopup: (amount: number) =>
    apiClient.post<{ topup_ref: string; razorpay_order_id: string; amount: number; currency: string; key_id: string }>("/wallet/topup/online", { amount }).then((r) => r.data),

  verifyOnlineTopup: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiClient.post("/wallet/topup/verify", data).then((r) => r.data),

  /* ── User's own wallet ── */
  getMyWallet: () =>
    apiClient.get<WalletSummary>("/wallet/").then((r) => r.data),

  getMyTransactions: (params?: { page?: number; size?: number }) =>
    apiClient.get<WalletTransaction[]>("/wallet/transactions", { params }).then((r) => r.data),
};

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
