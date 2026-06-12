"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMarkupRules, useCreateMarkupRule, useUpdateMarkupRule, useDeleteMarkupRule } from "@/lib/hooks/use-pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { MarkupRule } from "@/lib/types/pricing.types";

const schema = z.object({
  name:        z.string().min(1, "Name is required"),
  markup_type: z.enum(["percentage", "fixed", "flat"]),
  value:       z.number().min(0, "Must be ≥ 0"),
  applies_to:  z.string().min(1, "Required"),
  is_active:   z.boolean(),
  min_markup:  z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().min(0, "Must be ≥ 0").optional()),
  max_markup:  z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().min(0, "Must be ≥ 0").optional()),
});
type FormValues = z.infer<typeof schema>;

const APPLIES_OPTS = [
  { value: "all",          label: "All Flights" },
  { value: "domestic",     label: "Domestic" },
  { value: "international",label: "International" },
];

function toFormValues(r: MarkupRule): FormValues {
  return {
    name:        r.name,
    markup_type: (r.markup_type as FormValues["markup_type"]) ?? "percentage",
    value:       r.value ?? r.markup_value ?? 0,
    applies_to:  r.applies_to ?? r.route ?? r.airline ?? "all",
    is_active:   r.is_active,
    min_markup:  r.min_markup,
    max_markup:  r.max_markup,
  };
}

function RuleForm({ defaultValues, onSubmit, onCancel, isPending }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { markup_type: "percentage", applies_to: "all", is_active: true, value: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Rule Name" error={errors.name?.message} required>
        <Input {...register("name")} placeholder="e.g. Standard Domestic Markup" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" error={errors.markup_type?.message} required>
          <Select {...register("markup_type")} options={[
            { value: "percentage", label: "Percentage (%)" },
            { value: "fixed",      label: "Fixed (₹)" },
          ]} />
        </FormField>
        <FormField label="Value" error={errors.value?.message} required>
          <Input {...register("value", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Min Markup Limit (₹)" error={errors.min_markup?.message}>
          <Input {...register("min_markup", { valueAsNumber: true })} type="number" step="0.01" placeholder="None" />
        </FormField>
        <FormField label="Max Markup Limit (₹)" error={errors.max_markup?.message}>
          <Input {...register("max_markup", { valueAsNumber: true })} type="number" step="0.01" placeholder="None" />
        </FormField>
      </div>
      <FormField label="Applies To" error={errors.applies_to?.message} required>
        <Select {...register("applies_to")} options={APPLIES_OPTS} />
      </FormField>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" {...register("is_active")} className="rounded" />
        <label htmlFor="is_active" className="text-sm text-slate-600">Active</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save Rule</Button>
      </DialogFooter>
    </form>
  );
}

export default function MarkupRulesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarkupRule | null>(null);
  const { data, isLoading } = useMarkupRules();
  const create = useCreateMarkupRule();
  const update = useUpdateMarkupRule();
  const del    = useDeleteMarkupRule();

  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = (v: FormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, ...v }, { onSuccess: close });
    } else {
      create.mutate(v, { onSuccess: close });
    }
  };

  const rules: MarkupRule[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Markup Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">Define pricing markups applied to flight fares</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />New Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Name", "Type", "Value", "Limits (Min/Max)", "Applies To", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide py-3 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4 first:pl-5"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : rules.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-12">No markup rules yet. Create one.</td></tr>
                ) : (
                  rules.map((r) => {
                    const val = r.value ?? r.markup_value ?? 0;
                    const type = r.markup_type;
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 first:pl-5 font-medium text-slate-800">{r.name}</td>
                        <td className="py-3 px-4 capitalize text-slate-600">{type}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {type === "percentage" ? `${val}%` : `₹${val}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {r.min_markup !== undefined || r.max_markup !== undefined ? (
                            <span>
                              {r.min_markup !== undefined && r.min_markup !== null ? `Min: ₹${r.min_markup}` : "—"} /{" "}
                              {r.max_markup !== undefined && r.max_markup !== null ? `Max: ₹${r.max_markup}` : "—"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">{r.applies_to ?? r.route ?? r.airline ?? "All"}</td>
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
        <DialogHeader title={editing ? "Edit Markup Rule" : "New Markup Rule"} onClose={close} />
        <DialogBody>
          <RuleForm
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
