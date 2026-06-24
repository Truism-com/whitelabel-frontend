"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Loader2, CheckCircle, AlertTriangle, ArrowRight,
  Download, Plane, Calendar, Users, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStatus, useCustomerBooking } from "@/lib/hooks/use-customer";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import { parseApiError } from "@/lib/api/client";

export default function CustomerConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [downloading, setDownloading] = useState(false);

  // Poll status endpoint
  const { data: statusData, isLoading: statusLoading } = useBookingStatus(id, true);

  // Fetch full details (only once status is confirmed)
  const isConfirmed = statusData?.status === "confirmed";
  const { data: booking, isLoading: bookingLoading } = useCustomerBooking(id);

  const handleDownload = async () => {
    if (!booking?.ticket_url) {
      toast.error("Ticket is not available yet.");
      return;
    }
    setDownloading(true);
    try {
      const blob = await customerApi.downloadTicket(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${statusData?.pnr || booking.pnr || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setDownloading(false);
    }
  };

  const status = statusData?.status || booking?.status || "pending";
  const pnr = statusData?.pnr || booking?.pnr;
  const ref = statusData?.booking_reference || booking?.booking_ref;

  // Render Loading / Pending state
  if (statusLoading || status === "pending") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping h-20 w-20 rounded-full bg-primary/10" />
          <div className="relative h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Ticketing in Progress</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We are securing your seats and issuing your ticket with the airline. This may take up to 15 seconds. Please do not close or refresh this page.
          </p>
        </div>
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="p-4 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Reference:</span>
              <span className="font-mono font-semibold text-slate-800">{ref || "Generating..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="capitalize font-semibold text-amber-600">{status}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Failure state
  if (status === "failed" || status === "ticketing_failed") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="relative flex justify-center items-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Ticketing Failed</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Payment was taken but ticket issuance failed. Any debited amount has been auto-refunded to your wallet.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/my/search">
            <Button className="w-full">Search Flights Again</Button>
          </Link>
          <Link href="/my/bookings">
            <Button variant="outline" className="w-full">Go to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render Success state
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Hero Header */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-2">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          Seats secured and ticket successfully issued. A copy of the e-ticket has been sent to your registered email.
        </p>
      </div>

      {/* Main Details */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="bg-emerald-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-100 gap-2">
          <div>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Airline PNR</p>
            <p className="text-2xl font-mono font-bold text-emerald-800">{pnr || "Processing"}</p>
          </div>
          <div className="text-sm text-emerald-700 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Booking Reference</p>
            <p className="font-mono font-bold">{ref || id}</p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Flight Route Summary */}
          {booking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Plane className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{booking.airline || "Airline"}</p>
                  <p className="text-xs text-slate-400 font-mono">{booking.flight_number || "Flight"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="text-left">
                  <p className="text-2xl font-bold text-slate-950">{booking.origin}</p>
                  <p className="text-xs text-slate-400 max-w-[120px] truncate">{booking.origin_name}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-center gap-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <Plane className="h-4 w-4 text-slate-300" />
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">
                    {booking.cabin_class?.replace("_", " ") || "Economy"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-950">{booking.destination}</p>
                  <p className="text-xs text-slate-400 max-w-[120px] truncate">{booking.destination_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Meta Stats */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Travel Date</p>
                <p className="font-semibold text-slate-800">
                  {booking?.travel_date
                    ? new Date(booking.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Confirming"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Users className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Passengers</p>
                <p className="font-semibold text-slate-800">
                  {booking?.passenger_count || 1} Travellers
                </p>
              </div>
            </div>
          </div>

          {/* Wallet and Price */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Paid via Wallet</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Amount Paid</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{booking?.total_amount ? booking.total_amount.toLocaleString("en-IN") : "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {booking?.ticket_url && (
          <Button onClick={handleDownload} isLoading={downloading} className="w-full sm:w-auto gap-2">
            <Download className="h-4 w-4" /> Download E-Ticket
          </Button>
        )}
        <Link href="/my/bookings" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">View My Bookings</Button>
        </Link>
        <Link href="/my/search" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full gap-1">
            Book Another Flight <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
