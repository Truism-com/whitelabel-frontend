"use client";

import { CustomerAuthGuard } from "@/components/customer/layout/auth-guard";
import { CustomerNavbar }    from "@/components/customer/layout/navbar";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthGuard>
      <div className="min-h-screen bg-slate-50">
        <CustomerNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </CustomerAuthGuard>
  );
}
