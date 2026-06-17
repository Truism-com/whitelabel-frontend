"use client";

import Link from "next/link";
import { Hotel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentHotelsPage() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-pulse h-20 w-20 rounded-full bg-primary/10" />
        <div className="relative h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Hotel className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Agent Hotel Portal</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          We are currently integrating with premium accommodation suppliers. Soon you will be able to book stays and earn commission on every reservation.
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-sm text-left space-y-3">
        <p className="font-semibold text-slate-800">What to expect:</p>
        <ul className="space-y-2 text-slate-600 list-disc pl-4">
          <li>Commission-earning hotel options</li>
          <li>Over 500,000 properties worldwide</li>
          <li>Dynamic pricing for clients</li>
          <li>Detailed agent reservation reporting</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="/agent/dashboard">
          <Button className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
