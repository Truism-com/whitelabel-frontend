"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSliders, useCreateSlider, useUpdateSlider, useDeleteSlider } from "@/lib/hooks/use-cms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { Slider } from "@/lib/types/cms.types";

const schema = z.object({
  title:       z.string().min(1, "Title required"),
  subtitle:    z.string().optional(),
  image_url:   z.string().url("Must be a valid URL"),
  cta_text:    z.string().optional(),
  cta_link:    z.string().optional(),
  sort_order:  z.number().int().min(0),
  is_active:   z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function SliderForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, sort_order: 0, ...defaultValues },
  });
  const imageUrl = watch("image_url");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Title" error={errors.title?.message} required>
        <Input {...register("title")} placeholder="Banner headline" />
      </FormField>
      <FormField label="Subtitle" error={errors.subtitle?.message}>
        <Input {...register("subtitle")} placeholder="Optional subheading" />
      </FormField>
      <FormField label="Image URL" error={errors.image_url?.message} required>
        <Input {...register("image_url")} placeholder="https://..." />
      </FormField>
      {imageUrl && (
        <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="CTA Text">
          <Input {...register("cta_text")} placeholder="Book Now" />
        </FormField>
        <FormField label="CTA Link">
          <Input {...register("cta_link")} placeholder="/flights" />
        </FormField>
      </div>
      <FormField label="Sort Order" hint="Lower = shown first">
        <Input {...register("sort_order", { valueAsNumber: true })} type="number" />
      </FormField>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="slider_active" {...register("is_active")} className="rounded" />
        <label htmlFor="slider_active" className="text-sm text-slate-600">Active</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Slider</Button>
      </DialogFooter>
    </form>
  );
}

export default function SlidersPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Slider | null>(null);
  const { data, isLoading } = useSliders();
  const create = useCreateSlider();
  const update = useUpdateSlider();
  const del    = useDeleteSlider();

  const handleSubmit = (v: FormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, ...v }, { onSuccess: () => { setEditing(null); setOpen(false); } });
    } else {
      create.mutate(v, { onSuccess: () => setOpen(false) });
    }
  };

  const sliders: Slider[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Sliders & Banners</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage homepage hero banners and sliders</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Slider
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
        </div>
      ) : sliders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No sliders yet. Add your first banner.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sliders.map((s) => (
            <Card key={s.id} className="overflow-hidden group">
              <div className="relative h-36 bg-slate-100">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => { setEditing(s); setOpen(true); }} className="p-2 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => del.mutate(s.id)} disabled={del.isPending} className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={s.is_active ? "success" : "secondary"} className="text-[10px]">
                    {s.is_active ? "Active" : "Off"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-slate-800 text-sm truncate">{s.title}</p>
                {s.subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{s.subtitle}</p>}
                <p className="text-[10px] text-slate-300 mt-1">Order: {s.sort_order}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); }} size="md">
        <DialogHeader title={editing ? "Edit Slider" : "New Slider"} onClose={() => { setOpen(false); setEditing(null); }} />
        <DialogBody>
          <SliderForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setOpen(false); setEditing(null); }}
            isPending={create.isPending || update.isPending}
          />
        </DialogBody>
      </Dialog>
    </div>
  );
}
