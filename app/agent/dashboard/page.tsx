"use client";

import Link from "next/link";
import {
  PlaneTakeoff, CalendarCheck, Wallet, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, XCircle, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentStats, useAgentBookings } from "@/lib/hooks/use-agent";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import type { BookingStatus } from "@/lib/types/agent.types";

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: React.ElementType }> = {
  confirmed:  { label: "Confirmed",  variant: "success",     icon: CheckCircle2 },
  pending:    { label: "Pending",    variant: "warning",     icon: Clock },
  processing: { label: "Processing", variant: "warning",     icon: Clock },
  cancelled:  { label: "Cancelled",  variant: "destructive", icon: XCircle },
  refunded:   { label: "Refunded",   variant: "secondary",   icon: ArrowUpRight },
  failed:     { label: "Failed",     variant: "destructive", icon: XCircle },
};

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType;
  color: "blue" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet:  "bg-violet-50 text-violet-600",
    amber:   "bg-amber-50 text-amber-600",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", colors[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAgentStats();
  const { data: bookingsData, isLoading: bookingsLoading } = useAgentBookings({ page: 1, size: 6 });

  const recentBookings = bookingsData?.results ?? [];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            {greeting}, {user?.name?.split(" ")[0] ?? "Agent"} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your bookings today.</p>
        </div>
        <Link href="/agent/bookings/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Bookings"
            value={String(stats?.total_bookings ?? 0)}
            sub={`${stats?.confirmed_bookings ?? 0} confirmed`}
            icon={CalendarCheck}
            color="blue"
          />
          <StatCard
            label="Wallet Balance"
            value={`₹${((stats?.wallet_balance ?? 0) / 100).toLocaleString("en-IN")}`}
            sub={stats?.credit_limit ? `Credit: ₹${(stats.credit_limit / 100).toLocaleString("en-IN")}` : undefined}
            icon={Wallet}
            color="emerald"
          />
          <StatCard
            label="Revenue MTD"
            value={`₹${((stats?.revenue_mtd ?? 0) / 100).toLocaleString("en-IN")}`}
            sub="This month"
            icon={TrendingUp}
            color="violet"
          />
          <StatCard
            label="Commission MTD"
            value={`₹${((stats?.commission_mtd ?? 0) / 100).toLocaleString("en-IN")}`}
            sub={`${stats?.pending_bookings ?? 0} pending`}
            icon={PlaneTakeoff}
            color="amber"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Search Flights", href: "/agent/bookings/new", icon: PlaneTakeoff, color: "bg-primary text-white" },
          { label: "My Bookings",    href: "/agent/bookings",       icon: CalendarCheck, color: "bg-white text-slate-700 border border-slate-200" },
          { label: "Top-up Wallet",  href: "/agent/wallet",         icon: Wallet,        color: "bg-white text-slate-700 border border-slate-200" },
          { label: "Transactions",   href: "/agent/transactions",   icon: TrendingUp,    color: "bg-white text-slate-700 border border-slate-200" },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className={cn("flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center font-medium text-sm transition-all hover:shadow-sm", color)}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">Recent Bookings</CardTitle>
          <Link href="/agent/bookings" className="text-xs text-primary hover:underline font-medium">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Ref / PNR", "Route", "Passenger", "Date", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookingsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <PlaneTakeoff className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                      No bookings yet.{" "}
                      <Link href="/agent/bookings/new" className="text-primary hover:underline">Book your first flight</Link>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => {
                    const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5">
                          <p className="font-mono font-semibold text-slate-800 text-xs">{b.pnr ?? b.booking_ref}</p>
                          {b.pnr && <p className="text-[10px] text-slate-400 font-mono">{b.booking_ref}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{b.origin} → {b.destination}</p>
                          {b.airline && <p className="text-xs text-slate-400">{b.airline} {b.flight_number}</p>}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{b.client_name ?? b.passenger_names?.[0] ?? "—"}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          ₹{(b.total_amount / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 last:pr-5">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
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
    </div>
  );
}
