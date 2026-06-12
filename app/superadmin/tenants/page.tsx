"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { superadminApi } from "@/lib/api/superadmin";
import { formatDate, formatINR } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody } from "@/components/ui/dialog";
import { Building2, ShieldAlert, ArrowRight, Eye, Calendar, Users, CalendarCheck, TrendingUp } from "lucide-react";

export default function TenantsPage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const { data: tenants, isLoading: tenantsLoading, error: tenantsError } = useQuery({
    queryKey: ["superadmin-tenants"],
    queryFn: superadminApi.getTenants,
  });

  const { data: tenantStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["superadmin-tenant-stats", selectedTenantId],
    queryFn: () => superadminApi.getTenantStats(selectedTenantId!),
    enabled: !!selectedTenantId,
  });

  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-950">Tenant Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure and monitor white-label tenant sites</p>
      </div>

      {tenantsError ? (
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              Failed to load tenants. Please make sure the backend services are running.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tenantsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (tenants ?? []).length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent className="flex flex-col items-center max-w-sm mx-auto space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">No Tenants Available</p>
            <p className="text-xs text-slate-400">There are no tenant sites registered on this platform yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tenants ?? []).map((tenant) => (
            <Card key={tenant.id} className="hover:border-slate-300 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">{tenant.name}</CardTitle>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">slug: {tenant.slug}</p>
                  </div>
                  <Badge variant={tenant.is_active ? "success" : "secondary"}>
                    {tenant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {formatDate(tenant.created_at)}</span>
                </div>
                <Button
                  className="w-full gap-2 text-xs"
                  variant="outline"
                  onClick={() => setSelectedTenantId(tenant.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Tenant Stats
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tenant statistics dialog */}
      <Dialog open={!!selectedTenantId} onClose={() => setSelectedTenantId(null)} size="sm">
        <DialogHeader title={selectedTenant?.name ?? "Tenant Stats"} onClose={() => setSelectedTenantId(null)} />
        <DialogBody>
          {statsError ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Failed to load statistics for this tenant.
            </div>
          ) : statsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Total Users</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{tenantStats?.total_users ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Total Bookings</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{tenantStats?.total_bookings ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Total Revenue</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatINR(tenantStats?.total_revenue ?? 0)}
                </span>
              </div>
            </div>
          )}
        </DialogBody>
      </Dialog>
    </div>
  );
}
