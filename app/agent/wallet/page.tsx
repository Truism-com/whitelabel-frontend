"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { walletApi, loadRazorpay } from "@/lib/api/wallet";
import { parseApiError } from "@/lib/api/client";
import { toast } from "sonner";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Plus, Clock,
  CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAgentWallet, useAgentTransactions, useRequestTopup } from "@/lib/hooks/use-agent";
import { cn } from "@/lib/utils/cn";
import type { WalletTransaction } from "@/lib/types/wallet.types";

/* ─── Topup schema ────────────────────────────────────────────────── */
const topupSchema = z.object({
  amount:         z.number().min(100, "Minimum ₹100"),
  payment_method: z.enum(["online", "upi", "neft", "imps", "rtgs", "cheque", "cash"]),
  reference:      z.string().optional(),
  notes:          z.string().optional(),
});
type TopupForm = z.infer<typeof topupSchema>;

/* ─── Topup dialog ────────────────────────────────────────────────── */
function TopupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const requestTopup = useRequestTopup();
  const qc = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TopupForm>({
    resolver: zodResolver(topupSchema),
    defaultValues: { payment_method: "online" },
  });
  const method = watch("payment_method");

  const onSubmit = async (v: TopupForm) => {
    if (v.payment_method === "online") {
      setIsProcessing(true);
      try {
        const orderData = await walletApi.initiateOnlineTopup(v.amount);
        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway script. Please try again.");
          setIsProcessing(false);
          return;
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "TravelOS Wallet Topup",
          description: `Topup Wallet Ref: ${orderData.topup_ref}`,
          order_id: orderData.razorpay_order_id,
          handler: async function (response: any) {
            try {
              await walletApi.verifyOnlineTopup({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success("Payment verified! Wallet topped up.");
              qc.invalidateQueries({ queryKey: ["agent", "wallet"] });
              qc.invalidateQueries({ queryKey: ["agent", "transactions"] });
              onClose();
              reset();
            } catch (err) {
              toast.error("Signature verification failed: " + parseApiError(err));
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error("Initiation failed: " + parseApiError(err));
        setIsProcessing(false);
      }
    } else {
      await requestTopup.mutateAsync({
        amount: v.amount,
        payment_method: v.payment_method,
        reference: v.reference,
        notes: v.notes,
      });
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title="Request Wallet Top-up" onClose={onClose} />
      <DialogBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {method === "online" ? (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex gap-2.5 text-sm text-indigo-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>You will be redirected to the secure Razorpay payment gateway to complete your transaction instantly.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 flex gap-2.5 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Top-up requests are reviewed by admin within 24 hours. Transfer the amount first, then submit this form.</p>
            </div>
          )}

          <FormField label="Amount (₹)" error={errors.amount?.message} required>
            <Input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              step="100"
              placeholder="1000"
            />
          </FormField>

          <FormField label="Payment Method" required>
            <Select {...register("payment_method")} options={[
              { value: "online", label: "Online Payment (Razorpay)" },
              { value: "upi",    label: "UPI" },
              { value: "neft",   label: "NEFT" },
              { value: "imps",   label: "IMPS" },
              { value: "rtgs",   label: "RTGS" },
              { value: "cheque", label: "Cheque" },
              { value: "cash",   label: "Cash" },
            ]} />
          </FormField>

          {method !== "online" && (
            <FormField label="UTR / Reference No." hint="Transaction reference from your bank">
              <Input {...register("reference")} placeholder="e.g. UTR123456789012" />
            </FormField>
          )}

          <FormField label="Notes (optional)">
            <Textarea {...register("notes")} placeholder="Any additional info for admin..." rows={2} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isProcessing || requestTopup.isPending}>
              {method === "online" ? "Pay Now" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
}

/* ─── Transaction row ─────────────────────────────────────────────── */
const TXN_CONFIG: Record<WalletTransaction["type"], { label: string; icon: React.ElementType; color: string; sign: string }> = {
  credit:  { label: "Credit",  icon: ArrowDownLeft,  color: "text-emerald-600", sign: "+" },
  debit:   { label: "Debit",   icon: ArrowUpRight,   color: "text-red-500",     sign: "-" },
  hold:    { label: "Hold",    icon: Clock,          color: "text-amber-500",   sign: "-" },
  refund:  { label: "Refund",  icon: CheckCircle2,   color: "text-blue-500",    sign: "+" },
};

/* ─── Main page ──────────────────────────────────────────────────── */
export default function AgentWalletPage() {
  const [topupOpen, setTopupOpen] = useState(false);
  const { data: wallet, isLoading: walletLoading } = useAgentWallet();

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium opacity-70 mb-1">Available Balance</p>
              {walletLoading
                ? <Skeleton className="h-9 w-40 bg-white/20 rounded-lg" />
                : <p className="text-4xl font-bold">₹{(wallet?.balance ?? 0).toLocaleString("en-IN")}</p>
              }
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {wallet?.credit_limit ? (
              <div>
                <p className="text-[11px] opacity-60">Credit Limit</p>
                <p className="font-semibold">₹{wallet.credit_limit.toLocaleString("en-IN")}</p>
              </div>
            ) : null}
            <div>
              <p className="text-[11px] opacity-60">Status</p>
              <p className="font-semibold text-sm flex items-center gap-1">
                {wallet?.is_suspended
                  ? <><XCircle className="h-3.5 w-3.5 text-red-300" /> Suspended</>
                  : <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Active</>
                }
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={() => setTopupOpen(true)}
              className="bg-white text-primary hover:bg-slate-100 font-semibold gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Request Top-up
            </Button>
          </div>
        </div>
      </div>

      {/* Topup dialog */}
      <TopupDialog open={topupOpen} onClose={() => setTopupOpen(false)} />
    </div>
  );
}
