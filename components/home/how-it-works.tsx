import { Badge } from "@/components/ui/badge";

const STEPS = [
  { step: "01", title: "Sign up as SuperAdmin", description: "Create your platform account. You get the master dashboard to manage all tenants, APIs, and global settings." },
  { step: "02", title: "Onboard your first Business", description: "Create a tenant account for a travel agency. Give them their own subdomain, logo, and branding in minutes." },
  { step: "03", title: "Business customizes & launches", description: "The Admin configures markup rules, assigns agents, sets up their CMS, and goes live — without any code." },
  { step: "04", title: "Customers book, agents earn", description: "Customers search and book flights on the branded site. Agents earn commissions tracked in real-time wallets." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="text-4xl font-bold text-slate-900">
            From zero to live in four steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-slate-200 -translate-x-6 z-0" />
              )}
              <div className="relative z-10 bg-white rounded-xl border border-slate-200 p-6 h-full">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
