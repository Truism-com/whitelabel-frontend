import Link from "next/link";
import { Plane } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] pt-20 pb-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
                <Plane className="h-4 w-4 text-slate-900 -rotate-45" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Whitelabel</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              The uncompromising toolkit for modern travel agencies and developers. Build, scale, and manage global inventory.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-tight">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">White-Label Sites</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Agent Network</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Markup Engine</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-tight">Developers</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">API Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">SDKs & Libraries</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-tight">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} TravelOS Technologies. All rights reserved.
          </p>
          
          {/* Trust Indicator */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}