"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, Percent, Tag,
  Image, Gift, FileText, Globe2, Palette, Settings, Building2,
  LogOut, Plane, ChevronDown, ChevronRight, TicketPercent,
  BookOpen, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";
import { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Bookings",
    items: [
      { label: "All Bookings", href: "/admin/bookings", icon: CalendarCheck },
    ],
  },
  {
    section: "People",
    items: [
      { label: "Agents", href: "/admin/agents", icon: Users },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    section: "Revenue",
    items: [
      { label: "Wallet & Topups", href: "/admin/wallet", icon: Wallet },
    ],
  },
  {
    section: "Pricing",
    items: [
      { label: "Markup Rules",       href: "/admin/pricing/markup-rules", icon: Percent },
      { label: "Discount Codes",     href: "/admin/pricing/discounts",    icon: TicketPercent },
      { label: "Convenience Fees",   href: "/admin/pricing/fees",         icon: Tag },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Sliders & Banners",  href: "/admin/cms/sliders", icon: Image },
      { label: "Offers & Coupons",   href: "/admin/cms/offers",  icon: Gift },
      { label: "Blog Posts",         href: "/admin/cms/blog",    icon: BookOpen },
      { label: "Static Pages",       href: "/admin/cms/pages",   icon: FileText },
    ],
  },
  {
    section: "My Website",
    items: [
      { label: "Branding",  href: "/admin/website/branding",   icon: Palette },
      { label: "Templates", href: "/admin/website/templates",  icon: Globe2 },
    ],
  },
  {
    section: "Settings",
    items: [
      { label: "Company Profile", href: "/admin/settings/company", icon: Building2 },
      { label: "Roles & Access",  href: "/admin/settings/roles",   icon: ShieldCheck },
      { label: "Staff Members",   href: "/admin/settings/staff",   icon: Users },
      { label: "System",          href: "/admin/settings/system",  icon: Settings },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname  = usePathname();
  const isActive  = pathname === item.href || (item.href && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href ?? "#"}
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
        <span className="ml-auto text-[10px] font-semibold bg-destructive text-white rounded-full px-1.5 py-0.5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          <p className="text-[10px] text-slate-400 truncate">{user?.company_name ?? "Admin Portal"}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name ?? "Admin"}</p>
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
      {/* Desktop sidebar */}
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
