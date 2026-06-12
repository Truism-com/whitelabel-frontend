"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Plane, Search, CalendarCheck, Wallet, User,
  LogOut, Menu, X, ChevronDown, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCustomerWallet } from "@/lib/hooks/use-customer";

const NAV_LINKS = [
  { label: "Search Flights", href: "/my/search",   icon: Search },
  { label: "My Bookings",    href: "/my/bookings",  icon: CalendarCheck },
  { label: "Wallet",         href: "/my/wallet",    icon: Wallet },
];

function WalletBalance() {
  const { data } = useCustomerWallet();
  if (!data) return null;
  return (
    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
      ₹{data.balance.toLocaleString("en-IN")}
    </span>
  );
}

export function CustomerNavbar() {
  const pathname   = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/my/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="h-4 w-4 text-white -rotate-45" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:block">FlightDesk</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const active = href === "/my/bookings"
                ? pathname.startsWith("/my/bookings")
                : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {href === "/my/wallet" && <WalletBalance />}
                </Link>
              );
            })}
          </nav>

          {/* Right: notifications + profile */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user?.name?.split(" ")[0] ?? "Me"}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                    <Link
                      href="/my/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden ml-auto p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = href === "/my/bookings"
              ? pathname.startsWith("/my/bookings")
              : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <div className="h-px bg-slate-100 my-1" />
          <Link
            href="/my/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <User className="h-4 w-4" /> My Profile
          </Link>
          <button
            onClick={() => { setMenuOpen(false); logout(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}
