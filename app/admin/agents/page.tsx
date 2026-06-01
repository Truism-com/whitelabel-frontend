"use client";

import { useState } from "react";
import { useAdminUsers, useApproveAgent, useUpdateUserStatus } from "@/lib/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Search, CheckCircle2, Ban, Eye, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AdminUser } from "@/lib/types/admin.types";

function AgentRow({
  agent,
  onView,
}: {
  agent: AdminUser;
  onView: (a: AdminUser) => void;
}) {
  const approve = useApproveAgent();
  const updateStatus = useUpdateUserStatus();

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 first:pl-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {agent.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 text-sm truncate">{agent.name}</p>
            <p className="text-xs text-slate-400 truncate">{agent.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">{agent.company_name ?? "—"}</td>
      <td className="py-3 px-4 text-sm text-slate-500">{agent.phone ?? "—"}</td>
      <td className="py-3 px-4">
        {agent.is_approved ? (
          <Badge variant="success">Approved</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        )}
      </td>
      <td className="py-3 px-4">
        <Badge variant={agent.is_active ? "success" : "secondary"}>
          {agent.is_active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400">
        {new Date(agent.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td className="py-3 px-4 last:pr-5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(agent)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {!agent.is_approved && (
            <button
              onClick={() => approve.mutate(agent.id)}
              disabled={approve.isPending}
              className="p-1.5 rounded-md text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
              title="Approve agent"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => updateStatus.mutate({ userId: agent.id, is_active: !agent.is_active })}
            disabled={updateStatus.isPending}
            className={cn(
              "p-1.5 rounded-md transition-colors disabled:opacity-50",
              agent.is_active
                ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                : "text-green-500 hover:text-green-700 hover:bg-green-50"
            )}
            title={agent.is_active ? "Deactivate" : "Activate"}
          >
            {agent.is_active ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AdminUser | null>(null);
  const { data, isLoading } = useAdminUsers({ role: "agent" });

  const agents = (data?.results ?? []).filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Agents</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage travel agents and their access</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Agent", "Company", "Phone", "Approval", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-12 text-sm">
                      {search ? "No agents match your search." : "No agents found."}
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} onView={setSelectedAgent} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent detail modal */}
      <Dialog open={!!selectedAgent} onClose={() => setSelectedAgent(null)} size="md">
        {selectedAgent && (
          <>
            <DialogHeader onClose={() => setSelectedAgent(null)}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {selectedAgent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedAgent.name}</h3>
                  <p className="text-sm text-slate-400">{selectedAgent.email}</p>
                </div>
              </div>
            </DialogHeader>
            <DialogBody>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { label: "Company",   value: selectedAgent.company_name ?? "—" },
                  { label: "Phone",     value: selectedAgent.phone ?? "—" },
                  { label: "PAN",       value: selectedAgent.pan_number ?? "—" },
                  { label: "Role",      value: selectedAgent.role },
                  { label: "Approved",  value: selectedAgent.is_approved ? "Yes" : "No" },
                  { label: "Active",    value: selectedAgent.is_active ? "Yes" : "No" },
                  { label: "Joined",    value: new Date(selectedAgent.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
                    <dd className="mt-1 text-sm text-slate-800 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedAgent(null)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
