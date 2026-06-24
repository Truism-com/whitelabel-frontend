"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Download, XCircle,
  PlaneTakeoff, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerBookings, useCancelBooking } from "@/lib/hooks/use-customer";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { CustomerBooking } from "@/lib/types/customer.types";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";

const PAGE_SIZE = 8;

function CancelDialog({ booking, open, onClose }: { booking: CustomerBooking | null; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const cancel = useCancelBooking();
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title="Cancel Booking" onClose={onClose} />
      <DialogBody>
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            <p className="font-semibold mb-1">Cancel {booking?.pnr ?? booking?.booking_ref}?</p>
            <p className="text-xs text-red-500">Refund (if applicable) will be processed in 5-7 business days.</p>
          </div>
          <FormField label="Reason for Cancellation" error={reason.trim().length > 0 && reason.trim().length < 10 ? "Reason must be at least 10 characters long" : undefined} required>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for cancellation (min 10 characters)..." />
          </FormField>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Keep Booking</Button>
        <Button variant="destructive" size="sm" isLoading={cancel.isPending} disabled={reason.trim().length < 10}
          onClick={async () => {
            if (!booking) return;
            await cancel.mutateAsync({ id: booking.id, reason: reason.trim() });
            onClose();
          }}>
          Cancel Booking
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function BookingCard({ booking }: { booking: CustomerBooking }) {
  const [downloading, setDownloading] = useState(false);
  const canCancel = booking.status === "confirmed" || booking.status === "pending";
  const [showCancel, setShowCancel] = useState(false);

  const handleDownload = async () => {
    if (!booking.ticket_url) { toast.error("Ticket not available yet."); return; }
    setDownloading(true);
    try {
      const blob = await customerApi.downloadTicket(booking.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ticket-${booking.pnr ?? booking.booking_ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Could not download ticket."); }
    finally { setDownloading(false); }
  };

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all motion-reduce:transition-none duration-300 ease-in-out overflow-hidden">
        {/* Status bar */}
        <div className={cn(
          "px-5 py-2.5 flex items-center justify-between text-xs",
          booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700" :
          booking.status === "cancelled" ? "bg-red-50 text-red-700" :
          "bg-amber-50 text-amber-700"
        )}>
          <span className="font-semibold font-mono">{booking.pnr ?? booking.booking_ref}</span>
          <StatusBadge status={booking.status as any} />
        </div>

        <div className="p-5">
          {/* Route */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-center min-w-[52px]">
              <p className="text-2xl font-bold text-slate-900">{booking.origin}</p>
              <p className="text-[10px] text-slate-400 truncate">{booking.origin_name ?? ""}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <PlaneTakeoff className="h-3.5 w-3.5 text-slate-300" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              {booking.airline && (
                <p className="text-[10px] text-slate-400">{booking.airline} {booking.flight_number}</p>
              )}
            </div>
            <div className="text-center min-w-[52px]">
              <p className="text-2xl font-bold text-slate-900">{booking.destination}</p>
              <p className="text-[10px] text-slate-400 truncate">{booking.destination_name ?? ""}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex flex-wrap gap-3">
              <span>
                📅 {new Date(booking.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {booking.departure_time && ` · ${new Date(booking.departure_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}`}
              </span>
              <span>👤 {booking.passenger_count} pax</span>
              {booking.cabin_class && <span className="capitalize">🪑 {booking.cabin_class.replace("_", " ")}</span>}
            </div>
            <p className="font-bold text-slate-800 text-base">₹{booking.total_amount.toLocaleString("en-IN")}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <Link href={`/my/bookings/${booking.id}`} className="text-xs text-primary font-medium hover:underline">
              View Details →
            </Link>
            <div className="flex gap-2">
              {booking.ticket_url && (
                <Button size="sm" variant="outline" onClick={handleDownload} isLoading={downloading} className="gap-1.5 text-xs h-8">
                  <Download className="h-3 w-3" /> Ticket
                </Button>
              )}
              {canCancel && (
                <Button size="sm" variant="outline" onClick={() => setShowCancel(true)}
                  className="gap-1.5 text-xs h-8 text-red-500 border-red-200 hover:bg-red-50">
                  <XCircle className="h-3 w-3" /> Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CancelDialog booking={booking} open={showCancel} onClose={() => setShowCancel(false)} />
    </>
  );
}

export default function BookingsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab]       = useState("all");

  const statusMap: Record<string, string | undefined> = {
    all: undefined, upcoming: "confirmed", past: "completed", cancelled: "cancelled",
  };

  const { data, isLoading } = useCustomerBookings({
    page, size: PAGE_SIZE,
    status: statusMap[tab],
    search: search || undefined,
  });

  const bookings   = data?.results ?? [];
  const total      = data?.total   ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="My Bookings"
        description="All your flight bookings in one place"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs defaultValue="all" value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
          <TabsList className="w-full sm:w-auto">
            {[
              { value: "all",       label: "All" },
              { value: "upcoming",  label: "Upcoming" },
              { value: "past",      label: "Past" },
              { value: "cancelled", label: "Cancelled" },
            ].map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by PNR or route…"
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Booking cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <PlaneTakeoff className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No bookings found</p>
          <p className="text-xs text-slate-400 mb-4">
            {search ? "Try a different search term." : "Your bookings will appear here."}
          </p>
          <Link href="/my/search">
            <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" />Search Flights</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-600 px-3">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
