"use client";

import { useQuery } from "@tanstack/react-query";
import { superadminApi } from "@/lib/api/superadmin";
import { formatINR } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, CalendarCheck, TrendingUp, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
    green: { bg: "bg-green-50", icon: "text-green-600", ring: "ring-green-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
  };
  const c = colorMap[color];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>}
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

export default function SuperadminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: superadminApi.getStats,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-950">Platform Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time statistics across all tenants and users</p>
      </div>

      {error ? (
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              Failed to load platform stats. Please make sure the backend services are running.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Tenants"
              value={stats?.total_tenants ?? 0}
              subtitle="Registered white labels"
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Active Tenants"
              value={stats?.active_tenants ?? 0}
              subtitle="Currently serving users"
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? 0}
              subtitle="All registered roles"
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Total Bookings"
              value={stats?.total_bookings ?? 0}
              subtitle="Across all tenants"
              icon={CalendarCheck}
              color="blue"
            />
            <StatCard
              title="Platform Revenue"
              value={formatINR(stats?.total_revenue ?? 0)}
              subtitle="Gross booking volume"
              icon={TrendingUp}
              color="amber"
            />
          </>
        )}
      </div>
    </div>
  );
}
