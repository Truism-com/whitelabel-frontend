"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCompanyProfile, useUpdateBranding } from "@/lib/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Eye } from "lucide-react";

const schema = z.object({
  primaryColor:   z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex colour"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex colour"),
  accentColor:    z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex colour"),
  fontFamily:     z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function BrandingPage() {
  const { data: profile, isLoading } = useCompanyProfile();
  const update = useUpdateBranding();

  const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryColor:   "#2563eb",
      secondaryColor: "#0f172a",
      accentColor:    "#3b82f6",
      fontFamily:     "Inter",
    },
  });

  useEffect(() => {
    if (profile?.branding) {
      reset({
        primaryColor:   profile.branding.primaryColor   ?? "#2563eb",
        secondaryColor: profile.branding.secondaryColor ?? "#0f172a",
        accentColor:    profile.branding.accentColor    ?? "#3b82f6",
        fontFamily:     profile.branding.fontFamily     ?? "Inter",
      });
    }
  }, [profile, reset]);

  const [primary, secondary, accent] = watch(["primaryColor", "secondaryColor", "accentColor"]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Branding</h2>
        <p className="text-xs text-slate-400 mt-0.5">Customise the colours and fonts of your booking site</p>
      </div>

      {/* Live preview strip */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div
          className="h-12 flex items-center px-4 gap-3"
          style={{ backgroundColor: secondary }}
        >
          <div className="h-6 w-6 rounded" style={{ backgroundColor: primary }} />
          <div className="h-3 w-24 rounded" style={{ backgroundColor: `${primary}80` }} />
          <div className="ml-auto h-7 px-3 rounded text-xs font-medium flex items-center text-white" style={{ backgroundColor: primary }}>
            Book Now
          </div>
        </div>
        <div className="h-20 flex items-center gap-3 px-4 bg-white border-b border-slate-100">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}15` }}>
            <Eye className="h-5 w-5" style={{ color: primary }} />
          </div>
          <div>
            <div className="h-3 w-32 rounded bg-slate-800 mb-1.5" />
            <div className="h-2 w-20 rounded bg-slate-300" />
          </div>
          <div className="ml-auto h-8 px-4 rounded-lg text-white text-xs font-medium flex items-center" style={{ backgroundColor: accent }}>
            Explore
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 flex items-center gap-1.5">
          <Palette className="h-3 w-3" />
          Live preview
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Colour Scheme</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit((v) => update.mutate(v))} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "primaryColor" as const, label: "Primary Colour", hint: "Used for buttons and highlights" },
                  { name: "secondaryColor" as const, label: "Secondary Colour", hint: "Used for header backgrounds" },
                  { name: "accentColor" as const, label: "Accent Colour", hint: "Used for CTA elements" },
                ].map(({ name, label, hint }) => (
                  <FormField key={name} label={label} error={errors[name]?.message} hint={hint}>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        {...register(name)}
                        className="h-9 w-10 p-0.5 rounded-md border border-slate-200 cursor-pointer bg-white"
                      />
                      <Input {...register(name)} placeholder="#000000" className="font-mono uppercase text-sm" />
                    </div>
                  </FormField>
                ))}
              </div>

              <FormField label="Font Family" hint="Google Font name (e.g. Inter, Poppins, Raleway)">
                <Input {...register("fontFamily")} placeholder="Inter" />
              </FormField>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" isLoading={update.isPending} disabled={!isDirty}>
                  Save Branding
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
