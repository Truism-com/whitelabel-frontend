import Link from "next/link";
import { 
  ArrowRight, 
  Terminal, 
  Plane, 
  Activity, 
  Users, 
  CheckCircle2, 
  CreditCard,
  Shield
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-[#FAFAFA]">
      {/* Subtle futuristic glow behind text */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 mt-15 text-center">
       {/* <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          White-label platform is live
        </div> */}

        <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tighter text-balance leading-[0.95] mb-8">
          Launch your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
            travel empire.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed tracking-tight text-balance">
          Get a fully branded flight booking website with global inventory, markup controls, and an integrated agent network. Go live in minutes, not months.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white hover:bg-slate-800 transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/docs" 
            className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Terminal className="h-4 w-4" />
            Explore API Docs
          </Link>
        </div>
      </div>

      {/* Populated Minimalist Dashboard Mockup */}
      <div className="relative mt-24 w-full max-w-5xl px-6 mx-auto perspective-1000">
        <div className="rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-xl p-2 shadow-2xl transform rotate-x-12 scale-105 transition-transform duration-700 hover:rotate-x-0 hover:scale-100">
          <div className="h-[28rem] w-full rounded-xl bg-white border border-slate-100 overflow-hidden relative flex flex-col shadow-inner">
             
             {/* Browser Window Header */}
             <div className="h-12 border-b border-slate-100 bg-slate-50/50 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 max-w-md mx-4 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Shield className="h-3 w-3" /> dashboard.travelos.com
                  </span>
                </div>
                <div className="h-6 w-6 rounded-full bg-slate-200" />
             </div>

             {/* App Body Layout */}
             <div className="flex-1 flex overflow-hidden">
                
                {/* Sidebar Menu */}
                <div className="w-48 border-r border-slate-100 bg-slate-50/30 p-4 flex flex-col gap-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Overview</div>
                  {[
                    { icon: Activity, label: "Dashboard", active: true },
                    { icon: Plane, label: "Flight Operations" },
                    { icon: Users, label: "Agent Network" },
                    { icon: CreditCard, label: "Commissions" },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                  
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Daily Revenue", value: "$24,500", trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Active Bookings", value: "842", trend: "+5.2%", color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "API Latency (avg)", value: "124ms", trend: "-2ms", color: "text-slate-600", bg: "bg-slate-100" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-slate-100 p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{stat.label}</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                          <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                            {stat.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Graph & Table Split Area */}
                  <div className="flex gap-4 flex-1">
                    
                    {/* Live Activity Feed */}
                    <div className="flex-1 rounded-xl border border-slate-100 p-4 flex flex-col shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                      <div className="text-xs font-semibold text-slate-900 mb-4">Live Flight Bookings</div>
                      <div className="flex flex-col gap-3">
                        {[
                          { route: "LHR → JFK", airline: "British Airways", price: "$840.00", status: "Confirmed" },
                          { route: "DXB → BOM", airline: "Emirates", price: "$320.50", status: "Confirmed" },
                          { route: "SFO → NRT", airline: "United", price: "$1,150.00", status: "Processing" },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Plane className="h-3.5 w-3.5 text-slate-400 -rotate-45" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-900">{row.route}</div>
                                <div className="text-[10px] text-slate-500">{row.airline}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-900">{row.price}</div>
                              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
                                {row.status === "Confirmed" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                {row.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* API System Status */}
                    <div className="w-1/3 rounded-xl bg-slate-900 p-4 flex flex-col shadow-lg">
                      <div className="text-xs font-semibold text-white mb-4 flex items-center justify-between">
                        API Status
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                      
                      {/* Fake terminal code */}
                      <div className="font-mono text-[8px] text-slate-400 leading-relaxed flex-1">
                        <div className="text-emerald-400">{">"} Status: Operational</div>
                        <div>{">"} Connected to 3 GDS nodes</div>
                        <div className="mt-2 text-slate-500">
                          [14:23:01] POST /v2/flights/search<br/>
                          [14:23:01] 200 OK (112ms)<br/>
                          [14:23:04] GET /v2/wallet/balance<br/>
                          [14:23:04] 200 OK (45ms)<br/>
                          [14:23:09] POST /v2/booking/create<br/>
                          <span className="text-blue-400">[14:23:10] Ticket Issued PNR:X7B92</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </section>
  );
}