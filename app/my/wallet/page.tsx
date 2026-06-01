"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
  Plus, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerWallet, useCustomerTransactions, useRequestTopup } from "@/lib/hooks/use-customer";
import { cn } from "@/lib/utils/cn";
import type { WalletTransaction } from "@/lib/types/wallet.types";

const topupSchema = z.object({
  amount:         z.number().min(100, "Minimum ₹100"),
  payment_method: z.enum(["upi", "neft", "imps", "rtgs", "cheque", "cash"]),
  reference:      z.string().optional(),
  notes:          z.string().optional(),
});
type TopupForm = z.infer<typeof topupSchema>;

const TXN_CFG: Record<WalletTransaction["type"], { label: string; icon: React.ElementType; color: string; sign: string; variant: "success" | "warning" | "secondary" | "default" }> = {
  credit: { label: "Credit",  icon: ArrowDownLeft, color: "text-emerald-600 bg-emerald-50", sign: "+", variant: "success" },
  debit:  { label: "Debit",   icon: ArrowUpRight,  color: "text-red-500 bg-red-50",         sign: "-", variant: "default" },
  hold:   { label: "On Hold", icon: Clock,         color: "text-amber-500 bg-amber-50",     sign: "-", variant: "warning" },
  refund: { label: "Refund",  icon: CheckCircle2,  color: "text-blue-500 bg-blue-50",       sign: "+", variant: "secondary" },
};

const PAGE_SIZE = 10;

function TopupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const req = useRequestTopup();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TopupForm>({
    resolver: zodResolver(topupSchema),
    defaultValues: { payment_method: "upi" },
  });

  const onSubmit = async (v: TopupForm) => {
    await req.mutateAsync({ ...v, amount: v.amount * 100 });
    reset(); onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title="Add Money to Wallet" onClose={onClose} />
      <DialogBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5 flex gap-2.5 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Transfer the amount to our bank account first, then submit this form. Your wallet will be credited within 24 hours after verification.
            </p>
          </div>

          {/* Quick amounts */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Select amount</p>
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => reset({ ...{ payment_method: "upi" as const }, amount: amt })}
                  className="py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Amount (₹)" error={errors.amount?.message} required>
            <Input {...register("amount", { valueAsNumber: true })} type="number" step="100" placeholder="Enter amount" />
          </FormField>

          <FormField label="Payment Method" required>
            <Select {...register("payment_method")} options={[
              { value: "upi",    label: "UPI" },
              { value: "neft",   label: "NEFT" },
              { value: "imps",   label: "IMPS" },
              { value: "rtgs",   label: "RTGS" },
              { value: "cheque", label: "Cheque" },
              { value: "cash",   label: "Cash" },
            ]} />
          </FormField>

          <FormField label="UTR / Reference No." hint="Transaction ID from your bank/UPI app">
            <Input {...register("reference")} placeholder="e.g. UTR123456789012" />
          </FormField>

          <FormField label="Notes (optional)">
            <Textarea {...register("notes")} rows={2} placeholder="Any additional information…" />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={req.isPending}>Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
}

export default function CustomerWalletPage() {
  const [topupOpen, setTopupOpen] = useState(false);
  const [txnPage, setTxnPage]     = useState(1);

  const { data: wallet, isLoading: walletLoading } = useCustomerWallet();
  const { data: txnData, isLoading: txnLoading, refetch, isFetching } =
    useCustomerTransactions({ page: txnPage, size: PAGE_SIZE });

  const txns       = txnData?.results ?? [];
  const txnTotal   = txnData?.total   ?? 0;
  const totalPages = Math.max(1, Math.ceil(txnTotal / PAGE_SIZE));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-medium opacity-70">Wallet Balance</p>
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          {walletLoading
            ? <Skeleton className="h-10 w-44 bg-white/20 rounded-lg mt-1" />
            : <p className="text-4xl font-bold mt-1">₹{((wallet?.balance ?? 0) / 100).toLocaleString("en-IN")}</p>
          }
          <p className="text-white/50 text-xs mt-1">
            {wallet?.is_suspended ? "⛔ Wallet suspended — contact support" : "✓ Active"}
          </p>
          <div className="mt-5">
            <Button
              onClick={() => setTopupOpen(true)}
              className="bg-white text-primary hover:bg-slate-100 font-semibold gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" /> Add Money
            </Button>
          </div>
        </div>
      </div>

      {/* How topup works */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
        {[
          { step: "1", title: "Transfer",   desc: "Send to our bank/UPI" },
          { step: "2", title: "Submit",     desc: "Fill the request form" },
          { step: "3", title: "Credited",   desc: "Within 24 hours" },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-xl bg-white border border-slate-200 p-3.5">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-2">{step}</div>
            <p className="font-semibold text-slate-700">{title}</p>
            <p className="text-slate-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Transaction History</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {txnLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : txns.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No transactions yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {txns.map((t) => {
                  const cfg = TXN_CFG[t.type] ?? TXN_CFG.debit;
                  const pos = t.type === "credit" || t.type === "refund";
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", cfg.color)}>
                        <cfg.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {t.description ?? cfg.label}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{t.transaction_ref}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("font-bold text-sm", pos ? "text-emerald-600" : "text-red-500")}>
                          {cfg.sign}₹{(t.amount / 100).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {txnTotal > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {Math.min((txnPage - 1) * PAGE_SIZE + 1, txnTotal)}–{Math.min(txnPage * PAGE_SIZE, txnTotal)} of {txnTotal}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTxnPage((p) => Math.max(1, p - 1))} disabled={txnPage === 1}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-slate-500 px-1">{txnPage}/{totalPages}</span>
                  <button onClick={() => setTxnPage((p) => Math.min(totalPages, p + 1))} disabled={txnPage === totalPages}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TopupDialog open={topupOpen} onClose={() => setTopupOpen(false)} />
    </div>
  );
}
