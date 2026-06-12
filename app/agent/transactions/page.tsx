"use client";

import { useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2,
  ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentTransactions } from "@/lib/hooks/use-agent";
import { cn } from "@/lib/utils/cn";
import type { WalletTransaction } from "@/lib/types/wallet.types";

const TXN_CONFIG: Record<WalletTransaction["type"], {
  label: string; icon: React.ElementType; color: string;
  sign: string; variant: "success" | "warning" | "secondary" | "default";
}> = {
  credit: { label: "Credit",  icon: ArrowDownLeft, color: "text-emerald-600 bg-emerald-50", sign: "+", variant: "success" },
  debit:  { label: "Debit",   icon: ArrowUpRight,  color: "text-red-500 bg-red-50",         sign: "-", variant: "default" },
  hold:   { label: "On Hold", icon: Clock,         color: "text-amber-500 bg-amber-50",     sign: "-", variant: "warning" },
  refund: { label: "Refund",  icon: CheckCircle2,  color: "text-blue-500 bg-blue-50",       sign: "+", variant: "secondary" },
};

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isFetching } = useAgentTransactions({ page, size: PAGE_SIZE });

  const transactions = data?.results ?? [];
  const total        = data?.total   ?? 0;
  const totalPages   = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-0.5">All wallet credits, debits and holds</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Type", "Description", "Ref", "Amount", "Balance After", "Date"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400 text-sm">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const cfg = TXN_CONFIG[t.type] ?? TXN_CONFIG.debit;
                    const isPositive = t.type === "credit" || t.type === "refund";
                    return (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", cfg.color)}>
                              <cfg.icon className="h-3.5 w-3.5" />
                            </div>
                            <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                          {t.description ?? "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                          {t.transaction_ref}
                        </td>
                        <td className={cn("py-3 px-4 font-semibold whitespace-nowrap", isPositive ? "text-emerald-600" : "text-red-500")}>
                          {cfg.sign}₹{t.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                          ₹{t.balance_after.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 last:pr-5 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          <span className="block text-[10px]">{new Date(t.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-slate-600 px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
