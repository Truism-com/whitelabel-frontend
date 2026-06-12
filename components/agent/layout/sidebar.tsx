"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlaneTakeoff, CalendarCheck,
  Wallet, User, LogOut, Plane, History,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAgentWallet } from "@/lib/hooks/use-agent";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
  badge?: string;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard",      href: "/agent/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Flights",
    items: [
      { label: "Search & Book",  href: "/agent/bookings/new",  icon: PlaneTakeoff },
      { label: "My Bookings",    href: "/agent/bookings",       icon: CalendarCheck },
    ],
  },
  {
    section: "Finance",
    items: [
      { label: "Wallet",         href: "/agent/wallet",         icon: Wallet },
      { label: "Transactions",   href: "/agent/transactions",   icon: History },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "My Profile",     href: "/agent/profile",        icon: User },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/agent/bookings"
      ? pathname === "/agent/bookings" || (pathname.startsWith("/agent/bookings/") && !pathname.startsWith("/agent/bookings/new"))
      : pathname === item.href || (item.href !== "/agent/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
      {item.label}
      {item.badge && (
        <span className="ml-auto text-[10px] font-semibold bg-primary text-white rounded-full px-1.5 py-0.5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  isOpen:  boolean;
  onClose: () => void;
}

function WalletBadge() {
  const { data } = useAgentWallet();
  if (!data) return null;
  return (
    <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary to-indigo-600 p-4 text-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">Wallet Balance</p>
      <p className="text-xl font-bold">₹{data.balance.toLocaleString("en-IN")}</p>
      {data.credit_limit > 0 && (
        <p className="text-[11px] opacity-60 mt-0.5">
          Credit: ₹{data.credit_limit.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

export function AgentSidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Plane className="h-4 w-4 text-white -rotate-45" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight truncate">FlightDesk</p>
          <p className="text-[10px] text-slate-400 truncate">Agent Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-hide">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Wallet mini-badge */}
      <WalletBadge />

      {/* User footer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name ?? "Agent"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 inset-y-0 w-64 bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
