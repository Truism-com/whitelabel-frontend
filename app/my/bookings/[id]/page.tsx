"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, XCircle, PlaneTakeoff, PlaneLanding,
  User, Mail, Phone, Clock, CheckCircle2, MapPin,
  Luggage, CreditCard, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerBooking, useCancelBooking } from "@/lib/hooks/use-customer";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { BookingStatus } from "@/lib/types/customer.types";

const STATUS_CFG: Record<BookingStatus, {
  label: string; variant: "success" | "warning" | "destructive" | "secondary";
  icon: React.ElementType; bg: string;
}> = {
  confirmed:  { label: "Confirmed",  variant: "success",     icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-100" },
  pending:    { label: "Pending",    variant: "warning",     icon: Clock,        bg: "bg-amber-50  border-amber-100" },
  processing: { label: "Processing", variant: "warning",     icon: Clock,        bg: "bg-amber-50  border-amber-100" },
  cancelled:  { label: "Cancelled",  variant: "destructive", icon: XCircle,      bg: "bg-red-50    border-red-100" },
  refunded:   { label: "Refunded",   variant: "secondary",   icon: CheckCircle2, bg: "bg-slate-50  border-slate-200" },
  failed:     { label: "Failed",     variant: "destructive", icon: XCircle,      bg: "bg-red-50    border-red-100" },
};

function fmtDT(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString("en-IN", opts ?? { dateStyle: "medium", timeStyle: "short" });
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: booking, isLoading } = useCustomerBooking(id);
  const cancel = useCancelBooking();
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason]         = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!booking?.ticket_url) { toast.error("Ticket not available yet."); return; }
    setDownloading(true);
    try {
      const blob = await customerApi.downloadTicket(id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ticket-${booking.pnr ?? booking.booking_ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Could not download ticket."); }
    finally { setDownloading(false); }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Booking not found.</p>
        <Link href="/my/bookings" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to bookings</Link>
      </div>
    );
  }

  const cfg      = STATUS_CFG[booking.status] ?? STATUS_CFG.pending;
  const canCancel = booking.status === "confirmed" || booking.status === "pending" || booking.status === "processing";
  const seg      = booking.segments?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + actions bar */}
      <div className="flex items-center justify-between">
        <Link href="/my/bookings" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> My Bookings
        </Link>
        <div className="flex gap-2">
          {booking.ticket_url && (
            <Button size="sm" variant="outline" onClick={handleDownload} isLoading={downloading} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download Ticket
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" onClick={() => setShowCancel(true)}
              className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={cn("rounded-2xl border p-5 flex items-center justify-between gap-3", cfg.bg)}>
        <div className="flex items-center gap-3">
          <cfg.icon className={cn("h-6 w-6", booking.status === "confirmed" ? "text-emerald-600" : booking.status === "cancelled" ? "text-red-500" : "text-amber-600")} />
          <div>
            <p className="font-bold text-slate-900">Booking {cfg.label}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Ref: {booking.booking_ref}{booking.pnr ? ` · PNR: ${booking.pnr}` : ""}
            </p>
          </div>
        </div>
        <Badge variant={cfg.variant} className="text-xs px-3 py-1">{cfg.label}</Badge>
      </div>

      {/* Flight info */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-800">Flight Details</p>
          {booking.cabin_class && (
            <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2.5 py-1 rounded-full">
              {booking.cabin_class.replace("_", " ")}
            </span>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <PlaneTakeoff className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{booking.airline ?? "—"}</p>
              <p className="text-sm text-slate-400 font-mono">{booking.flight_number ?? ""}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            {/* Origin */}
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{booking.origin}</p>
              <p className="text-xs text-slate-400 mt-0.5">{booking.origin_name ?? booking.origin}</p>
              {seg?.departure_time && (
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {new Date(seg.departure_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </p>
              )}
            </div>

            {/* Line */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {seg?.duration_minutes && (
                <p className="text-xs text-slate-400">{Math.floor(seg.duration_minutes / 60)}h {seg.duration_minutes % 60}m</p>
              )}
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <PlaneTakeoff className="h-3.5 w-3.5 text-slate-300" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <p className="text-[11px] text-slate-400">
                {seg?.stops === 0 ? "Non-stop" : seg?.stops ? `${seg.stops} stop(s)` : "Direct"}
              </p>
            </div>

            {/* Destination */}
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{booking.destination}</p>
              <p className="text-xs text-slate-400 mt-0.5">{booking.destination_name ?? booking.destination}</p>
              {seg?.arrival_time && (
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {new Date(seg.arrival_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </p>
              )}
            </div>
          </div>

          {/* Date row */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {new Date(booking.travel_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            {booking.is_refundable !== undefined && (
              <Badge variant={booking.is_refundable ? "success" : "secondary"} className="text-[10px]">
                {booking.is_refundable ? "Refundable" : "Non-refundable"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Passengers */}
      {booking.passengers && booking.passengers.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-800">Passengers ({booking.passenger_count})</p>
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-3">
            {booking.passengers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {p.title} {p.first_name} {p.last_name}
                  </p>
                  {p.passport_no && <p className="text-xs text-slate-400 font-mono">Passport: {p.passport_no}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact + fare */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Contact */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="font-semibold text-slate-800 mb-4">Contact Details</p>
          <div className="space-y-3 text-sm">
            {booking.contact_email && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />{booking.contact_email}
              </div>
            )}
            {booking.contact_phone && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />{booking.contact_phone}
              </div>
            )}
          </div>
        </div>

        {/* Fare */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="font-semibold text-slate-800 mb-4">Fare Summary</p>
          <div className="space-y-2 text-sm">
            {booking.fare_breakdown ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>Base Fare</span>
                  <span>₹{(booking.fare_breakdown.base_fare / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes & Fees</span>
                  <span>₹{((booking.fare_breakdown.taxes + booking.fare_breakdown.fees) / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Paid</span>
                  <span>₹{(booking.total_amount / 100).toLocaleString("en-IN")}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total Paid</span>
                <span>₹{(booking.total_amount / 100).toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booked on */}
      <p className="text-xs text-slate-400 text-center">
        Booked on {fmtDT(booking.created_at)}
        {booking.updated_at && ` · Last updated ${fmtDT(booking.updated_at)}`}
      </p>

      {/* Cancel dialog */}
      <Dialog open={showCancel} onClose={() => setShowCancel(false)} size="sm">
        <DialogHeader title="Cancel Booking" onClose={() => setShowCancel(false)} />
        <DialogBody>
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">Are you sure you want to cancel?</p>
              <p className="text-xs text-red-500">Refund eligibility depends on fare rules. Allow 5–7 business days.</p>
            </div>
            <FormField label="Reason (optional)">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for cancellation…" />
            </FormField>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setShowCancel(false)}>Keep Booking</Button>
          <Button variant="destructive" size="sm" isLoading={cancel.isPending}
            onClick={async () => {
              await cancel.mutateAsync({ id, reason: reason.trim() || undefined });
              setShowCancel(false);
            }}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
