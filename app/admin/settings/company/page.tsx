"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCompanyProfile, useUpdateCompanyProfile } from "@/lib/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { CompanyProfile } from "@/lib/types/admin.types";

const schema = z.object({
  name:     z.string().min(1, "Company name is required"),
  email:    z.string().email("Invalid email").optional().or(z.literal("")),
  phone:    z.string().optional(),
  website:  z.string().url("Invalid URL").optional().or(z.literal("")),
  address:  z.string().optional(),
  city:     z.string().optional(),
  state:    z.string().optional(),
  country:  z.string().optional(),
  pincode:  z.string().optional(),
  gstin:    z.string().optional(),
  pan:      z.string().optional(),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  seo_title:       z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords:    z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CompanyProfilePage() {
  const { data: profile, isLoading } = useCompanyProfile();
  const update = useUpdateCompanyProfile();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name:    profile.name ?? "",
        email:   profile.email ?? "",
        phone:   profile.phone ?? "",
        website: profile.website ?? "",
        address: profile.address ?? "",
        city:    profile.city ?? "",
        state:   profile.state ?? "",
        country: profile.country ?? "",
        pincode: profile.pincode ?? "",
        gstin:   profile.gstin ?? "",
        pan:     profile.pan ?? "",
        logo_url: profile.logo_url ?? "",
        seo_title:       profile.seo?.title ?? "",
        seo_description: profile.seo?.description ?? "",
        seo_keywords:    profile.seo?.keywords ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (v: FormValues) => {
    const payload: Partial<CompanyProfile> = {
      name:     v.name,
      email:    v.email || undefined,
      phone:    v.phone || undefined,
      website:  v.website || undefined,
      address:  v.address || undefined,
      city:     v.city || undefined,
      state:    v.state || undefined,
      country:  v.country || undefined,
      pincode:  v.pincode || undefined,
      gstin:    v.gstin || undefined,
      pan:      v.pan || undefined,
      logo_url: v.logo_url || undefined,
      seo: {
        title:       v.seo_title || undefined,
        description: v.seo_description || undefined,
        keywords:    v.seo_keywords || undefined,
      },
    };
    update.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-9 w-full" />)}
          </CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Company Profile</h2>
        <p className="text-xs text-slate-400 mt-0.5">Your business information shown on invoices and receipts</p>
      </div>

      {/* Basic info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Company Name" error={errors.name?.message} required>
            <Input {...register("name")} placeholder="Acme Travels Pvt. Ltd." />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder="hello@company.com" />
            </FormField>
            <FormField label="Phone">
              <Input {...register("phone")} placeholder="+91 98765 43210" />
            </FormField>
          </div>
          <FormField label="Website" error={errors.website?.message}>
            <Input {...register("website")} placeholder="https://www.company.com" />
          </FormField>
          <FormField label="Logo URL" error={errors.logo_url?.message}>
            <Input {...register("logo_url")} placeholder="https://cdn.company.com/logo.png" />
          </FormField>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Street Address">
            <Input {...register("address")} placeholder="123, Main Street" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City"><Input {...register("city")} placeholder="Mumbai" /></FormField>
            <FormField label="State"><Input {...register("state")} placeholder="Maharashtra" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Country"><Input {...register("country")} placeholder="India" /></FormField>
            <FormField label="Pincode"><Input {...register("pincode")} placeholder="400001" /></FormField>
          </div>
        </CardContent>
      </Card>

      {/* Tax */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Tax & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="GSTIN"><Input {...register("gstin")} placeholder="22AAAAA0000A1Z5" className="font-mono" /></FormField>
            <FormField label="PAN"><Input {...register("pan")} placeholder="AAAAA0000A" className="font-mono uppercase" /></FormField>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Meta Title">
            <Input {...register("seo_title")} placeholder="Book Flights Online — Acme Travels" />
          </FormField>
          <FormField label="Meta Description">
            <Input {...register("seo_description")} placeholder="Find and book cheap flights…" />
          </FormField>
          <FormField label="Keywords" hint="Comma separated">
            <Input {...register("seo_keywords")} placeholder="flights, cheap flights, book tickets" />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-4">
        <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
          Save Profile
        </Button>
      </div>
    </form>
  );
}
