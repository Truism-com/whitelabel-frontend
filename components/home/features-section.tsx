import { Globe2, Zap, Settings2, Shield, Users, BarChart3 } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter mb-4">
            Engineered for scale.
          </h2>
          <p className="text-xl text-slate-500 tracking-tight max-w-2xl">
            Everything you need to run a global travel operation, elegantly packed into a single architecture.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          {/* Card 1: Large Span */}
          <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200 p-10 flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div>
              <Globe2 className="h-8 w-8 text-slate-400 mb-6 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Instant White-Label</h3>
              <p className="text-slate-500 max-w-md">Launch your own domain with fully customizable booking flows. No React or Tailwind knowledge required—just point, click, and deploy.</p>
            </div>
            {/* Minimalist graphic representation */}
            <div className="h-20 w-full rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-100" />
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl bg-slate-900 p-10 flex flex-col justify-between group">
            <Zap className="h-8 w-8 text-slate-500 mb-6 group-hover:text-yellow-400 transition-colors" />
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Lightning APIs</h3>
              <p className="text-slate-400 text-sm">Sub-second response times across 200+ global airlines and LCCs.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl bg-white border border-slate-200 p-10 flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <Settings2 className="h-8 w-8 text-slate-400 mb-6 group-hover:text-blue-500 transition-colors" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Dynamic Markup</h3>
              <p className="text-slate-500 text-sm">Complex pricing rules based on route, airline, or user role.</p>
            </div>
          </div>

          {/* Card 4: Large Span */}
          <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200 p-10 flex flex-col justify-between group hover:border-slate-300 transition-colors overflow-hidden relative">
            <div className="relative z-10">
              <Users className="h-8 w-8 text-slate-400 mb-6 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Agent Network Ecosystem</h3>
              <p className="text-slate-500 max-w-md">Distribute your inventory. Assign independent agents, track their commissions in real-time, and manage credit limits from a single SuperAdmin view.</p>
            </div>
            {/* Abstract background element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 border-[40px] border-slate-50 rounded-full group-hover:scale-110 transition-transform duration-700" />
          </div>

        </div>
      </div>
    </section>
  );
}