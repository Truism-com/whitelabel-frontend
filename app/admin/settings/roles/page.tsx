"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const ROLES = [
  {
    name: "Super Admin",
    slug: "superadmin",
    description: "Full platform access — owns the FlightDesk product.",
    permissions: ["All permissions"],
    variant: "destructive" as const,
  },
  {
    name: "Admin (Tenant)",
    slug: "admin",
    description: "White-label site owner. Manages their agents, website, pricing and content.",
    permissions: ["Manage agents", "Manage bookings", "Pricing rules", "CMS", "Branding", "Wallet topups"],
    variant: "default" as const,
  },
  {
    name: "Agent",
    slug: "agent",
    description: "Books flights on behalf of customers, earns commission.",
    permissions: ["Search & book flights", "View own bookings", "View wallet balance", "Manage customers"],
    variant: "secondary" as const,
  },
  {
    name: "Customer",
    slug: "customer",
    description: "End user who searches and books flights directly.",
    permissions: ["Search flights", "Book flights", "View own bookings", "Manage profile"],
    variant: "outline" as const,
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Roles & Access</h2>
        <p className="text-xs text-slate-400 mt-0.5">Overview of user roles and their permissions in the platform</p>
      </div>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <Card key={role.slug}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{role.name}</span>
                    <Badge variant={role.variant} className="text-[10px]">{role.slug}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <span key={p} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-slate-400 italic px-1">
        Custom role editing is planned for a future release. Currently roles are platform-defined.
      </p>
    </div>
  );
}
