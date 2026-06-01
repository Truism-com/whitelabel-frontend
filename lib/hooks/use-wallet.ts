"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api/wallet";
import { parseApiError } from "@/lib/api/client";
import type { WalletActionRequest } from "@/lib/types/wallet.types";

export function usePendingTopups() {
  return useQuery({
    queryKey: ["wallet", "topups", "pending"],
    queryFn:  walletApi.getPendingTopups,
    refetchInterval: 30_000,
  });
}

export function useApproveTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletApi.approveTopup,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["wallet"] }); toast.success("Topup approved."); },
    onError:    (e) => toast.error(parseApiError(e)),
  });
}

export function useRejectTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      walletApi.rejectTopup(id, reason),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["wallet"] }); toast.success("Topup rejected."); },
    onError:    (e) => toast.error(parseApiError(e)),
  });
}

export function useCreditWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletActionRequest) => walletApi.creditWallet(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["wallet"] }); toast.success("Wallet credited successfully."); },
    onError:    (e) => toast.error(parseApiError(e)),
  });
}

export function useDebitWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletActionRequest) => walletApi.debitWallet(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["wallet"] }); toast.success("Wallet debited successfully."); },
    onError:    (e) => toast.error(parseApiError(e)),
  });
}

export function useMyWallet() {
  return useQuery({ queryKey: ["wallet", "me"], queryFn: walletApi.getMyWallet });
}

export function useMyTransactions() {
  return useQuery({ queryKey: ["wallet", "transactions"], queryFn: () => walletApi.getMyTransactions() });
}
