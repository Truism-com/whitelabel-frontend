"use client";

import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
}

function getBreadcrumb(pathname: string): { label: string; path: string }[] {
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const crumbs: { label: string; path: string }[] = [{ label: "Admin", path: "/admin/dashboard" }];
  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    bookings: "Bookings",
    agents: "Agents",
    customers: "Customers",
    wallet: "Wallet & Topups",
    pricing: "Pricing",
    "markup-rules": "Markup Rules",
    discounts: "Discount Codes",
    fees: "Convenience Fees",
    cms: "Content",
    sliders: "Sliders & Banners",
    offers: "Offers & Coupons",
    blog: "Blog Posts",
    pages: "Static Pages",
    website: "My Website",
    branding: "Branding",
    templates: "Templates",
    settings: "Settings",
    company: "Company Profile",
    roles: "Roles & Access",
    staff: "Staff Members",
    system: "System",
  };
  let accumulated = "/admin";
  for (const seg of segments) {
    accumulated += `/${seg}`;
    crumbs.push({ label: labelMap[seg] ?? seg, path: accumulated });
  }
  return crumbs;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const crumbs = getBreadcrumb(pathname);
  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title + breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 truncate">{pageTitle}</h1>
        {crumbs.length > 2 && (
          <nav className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span className={i === crumbs.length - 1 ? "text-slate-600 font-medium" : ""}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="h-7 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-2 pl-1">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700 truncate max-w-[120px]">
            {user?.name ?? "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
