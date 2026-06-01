import { Plane, Globe2, Zap, Shield, Star, Hotel, Bus } from "lucide-react";

const PRODUCTS = [
  { icon: Plane,  label: "Flights" },
  { icon: Hotel,  label: "Hotels" },
  { icon: Bus,    label: "Buses" },
  { icon: Globe2, label: "Holidays" },
  { icon: Shield, label: "Visa" },
  { icon: Zap,    label: "Transfers" },
  { icon: Star,   label: "Activities" },
];

export function ProductsBar() {
  return (
    <section className="py-20 bg-transparent">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-px flex-1 bg-slate-200" />
          <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest">
            Unified API Ecosystem
          </p>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
          {PRODUCTS.map((p) => (
            <div 
              key={p.label} 
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-default"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <p.icon className="h-5 w-5" />
              </div>
              <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}