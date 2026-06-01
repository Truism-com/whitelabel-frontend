"use client";

import { useState } from "react";
import { AgentSidebar } from "@/components/agent/layout/sidebar";
import { AgentHeader }  from "@/components/agent/layout/header";
import { AgentAuthGuard } from "@/components/agent/layout/auth-guard";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AgentAuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AgentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AgentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AgentAuthGuard>
  );
}
