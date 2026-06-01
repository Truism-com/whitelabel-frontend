"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFeeSlabs, useCreateFeeSlab, useUpdateFeeSlab, useDeleteFeeSlab } from "@/lib/hooks/use-pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { FeeSlab } from "@/lib/types/pricing.types";

const schema = z.object({
  name:       z.string().min(1, "Required"),
  fee_type:   z.enum(["percentage", "fixed", "flat"]),
  value:      z.number().min(0),
  applies_to: z.string().min(1, "Required"),
  is_active:  z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(f: FeeSlab): FormValues {
  return {
    name:       f.name,
    fee_type:   (f.fee_type as FormValues["fee_type"]) ?? "fixed",
    value:      f.value ?? f.fee_value ?? 0,
    applies_to: f.applies_to ?? f.booking_type ?? f.payment_method ?? "all",
    is_active:  f.is_active,
  };
}

function FeeForm({ defaultValues, onSubmit, onCancel, isPending }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fee_type: "fixed", applies_to: "all", is_active: true, value: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Fee Name" error={errors.name?.message} required>
        <Input {...register("name")} placeholder="e.g. Booking Convenience Fee" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" required>
          <Select {...register("fee_type")} options={[
            { value: "fixed",      label: "Fixed (₹)" },
            { value: "percentage", label: "Percentage (%)" },
          ]} />
        </FormField>
        <FormField label="Value" error={errors.value?.message} required>
          <Input {...register("value", { valueAsNumber: true })} type="number" step="0.01" />
        </FormField>
      </div>
      <FormField label="Applies To" required>
        <Select {...register("applies_to")} options={[
          { value: "all",          label: "All Flights" },
          { value: "domestic",     label: "Domestic" },
          { value: "international",label: "International" },
        ]} />
      </FormField>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="fee_active" {...register("is_active")} className="rounded" />
        <label htmlFor="fee_active" className="text-sm text-slate-600">Active</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Fee</Button>
      </DialogFooter>
    </form>
  );
}

export default function FeesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeeSlab | null>(null);
  const { data, isLoading } = useFeeSlabs();
  const create = useCreateFeeSlab();
  const update = useUpdateFeeSlab();
  const del    = useDeleteFeeSlab();

  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = (v: FormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, ...v }, { onSuccess: close });
    } else {
      create.mutate(v, { onSuccess: close });
    }
  };

  const fees: FeeSlab[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Convenience Fees</h2>
          <p className="text-xs text-slate-400 mt-0.5">Fees charged per booking on top of the fare</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Fee
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Name", "Type", "Value", "Applies To", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : fees.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-12">No fee slabs yet.</td></tr>
                ) : (
                  fees.map((f) => {
                    const val  = f.value ?? f.fee_value ?? 0;
                    const type = f.fee_type;
                    const appTo = f.applies_to ?? f.booking_type ?? f.payment_method ?? "All";
                    return (
                      <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5 font-medium text-slate-800">{f.name}</td>
                        <td className="py-3 px-4 capitalize text-slate-600">{type}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {type === "percentage" ? `${val}%` : `₹${val}`}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">{appTo}</td>
                        <td className="py-3 px-4"><Badge variant={f.is_active ? "success" : "secondary"}>{f.is_active ? "Active" : "Inactive"}</Badge></td>
                        <td className="py-3 px-4 last:pr-5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditing(f); setOpen(true); }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => del.mutate(f.id)} disabled={del.isPending} className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={close} size="sm">
        <DialogHeader title={editing ? "Edit Fee Slab" : "New Convenience Fee"} onClose={close} />
        <DialogBody>
          <FeeForm
            defaultValues={editing ? toFormValues(editing) : undefined}
            onSubmit={handleSubmit}
            onCancel={close}
            isPending={create.isPending || update.isPending}
          />
        </DialogBody>
      </Dialog>
    </div>
  );
}
