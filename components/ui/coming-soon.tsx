"use client";

import { useRouter } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import type { UserRole } from "@/lib/types/auth.types";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "Coming Soon",
  description = "We are currently building this feature. It will be available in a future update.",
}: ComingSoonProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleBackToDashboard = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const destination =
      {
        superadmin: "/superadmin/dashboard",
        admin: "/admin/dashboard",
        agent: "/agent/dashboard",
        customer: "/my/dashboard",
      }[user.role as UserRole] || "/";
    router.push(destination);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-950/30 border border-slate-800 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 shadow-inner border border-slate-700/50">
            <Clock className="h-8 w-8 text-indigo-400 animate-pulse" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-white">
            {title}
          </h2>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {description}
          </p>

          <Button
            onClick={handleBackToDashboard}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-lg shadow-white/5 transition-all duration-300 h-12 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
