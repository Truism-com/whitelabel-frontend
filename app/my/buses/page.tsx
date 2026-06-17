"use client";

import Link from "next/link";
import { Bus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerBusesPage() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-pulse h-20 w-20 rounded-full bg-primary/10" />
        <div className="relative h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Bus className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bus Booking Integration</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          We are currently integrating with local and national transit operators to provide you with hassle-free bus booking services.
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-sm text-left space-y-3">
        <p className="font-semibold text-slate-800">What to expect:</p>
        <ul className="space-y-2 text-slate-600 list-disc pl-4">
          <li>Extensive network coverage across key routes</li>
          <li>Live seat selection layout</li>
          <li>Real-time tracking features</li>
          <li>Secure wallet checkout payments</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="/my/dashboard">
          <Button className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
