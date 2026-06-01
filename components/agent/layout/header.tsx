"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

const LABEL_MAP: Record<string, string> = {
  dashboard:    "Dashboard",
  bookings:     "My Bookings",
  new:          "Search & Book",
  wallet:       "Wallet",
  transactions: "Transactions",
  profile:      "My Profile",
};

function getBreadcrumb(pathname: string) {
  const segments = pathname.replace("/agent", "").split("/").filter(Boolean);
  const crumbs = [{ label: "Agent", path: "/agent/dashboard" }];
  let acc = "/agent";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ label: LABEL_MAP[seg] ?? seg, path: acc });
  }
  return crumbs;
}

export function AgentHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user }  = useAuth();
  const crumbs    = getBreadcrumb(pathname);
  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Agent";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 truncate">{pageTitle}</h1>
        {crumbs.length > 2 && (
          <nav className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            {crumbs.map((c, i) => (
              <span key={c.path} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span className={i === crumbs.length - 1 ? "text-slate-600 font-medium" : ""}>{c.label}</span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="h-7 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-2 pl-1">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700 truncate max-w-[120px]">
            {user?.name ?? "Agent"}
          </span>
        </div>
      </div>
    </header>
  );
}
