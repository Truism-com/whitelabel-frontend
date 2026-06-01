import Link from "next/link";
import { Plane, ChevronRight } from "lucide-react";

export function Navbar() {
  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
      <header className="w-full max-w-5xl rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-3 flex items-center justify-between transition-all duration-300">
        
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center transition-transform group-hover:rotate-12">
            <Plane className="h-4 w-4 text-white -rotate-45" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">FlightDesk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <Link href="#features" className="hover:text-slate-900 transition-colors">Platform</Link>
          <Link href="#apis" className="hover:text-slate-900 transition-colors">Developers</Link>
          <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link 
            href="/register" 
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(15,23,42,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start building <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </header>
    </div>
  );
}