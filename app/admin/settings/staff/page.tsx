"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "@/lib/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle2, Ban, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers({ role: "staff" });
  const updateStatus = useUpdateUserStatus();

  const staff = (data?.results ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Staff Members</h2>
          <p className="text-xs text-slate-400 mt-0.5">Internal team members with admin access</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
          <Button size="sm" onClick={() => toast.info("Staff invite coming soon.")}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />Invite
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Member", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                      {search ? "No staff match your search." : "No staff members yet."}
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 first:pl-5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">{s.name}</p>
                            <p className="text-xs text-slate-400 truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600 text-xs">{s.role}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.is_active ? "success" : "secondary"}>
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 last:pr-5">
                        <button
                          onClick={() => updateStatus.mutate({ userId: s.id, is_active: !s.is_active })}
                          disabled={updateStatus.isPending}
                          className={cn(
                            "p-1.5 rounded-md transition-colors disabled:opacity-50",
                            s.is_active
                              ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          )}
                        >
                          {s.is_active ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
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
