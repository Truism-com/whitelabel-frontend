"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/lib/hooks/use-cms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";
import type { Offer } from "@/lib/types/cms.types";

const schema = z.object({
  title:       z.string().min(1, "Required"),
  description: z.string().optional(),
  image_url:   z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coupon_code: z.string().optional(),
  valid_until: z.string().optional(),
  is_active:   z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function OfferForm({
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Offer Title" error={errors.title?.message} required>
        <Input {...register("title")} placeholder="e.g. Flat ₹500 off on Domestic Flights" />
      </FormField>
      <FormField label="Description">
        <Textarea {...register("description")} placeholder="Offer details..." rows={3} />
      </FormField>
      <FormField label="Image URL" error={errors.image_url?.message}>
        <Input {...register("image_url")} placeholder="https://..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Coupon Code">
          <Input {...register("coupon_code")} placeholder="FLAT500" className="font-mono uppercase" />
        </FormField>
        <FormField label="Valid Until">
          <Input {...register("valid_until")} type="date" />
        </FormField>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="offer_active" {...register("is_active")} className="rounded" />
        <label htmlFor="offer_active" className="text-sm text-slate-600">Active</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Offer</Button>
      </DialogFooter>
    </form>
  );
}

export default function OffersPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const { data, isLoading } = useOffers();
  const create = useCreateOffer();
  const update = useUpdateOffer();
  const del    = useDeleteOffer();

  const handleSubmit = (v: FormValues) => {
    const payload = { ...v, image_url: v.image_url || undefined, valid_until: v.valid_until || undefined };
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { setEditing(null); setOpen(false); } });
    } else {
      create.mutate(payload, { onSuccess: () => setOpen(false) });
    }
  };

  const offers: Offer[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Offers & Coupons</h2>
          <p className="text-xs text-slate-400 mt-0.5">Promotional offers displayed on your booking site</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Offer
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Gift className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No offers yet. Create your first promotion.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <Card key={o.id} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{o.title}</p>
                      {o.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{o.description}</p>}
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        {o.coupon_code && (
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{o.coupon_code}</span>
                        )}
                        {o.valid_until && (
                          <span className="text-[11px] text-slate-400">
                            Until {new Date(o.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={o.is_active ? "success" : "secondary"} className="text-[10px]">
                      {o.is_active ? "Live" : "Off"}
                    </Badge>
                    <button onClick={() => { setEditing(o); setOpen(true); }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => del.mutate(o.id)} disabled={del.isPending} className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); }} size="md">
        <DialogHeader title={editing ? "Edit Offer" : "New Offer"} onClose={() => { setOpen(false); setEditing(null); }} />
        <DialogBody>
          <OfferForm
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
