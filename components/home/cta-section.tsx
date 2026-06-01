import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Deep ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6 text-balance">
          Ready to rewrite the rules of travel?
        </h2>
        <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto tracking-tight">
          Join leading agencies and developers building the next generation of booking platforms. Go live today.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-medium text-slate-900 hover:bg-slate-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Start building for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/contact"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-transparent border border-white/20 px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}