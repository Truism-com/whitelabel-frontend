"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "@/lib/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers({ role: "customer" });
  const updateStatus = useUpdateUserStatus();

  const customers = (data?.results ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Customers</h2>
          <p className="text-xs text-slate-400 mt-0.5">All registered customers</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Customer", "Phone", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-12 text-sm">
                      {search ? "No customers match your search." : "No customers found."}
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 first:pl-5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
                            <p className="text-xs text-slate-400 truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.phone ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={c.is_active ? "success" : "secondary"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 last:pr-5">
                        <button
                          onClick={() => updateStatus.mutate({ userId: c.id, is_active: !c.is_active })}
                          disabled={updateStatus.isPending}
                          className={cn(
                            "p-1.5 rounded-md transition-colors disabled:opacity-50",
                            c.is_active
                              ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          )}
                          title={c.is_active ? "Deactivate" : "Activate"}
                        >
                          {c.is_active ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
