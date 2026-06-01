import Link from "next/link";
import { Plane, CheckCircle2, Star } from "lucide-react";

interface AuthPanelProps {
  title: string;
  subtitle: string;
  features: string[];
  testimonial?: { quote: string; name: string; role: string };
}

export function AuthPanel({ title, subtitle, features, testimonial }: AuthPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[50%] relative bg-[#0A0A0A] flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
      
      {/* Deep ambient glow & Tech Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 group w-fit">
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center transition-transform group-hover:rotate-12 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <Plane className="h-4 w-4 text-slate-900 -rotate-45" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">TravelOS</span>
      </Link>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center mt-16 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter text-balance leading-[1.1]">
          {title}
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md tracking-tight">
          {subtitle}
        </p>
        <ul className="space-y-4">
          {features.map((f, index) => (
            <li 
              key={f} 
              className="flex items-center gap-4 text-slate-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial Card */}
      {testimonial && (
        <div className="relative z-10 mt-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 relative overflow-hidden hover:bg-white/[0.04] transition-colors duration-500">
            {/* Left border accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-80" />
            
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-blue-500 text-blue-500" />
              ))}
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              {/* Dynamic Monogram Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-900 flex items-center justify-center text-white text-xs font-bold border border-white/20 shrink-0 shadow-inner">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-tight">{testimonial.name}</p>
                <p className="text-slate-500 text-xs font-medium">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}