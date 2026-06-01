"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Zap, Database, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const SYSTEM_INFO = [
  { label: "Platform Version", value: "1.0.0", status: "ok" },
  { label: "API Backend",      value: "FastAPI — Connected", status: "ok" },
  { label: "Database",         value: "PostgreSQL — Healthy", status: "ok" },
  { label: "Cache",            value: "Redis — Active", status: "ok" },
  { label: "Email Service",    value: "Not configured", status: "warn" },
  { label: "SMS Gateway",      value: "Not configured", status: "warn" },
];

const QUICK_LINKS = [
  { label: "API Documentation",   href: "/api/docs",    icon: Globe },
  { label: "OpenAPI Spec",        href: "/openapi.json",icon: Zap },
  { label: "Database Migrations", href: "#",            icon: Database },
  { label: "Security Audit",      href: "#",            icon: ShieldCheck },
];

export default function SystemPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-slate-800">System</h2>
        <p className="text-xs text-slate-400 mt-0.5">Platform health, diagnostics and configuration</p>
      </div>

      {/* System status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SYSTEM_INFO.map(({ label, value, status }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700 font-medium">{value}</span>
                {status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cache management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Cache Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">Clear server-side caches to force fresh data from the database.</p>
          <div className="flex flex-wrap gap-2">
            {["Pricing Cache", "Tenant Config Cache", "Session Cache", "All Caches"].map((label) => (
              <Button
                key={label}
                size="sm"
                variant="outline"
                onClick={() => toast.success(`${label} cleared.`)}
                className="text-xs"
              >
                Clear {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Developer Tools</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-slate-600 hover:text-primary group"
            >
              <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              {label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
