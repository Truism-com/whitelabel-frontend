"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDiscountRules, useCreateDiscountRule, useUpdateDiscountRule, useDeleteDiscountRule } from "@/lib/hooks/use-pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { DiscountRule } from "@/lib/types/pricing.types";

const schema = z.object({
  code:          z.string().min(3, "Min 3 chars"),
  discount_type: z.enum(["percentage", "fixed", "flat"]),
  value:         z.number().min(0),
  max_uses:      z.number().int().min(1).optional(),
  min_amount:    z.number().min(0).optional(),
  expires_at:    z.string().optional(),
  is_active:     z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(r: DiscountRule): FormValues {
  return {
    code:          r.code,
    discount_type: (r.discount_type as FormValues["discount_type"]) ?? "percentage",
    value:         r.value ?? r.discount_value ?? 0,
    max_uses:      r.max_uses,
    min_amount:    r.min_amount ?? r.min_booking_amount,
    expires_at:    r.expires_at ?? r.valid_to,
    is_active:     r.is_active,
  };
}

function DiscountForm({ defaultValues, onSubmit, onCancel, isPending }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { discount_type: "percentage", is_active: true, value: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Coupon Code" error={errors.code?.message} required>
        <Input {...register("code")} placeholder="e.g. SUMMER20" className="font-mono uppercase" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" required>
          <Select {...register("discount_type")} options={[
            { value: "percentage", label: "Percentage (%)" },
            { value: "fixed",      label: "Fixed (₹)" },
          ]} />
        </FormField>
        <FormField label="Value" error={errors.value?.message} required>
          <Input {...register("value", { valueAsNumber: true })} type="number" step="0.01" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Max Uses" hint="Blank = unlimited">
          <Input {...register("max_uses", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })} type="number" placeholder="Unlimited" />
        </FormField>
        <FormField label="Min Order (₹)">
          <Input {...register("min_amount", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })} type="number" placeholder="0" />
        </FormField>
      </div>
      <FormField label="Expires At">
        <Input {...register("expires_at", { setValueAs: (v) => v === "" ? undefined : v })} type="datetime-local" />
      </FormField>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active_d" {...register("is_active")} className="rounded" />
        <label htmlFor="is_active_d" className="text-sm text-slate-600">Active</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Code</Button>
      </DialogFooter>
    </form>
  );
}

export default function DiscountsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountRule | null>(null);
  const { data, isLoading } = useDiscountRules();
  const create = useCreateDiscountRule();
  const update = useUpdateDiscountRule();
  const del    = useDeleteDiscountRule();

  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = (v: FormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, ...v }, { onSuccess: close });
    } else {
      create.mutate(v, { onSuccess: close });
    }
  };

  const rules: DiscountRule[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Discount Codes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Create and manage promotional coupon codes</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Code
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Code", "Type", "Value", "Uses", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : rules.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-12">No discount codes yet.</td></tr>
                ) : (
                  rules.map((r) => {
                    const val     = r.value ?? r.discount_value ?? 0;
                    const expiry  = r.expires_at ?? r.valid_to;
                    const usesCount = r.uses_count ?? 0;
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-800">{r.code}</span>
                            <button onClick={() => { navigator.clipboard.writeText(r.code); toast.success("Copied!"); }} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">{r.discount_type}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {r.discount_type === "percentage" ? `${val}%` : `₹${val}`}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{usesCount}{r.max_uses ? ` / ${r.max_uses}` : ""}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {expiry ? new Date(expiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                        </td>
                        <td className="py-3 px-4"><Badge variant={r.is_active ? "success" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></td>
                        <td className="py-3 px-4 last:pr-5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditing(r); setOpen(true); }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => del.mutate(r.id)} disabled={del.isPending} className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
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
        <DialogHeader title={editing ? "Edit Discount Code" : "New Discount Code"} onClose={close} />
        <DialogBody>
          <DiscountForm
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
