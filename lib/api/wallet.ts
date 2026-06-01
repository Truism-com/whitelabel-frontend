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

  setCreditLimit: (data: { user_id: string; credit_limit: number }) =>
    apiClient.post("/admin/wallet/credit-limit", data).then((r) => r.data),

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

  /* ── User's own wallet ── */
  getMyWallet: () =>
    apiClient.get<WalletSummary>("/wallet/").then((r) => r.data),

  getMyTransactions: (params?: { page?: number; size?: number }) =>
    apiClient.get<WalletTransaction[]>("/wallet/transactions", { params }).then((r) => r.data),
};
