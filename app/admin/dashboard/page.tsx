"use client";

import { useAdminStats, useAdminAnalytics, useAdminBookings } from "@/lib/hooks/use-admin";
import {
  CalendarCheck, Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils/cn";

/* ── Stat card ── */
function StatCard({
  title, value, subtitle, icon: Icon, trend, trendLabel, color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorMap = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   ring: "ring-blue-100" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  ring: "ring-green-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  ring: "ring-amber-100" },
  };
  const c = colorMap[color];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>}
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", isPositive ? "text-green-600" : "text-red-500")}>
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(trend)}% {trendLabel}
              </div>
            )}
          </div>
          <div className={cn("shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ring-1", c.bg, c.ring)}>
            <Icon className={cn("h-5 w-5", c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

/* ── Booking status badge ── */
const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  confirmed:  { label: "Confirmed",  variant: "success" },
  pending:    { label: "Pending",    variant: "warning" },
  cancelled:  { label: "Cancelled", variant: "destructive" },
  processing: { label: "Processing", variant: "secondary" },
};

/* ── Page ── */
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: bookingsData, isLoading: bookingsLoading } = useAdminBookings({ page: 1, size: 8 });

  const chartData = analytics?.booking_trend ?? [];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Bookings"
              value={stats?.total_bookings?.toLocaleString() ?? "—"}
              subtitle="All time"
              icon={CalendarCheck}
              trend={12}
              trendLabel="vs last month"
              color="blue"
            />
            <StatCard
              title="Active Agents"
              value={stats?.active_agents?.toLocaleString() ?? "—"}
              subtitle={`${stats?.pending_agents ?? 0} pending approval`}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Revenue (MTD)"
              value={`₹${((stats?.revenue_mtd ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              subtitle="Month to date"
              icon={TrendingUp}
              trend={8}
              trendLabel="vs last month"
              color="green"
            />
            <StatCard
              title="Wallet Balance"
              value={`₹${((stats?.total_wallet_balance ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              subtitle="Across all agents"
              icon={Wallet}
              color="amber"
            />
          </>
        )}
      </div>

      {/* Chart + quick stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bookings trend chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Booking Trend</CardTitle>
            <p className="text-xs text-slate-400">Last 30 days</p>
          </CardHeader>
          <CardContent className="pt-0">
            {analyticsLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                    labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                  />
                  <Area type="monotone" dataKey="bookings" stroke="#2563eb" strokeWidth={2} fill="url(#bookingGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Booking Status</CardTitle>
            <p className="text-xs text-slate-400">This month</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
            ) : (
              [
                { label: "Confirmed", value: stats?.confirmed_bookings ?? 0, icon: CheckCircle2, color: "text-green-500 bg-green-50" },
                { label: "Pending",   value: stats?.pending_bookings   ?? 0, icon: Clock,         color: "text-amber-500 bg-amber-50" },
                { label: "Cancelled", value: stats?.cancelled_bookings ?? 0, icon: XCircle,       color: "text-red-500 bg-red-50" },
                { label: "Agents Pending", value: stats?.pending_agents ?? 0, icon: AlertCircle, color: "text-blue-500 bg-blue-50" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", color.split(" ")[1])}>
                      <Icon className={cn("h-4 w-4", color.split(" ")[0])} />
                    </div>
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{value.toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-700">Recent Bookings</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Latest transactions across all agents</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Booking ID", "Passenger", "Route", "Agent", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-2 px-3 first:pl-1 last:pr-1">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(bookingsData?.results ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-400 py-8 text-sm">No bookings yet</td>
                    </tr>
                  ) : (
                    (bookingsData?.results ?? []).map((b) => {
                      const statusInfo = STATUS_MAP[b.status] ?? { label: b.status, variant: "secondary" as const };
                      return (
                        <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 first:pl-1 font-mono text-xs text-slate-500">#{b.pnr ?? b.id.slice(0, 8)}</td>
                          <td className="py-3 px-3 font-medium text-slate-800">{b.passenger_name}</td>
                          <td className="py-3 px-3 text-slate-600">{b.origin} → {b.destination}</td>
                          <td className="py-3 px-3 text-slate-600">{b.agent_name ?? "—"}</td>
                          <td className="py-3 px-3 font-medium text-slate-800">₹{(b.total_amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-3"><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></td>
                          <td className="py-3 px-3 last:pr-1 text-slate-400 text-xs">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
