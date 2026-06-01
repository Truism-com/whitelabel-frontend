"use client";

import { useState } from "react";
import { SITE_TEMPLATES } from "@/lib/constants/templates";
import { useCompanyProfile, useUpdateBranding } from "@/lib/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export default function TemplatesPage() {
  const { data: profile } = useCompanyProfile();
  const update = useUpdateBranding();
  const [applying, setApplying] = useState<string | null>(null);

  const currentPrimary = profile?.branding?.primaryColor;

  const handleApply = (t: typeof SITE_TEMPLATES[0]) => {
    setApplying(t.id);
    update.mutate(
      { primaryColor: t.primaryColor, secondaryColor: t.secondaryColor, accentColor: t.accentColor },
      {
        onSuccess: () => { toast.success(`"${t.name}" template applied!`); setApplying(null); },
        onError:   () => setApplying(null),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Templates</h2>
        <p className="text-xs text-slate-400 mt-0.5">Choose a colour preset for your booking site</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SITE_TEMPLATES.map((t) => {
          const isActive = currentPrimary === t.primaryColor;
          return (
            <Card
              key={t.id}
              className={cn(
                "overflow-hidden transition-all duration-200 cursor-pointer group",
                isActive && "ring-2 ring-primary ring-offset-1"
              )}
            >
              {/* Colour preview */}
              <div className="h-28 relative" style={{ backgroundColor: t.secondaryColor }}>
                {/* Simulated nav bar */}
                <div className="absolute top-3 left-3 right-3 h-6 rounded-lg flex items-center px-2 gap-1.5" style={{ backgroundColor: `${t.primaryColor}30` }}>
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: t.primaryColor }} />
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: `${t.primaryColor}40` }} />
                  <div className="h-4 px-2 rounded-md flex items-center" style={{ backgroundColor: t.primaryColor }}>
                    <div className="h-1.5 w-6 bg-white/70 rounded" />
                  </div>
                </div>
                {/* Simulated hero */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="h-2 w-3/4 rounded mb-1.5" style={{ backgroundColor: `${t.accentColor}80` }} />
                  <div className="h-1.5 w-1/2 rounded" style={{ backgroundColor: `${t.primaryColor}50` }} />
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{t.category}</Badge>
                </div>

                {/* Colour swatches */}
                <div className="flex items-center gap-1.5 mt-3">
                  {[t.primaryColor, t.secondaryColor, t.accentColor].map((c) => (
                    <div key={c} className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>

                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className="w-full mt-3 text-xs"
                  onClick={() => handleApply(t)}
                  isLoading={applying === t.id}
                  disabled={isActive || update.isPending}
                >
                  {isActive ? "Applied" : "Apply Template"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
