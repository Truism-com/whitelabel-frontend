"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePendingTopups,
  useApproveTopup,
  useRejectTopup,
  useCreditWallet,
  useDebitWallet,
} from "@/lib/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Plus, Minus, Clock } from "lucide-react";

const manualSchema = z.object({
  agent_id:    z.string().min(1, "Agent ID is required"),
  amount:      z.number().min(1, "Must be > 0"),
  description: z.string().min(1, "Description required"),
});
type ManualForm = z.infer<typeof manualSchema>;

const rejectSchema = z.object({ reason: z.string().optional() });
type RejectForm = z.infer<typeof rejectSchema>;

function ManualWalletDialog({
  type,
  open,
  onClose,
}: {
  type: "credit" | "debit";
  open: boolean;
  onClose: () => void;
}) {
  const credit = useCreditWallet();
  const debit  = useDebitWallet();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ManualForm>({
    resolver: zodResolver(manualSchema),
  });

  const onSubmit = (v: ManualForm) => {
    const action = type === "credit" ? credit : debit;
    action.mutate(
      { agent_id: v.agent_id, amount: v.amount * 100, description: v.description },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader
        title={type === "credit" ? "Credit Agent Wallet" : "Debit Agent Wallet"}
        onClose={onClose}
      />
      <DialogBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Agent ID" error={errors.agent_id?.message} required>
            <Input {...register("agent_id")} placeholder="Agent UUID" />
          </FormField>
          <FormField label="Amount (₹)" error={errors.amount?.message} required>
            <Input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
          </FormField>
          <FormField label="Description" error={errors.description?.message} required>
            <Textarea {...register("description")} placeholder="Reason for adjustment..." rows={3} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              size="sm"
              variant={type === "debit" ? "destructive" : "default"}
              isLoading={credit.isPending || debit.isPending}
            >
              {type === "credit" ? "Credit Wallet" : "Debit Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
}

function RejectDialog({
  topupId,
  open,
  onClose,
}: {
  topupId: string;
  open: boolean;
  onClose: () => void;
}) {
  const reject = useRejectTopup();
  const { register, handleSubmit, reset } = useForm<RejectForm>({ resolver: zodResolver(rejectSchema) });

  return (
    <Dialog open={open} onClose={onClose} size="xs">
      <DialogHeader title="Reject Topup Request" onClose={onClose} />
      <DialogBody>
        <form
          onSubmit={handleSubmit((v) =>
            reject.mutate({ id: topupId, reason: v.reason }, { onSuccess: () => { reset(); onClose(); } })
          )}
          className="space-y-4"
        >
          <FormField label="Reason (optional)">
            <Textarea {...register("reason")} placeholder="Reason for rejection..." rows={3} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" variant="destructive" isLoading={reject.isPending}>Reject</Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  );
}

export default function WalletPage() {
  const [manualType, setManualType] = useState<"credit" | "debit" | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const { data: topups, isLoading } = usePendingTopups();
  const approve = useApproveTopup();

  return (
    <div className="space-y-6">
      {/* Manual actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="sm" onClick={() => setManualType("credit")} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />Credit Agent Wallet
        </Button>
        <Button size="sm" variant="outline" onClick={() => setManualType("debit")} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
          <Minus className="h-3.5 w-3.5" />Debit Agent Wallet
        </Button>
      </div>

      {/* Pending topups */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold text-slate-700">Pending Topup Requests</CardTitle>
          </div>
          <p className="text-xs text-slate-400">Auto-refreshes every 30 seconds</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Agent", "Amount", "Method", "Reference", "Requested", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-1 last:pr-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-1"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (topups ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                      No pending topup requests
                    </td>
                  </tr>
                ) : (
                  (topups ?? []).map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 first:pl-1">
                        <p className="font-medium text-slate-800">{t.agent_name}</p>
                        <p className="text-xs text-slate-400">{t.agent_email}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        ₹{(t.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600">{t.payment_method ?? "—"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{t.reference ?? "—"}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3 px-4 last:pr-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approve.mutate(t.id)}
                            disabled={approve.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />Approve
                          </button>
                          <button
                            onClick={() => setRejectId(t.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ManualWalletDialog
        type={manualType ?? "credit"}
        open={!!manualType}
        onClose={() => setManualType(null)}
      />
      {rejectId && (
        <RejectDialog
          topupId={rejectId}
          open={!!rejectId}
          onClose={() => setRejectId(null)}
        />
      )}
    </div>
  );
}
