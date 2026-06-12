"use client";

import Link from "next/link";
import {
  Search, CalendarCheck, Wallet, Clock, CheckCircle2,
  XCircle, PlaneTakeoff, ArrowRight, MapPin, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCustomerStats, useUpcomingTrips } from "@/lib/hooks/use-customer";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { BookingStatus, CustomerBooking } from "@/lib/types/customer.types";
import { StatusBadge } from "@/components/common/status-badge";



function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function UpcomingCard({ trip }: { trip: CustomerBooking }) {
  const days = daysUntil(trip.travel_date);

  const handleDownload = async () => {
    if (!trip.ticket_url) { toast.error("Ticket not ready yet."); return; }
    try {
      const blob = await customerApi.downloadTicket(trip.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `ticket-${trip.pnr ?? trip.booking_ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Could not download ticket."); }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all motion-reduce:transition-none duration-300 ease-in-out">
      {/* Colored header strip */}
      <div className={cn(
        "px-5 py-3 flex items-center justify-between",
        trip.status === "confirmed" ? "bg-emerald-50" :
        trip.status === "pending" || trip.status === "processing" ? "bg-amber-50" : "bg-slate-50"
      )}>
        <div className="flex items-center gap-2">
          <PlaneTakeoff className={cn("h-4 w-4", trip.status === "confirmed" ? "text-emerald-600" : "text-amber-600")} />
          <span className="text-xs font-semibold text-slate-600 font-mono">{trip.pnr ?? trip.booking_ref}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={trip.status as any} />
          {days > 0 && days <= 30 && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {days === 1 ? "Tomorrow" : `In ${days} days`}
            </span>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{trip.origin}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[80px]">{trip.origin_name ?? trip.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-slate-200" />
              <PlaneTakeoff className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            {trip.airline && <p className="text-[10px] text-slate-400 font-medium">{trip.airline} {trip.flight_number}</p>}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{trip.destination}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[80px]">{trip.destination_name ?? trip.destination}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {fmtDate(trip.travel_date)}
            {trip.departure_time && <span>· {fmtTime(trip.departure_time)}</span>}
          </div>
          <div className="flex gap-2">
            {trip.ticket_url && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <Download className="h-3 w-3" /> Ticket
              </button>
            )}
            <Link href={`/my/bookings/${trip.id}`} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useCustomerStats();
  const { data: upcoming, isLoading: tripsLoading } = useUpcomingTrips();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const STAT_CARDS = [
    { label: "Total Bookings",  value: stats?.total_bookings ?? 0,   suffix: "",  icon: CalendarCheck, color: "text-blue-600   bg-blue-50" },
    { label: "Upcoming Trips",  value: stats?.upcoming_trips ?? 0,   suffix: "",  icon: PlaneTakeoff,  color: "text-emerald-600 bg-emerald-50" },
    { label: "Wallet Balance",  value: stats?.wallet_balance ?? 0, prefix: "₹", icon: Wallet, color: "text-violet-600 bg-violet-50", format: "currency" },
    { label: "Total Spent",     value: stats?.total_spent ?? 0,    prefix: "₹", icon: ArrowRight, color: "text-amber-600  bg-amber-50",  format: "currency" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">{greeting},</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.name?.split(" ")[0] ?? "Traveller"} ✈️</h1>
            <p className="text-white/60 text-sm mt-1">
              {stats?.upcoming_trips
                ? `You have ${stats.upcoming_trips} upcoming trip${stats.upcoming_trips > 1 ? "s" : ""}.`
                : "Ready for your next adventure?"}
            </p>
          </div>
          <Link href="/my/search">
            <Button className="bg-white text-primary hover:bg-slate-100 font-semibold gap-2 shrink-0" size="lg">
              <Search className="h-4.5 w-4.5" />
              Search Flights
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, prefix, suffix, icon: Icon, color, format }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {prefix}{format === "currency" ? Number(value).toLocaleString("en-IN") : value}{suffix}
                  </p>
                </div>
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Upcoming Trips</h2>
          <Link href="/my/bookings" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            All bookings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {tripsLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : !upcoming || upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <PlaneTakeoff className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No upcoming trips</p>
            <p className="text-xs text-slate-400 mb-4">Book a flight and your trip will appear here.</p>
            <Link href="/my/search">
              <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" />Find Flights</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map((t) => <UpcomingCard key={t.id} trip={t} />)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Search Flights", href: "/my/search",   icon: Search,        desc: "Find the best deals",       bg: "bg-primary text-white" },
            { label: "My Bookings",    href: "/my/bookings",  icon: CalendarCheck, desc: "View & manage bookings",    bg: "bg-white border border-slate-200 text-slate-700" },
            { label: "My Wallet",      href: "/my/wallet",    icon: Wallet,        desc: "Balance & top-up",          bg: "bg-white border border-slate-200 text-slate-700" },
            { label: "My Profile",     href: "/my/profile",   icon: Search,        desc: "Edit your details",         bg: "bg-white border border-slate-200 text-slate-700" },
          ].map(({ label, href, icon: Icon, desc, bg }) => (
            <Link
              key={href}
              href={href}
              className={cn("rounded-2xl p-4 flex flex-col gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all motion-reduce:transition-none duration-300 ease-in-out", bg)}
            >
              <Icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className={cn("text-xs mt-0.5", bg.includes("primary") ? "text-white/70" : "text-slate-400")}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
