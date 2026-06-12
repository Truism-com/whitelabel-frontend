"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Download, XCircle,
  PlaneTakeoff, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useAgentBookings, useCancelBooking } from "@/lib/hooks/use-agent";
import { agentApi } from "@/lib/api/agent";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { AgentBooking } from "@/lib/types/agent.types";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";

const PAGE_SIZE = 10;

function CancelDialog({
  booking, open, onClose,
}: {
  booking: AgentBooking | null;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const cancel = useCancelBooking();

  const handleCancel = async () => {
    if (!booking) return;
    await cancel.mutateAsync({ id: booking.id, reason: reason.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title="Cancel Booking" onClose={onClose} />
      <DialogBody>
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Cancel booking {booking?.pnr ?? booking?.booking_ref}?</p>
            <p className="text-xs mt-1 text-red-500">Refund eligibility depends on fare rules.</p>
          </div>
          <FormField label="Reason for Cancellation" error={reason.trim().length > 0 && reason.trim().length < 10 ? "Reason must be at least 10 characters long" : undefined} required>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation (min 10 characters)..."
              rows={3}
            />
          </FormField>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Back</Button>
        <Button variant="destructive" size="sm" isLoading={cancel.isPending} disabled={reason.trim().length < 10} onClick={handleCancel}>
          Cancel Booking
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default function AgentBookingsPage() {
  const [page, setPage]           = useState(1);
  const [status, setStatus]       = useState("");
  const [search, setSearch]       = useState("");
  const [cancelTarget, setCancelTarget] = useState<AgentBooking | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useAgentBookings({
    page,
    size: PAGE_SIZE,
    status: status || undefined,
    search: search || undefined,
  });

  const bookings    = data?.results ?? [];
  const total       = data?.total ?? 0;
  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDownload = async (booking: AgentBooking) => {
    let booking_type = "flight";
    if (booking.id.includes(":")) {
      booking_type = booking.id.split(":")[0];
    }
    if (booking_type !== "flight") {
      toast.error("Ticket download is only available for flight bookings.");
      return;
    }
    if (!booking.ticket_url) {
      toast.error("Ticket not available yet.");
      return;
    }
    setDownloadingId(booking.id);
    try {
      const blob = await agentApi.downloadTicket(booking.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ticket-${booking.pnr ?? booking.booking_ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download ticket.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="My Bookings"
        description="All flight bookings made by you"
        rightAction={
          <Link href="/agent/bookings/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />New Booking
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by PNR, route, passenger…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: "",           label: "All Status" },
            { value: "confirmed",  label: "Confirmed" },
            { value: "pending",    label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "cancelled",  label: "Cancelled" },
            { value: "refunded",   label: "Refunded" },
          ]}
          className="w-full sm:w-40"
        />
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 shrink-0">
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["PNR / Ref", "Route", "Passenger", "Date", "Amount", "Commission", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-4 px-4 first:pl-5">
                        <Skeleton className="h-6 w-full rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      <PlaneTakeoff className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const canCancel = b.status === "confirmed" || b.status === "pending" || b.status === "processing";
                    return (
                      <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5">
                          <p className="font-mono font-semibold text-slate-800 text-xs">{b.pnr ?? b.booking_ref}</p>
                          {b.pnr && <p className="text-[10px] font-mono text-slate-400">{b.booking_ref}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 whitespace-nowrap">{b.origin} → {b.destination}</p>
                          {b.airline && <p className="text-xs text-slate-400">{b.airline} {b.flight_number}</p>}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {b.client_name ?? b.passenger_names?.[0] ?? "—"}
                          {(b.passenger_count ?? 1) > 1 && (
                            <span className="ml-1 text-[10px] text-slate-400">+{(b.passenger_count ?? 1) - 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          ₹{b.total_amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-medium whitespace-nowrap">
                          {b.commission ? `₹${b.commission.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={b.status as any} />
                        </td>
                        <td className="py-3 px-4 last:pr-5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownload(b)}
                              disabled={!b.ticket_url || downloadingId === b.id}
                              title="Download ticket"
                              className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            {canCancel && (
                              <button
                                onClick={() => setCancelTarget(b)}
                                title="Cancel booking"
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-xs text-slate-500 px-2">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <CancelDialog
        booking={cancelTarget}
        open={!!cancelTarget}
        onClose={() => { setCancelTarget(null); refetch(); }}
      />
    </div>
  );
}
