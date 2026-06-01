"use client";

import { useState } from "react";
import { useAdminBookings } from "@/lib/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

const STATUS_OPTS = [
  { value: "", label: "All Status" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "pending",    label: "Pending" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "processing", label: "Processing" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  confirmed:  { label: "Confirmed",  variant: "success" },
  pending:    { label: "Pending",    variant: "warning" },
  cancelled:  { label: "Cancelled", variant: "destructive" },
  processing: { label: "Processing", variant: "secondary" },
};

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminBookings({ status: status || undefined });

  const bookings = (data?.results ?? []).filter(
    (b) =>
      !search ||
      b.passenger_name.toLowerCase().includes(search.toLowerCase()) ||
      (b.pnr ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.agent_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">All Bookings</h2>
          <p className="text-xs text-slate-400 mt-0.5">View and manage all flight bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 text-sm w-36"
            options={STATUS_OPTS}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["PNR", "Passenger", "Route", "Agent", "Travel Date", "Amount", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-12">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const s = STATUS_MAP[b.status] ?? { label: b.status, variant: "secondary" as const };
                    return (
                      <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5 font-mono text-xs text-slate-500">{b.pnr ?? b.id.slice(0,8)}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{b.passenger_name}</td>
                        <td className="py-3 px-4 text-slate-600">{b.origin} → {b.destination}</td>
                        <td className="py-3 px-4 text-slate-500">{b.agent_name ?? "Direct"}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">₹{(b.total_amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                        <td className="py-3 px-4 last:pr-5"><Badge variant={s.variant}>{s.label}</Badge></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
