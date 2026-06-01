import { Building2, Users, User, ChevronRight } from "lucide-react";

const ECOSYSTEM = [
  {
    role: "Business Admin",
    icon: Building2,
    badge: "You",
    description: "Your master control center. Manage your brand, set global markups, and oversee your entire travel operation.",
    capabilities: ["Complete white-label control", "Agent commission rules", "Revenue analytics"],
  },
  {
    role: "Travel Agents",
    icon: Users,
    badge: "Your Team",
    description: "Dedicated portals for your B2B network to book on behalf of clients and track their real-time commissions.",
    capabilities: ["Live commission wallets", "Credit limit management", "Ticketing & amendments"],
  },
  {
    role: "End Customers",
    icon: User,
    badge: "Your Buyers",
    description: "A seamless, consumer-grade B2C booking interface where travelers can search and book flights directly.",
    capabilities: ["Frictionless checkout", "Personal booking history", "Automated e-tickets"],
  },
];

export function RolesSection() {
  return (
    <section id="ecosystem" className="py-32 bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 shadow-sm">
            Platform Ecosystem
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter mb-6 text-balance">
            Everything connects. <br />
            <span className="text-slate-400">Everyone is in sync.</span>
          </h2>
          <p className="text-xl text-slate-500 tracking-tight text-balance">
            Give your team and your customers the exact tools they need. One core booking engine powers three distinct, purpose-built experiences.
          </p>
        </div>

        {/* Switched to a balanced 3-column grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {ECOSYSTEM.map((item) => (
            <div 
              key={item.role} 
              className="group relative rounded-3xl bg-white border border-slate-200 p-8 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <item.icon className="h-7 w-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {item.badge}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">{item.role}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                {item.description}
              </p>
              
              <div className="pt-6 border-t border-slate-100">
                <ul className="space-y-3">
                  {item.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}