"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlaneTakeoff, PlaneLanding, Search, ArrowLeftRight,
  Luggage, Check, AlertCircle, ArrowRight,
  RefreshCw, Plus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useSearchFlights, useCreateBooking, useCustomerWallet } from "@/lib/hooks/use-customer";
import { cn } from "@/lib/utils/cn";
import type { FlightResult, FlightSearchResponse } from "@/lib/types/agent.types";

/* ─── Schemas ─────────────────────────────────────────────────────── */
const searchSchema = z.object({
  origin:      z.string().regex(/^[A-Z]{3}$/, "Must be exactly 3 uppercase letters (e.g. DEL)"),
  destination: z.string().regex(/^[A-Z]{3}$/, "Must be exactly 3 uppercase letters (e.g. BOM)"),
  travel_date: z.string().min(1, "Select a date"),
  return_date: z.string().optional(),
  adults:      z.number().int().min(1).max(9),
  children:    z.number().int().min(0).max(9),
  infants:     z.number().int().min(0).max(4),
  cabin_class: z.enum(["economy", "business", "first", "premium_economy"]),
  trip_type:   z.enum(["one_way", "round_trip"]),
});
type SearchForm = z.infer<typeof searchSchema>;

const passengerSchema = z.object({
  type:        z.enum(["ADT", "CHD", "INF"]),
  title:       z.enum(["Mr", "Mrs", "Ms", "Miss", "Dr", "Mstr"]),
  first_name:  z.string().min(2, "Must be 2-100 characters").max(100, "Must be 2-100 characters"),
  last_name:   z.string().min(2, "Must be 2-100 characters").max(100, "Must be 2-100 characters"),
  dob:         z.string().min(1, "Date of birth is required"),
  passport_no: z.string().optional(),
  nationality: z.string().length(2, "Must be a 2-letter ISO code (e.g. IN)").optional(),
});

const bookingSchema = z.object({
  passengers:    z.array(passengerSchema).min(1),
  contact_email: z.string().email("Valid email required"),
  contact_phone: z.string().min(10, "Valid phone required"),
});
type BookingForm = z.infer<typeof bookingSchema>;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function parseDuration(duration: string): number {
  try {
    const hours = duration.match(/(\d+)h/);
    const mins = duration.match(/(\d+)m/);
    const h = hours ? parseInt(hours[1], 10) : 0;
    const m = mins ? parseInt(mins[1], 10) : 0;
    return h * 60 + m;
  } catch {
    return 0;
  }
}

/* ─── Sort & filter bar ───────────────────────────────────────────── */
type SortKey = "price" | "duration" | "departure";

function SortBar({ sort, setSort }: { sort: SortKey; setSort: (s: SortKey) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-slate-500 mr-1">Sort:</span>
      {(["price", "duration", "departure"] as SortKey[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => setSort(k)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
            sort === k ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          {k === "price" ? "Cheapest" : k === "duration" ? "Fastest" : "Earliest"}
        </button>
      ))}
    </div>
  );
}

/* ─── Flight result card ──────────────────────────────────────────── */
function FlightCard({ result, selected, onSelect }: {
  result: FlightResult; selected: boolean; onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-2xl border bg-white transition-all duration-200",
      selected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
    )}>
      {/* Main row */}
      <button type="button" onClick={onSelect} className="w-full text-left p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 sm:w-36 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <PlaneTakeoff className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{result.airline}</p>
              <p className="text-xs text-slate-400 font-mono">{result.flight_number}</p>
            </div>
          </div>

          {/* Times & route */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{fmtTime(result.departure_time)}</p>
              <p className="text-xs font-semibold text-slate-500">{result.origin}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <p className="text-[11px] text-slate-400">{result.duration}</p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <PlaneTakeoff className="h-3 w-3 text-slate-300" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <p className="text-[11px] text-slate-400">
                {result.stops === 0 ? "Non-stop" : `${result.stops} stop${result.stops > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{fmtTime(result.arrival_time)}</p>
              <p className="text-xs font-semibold text-slate-500">{result.destination}</p>
            </div>
          </div>

          {/* Price */}
          <div className="sm:text-right shrink-0 sm:w-32">
            <p className="text-2xl font-bold text-slate-900">
              ₹{result.price.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400">per person</p>
            <div className="flex sm:justify-end gap-1.5 mt-1.5 flex-wrap">
              <Badge variant={result.refundable ? "success" : "secondary"} className="text-[10px]">
                {result.refundable ? "Refundable" : "Non-refund"}
              </Badge>
              {result.travel_class && (
                <Badge variant="info" className="text-[10px] capitalize">{result.travel_class}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Amenities strip */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Luggage className="h-3 w-3" />{result.baggage_allowance ?? "15 kg"}</span>
          {result.aircraft && <span className="flex items-center gap-1">✈️ {result.aircraft}</span>}
        </div>
      </button>

      {/* Expand fare breakdown */}
      <div className="border-t border-slate-100">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span>Fare details</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {expanded && (
          <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-2.5 col-span-2 sm:col-span-4">
              <p className="text-slate-400 mb-0.5">Total Price</p>
              <p className="font-semibold text-slate-700">₹{result.price.toLocaleString("en-IN")}</p>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="border-t border-primary/20 bg-primary/5 px-5 py-2.5 flex items-center gap-1.5 text-primary text-xs font-medium rounded-b-2xl">
          <Check className="h-3.5 w-3.5" /> Selected — fill in passenger details below
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function SearchPage() {
  const [results, setResults]         = useState<FlightSearchResponse | null>(null);
  const [selected, setSelected]       = useState<FlightResult | null>(null);
  const [sort, setSort]               = useState<SortKey>("price");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const searchFlights  = useSearchFlights();
  const createBooking  = useCreateBooking();
  const { data: wallet } = useCustomerWallet();

  /* Search form */
  const { register: sReg, handleSubmit: sSubmit, watch: sWatch, setValue: sSet,
    formState: { errors: sErrors } } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: { adults: 1, children: 0, infants: 0, cabin_class: "economy", trip_type: "one_way" },
  });
  const tripType = sWatch("trip_type");
  const adults   = sWatch("adults");

  /* Booking form */
  const { register: bReg, handleSubmit: bSubmit, control, getValues,
    formState: { errors: bErrors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { passengers: [{ type: "ADT", title: "Mr", first_name: "", last_name: "", dob: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "passengers" });

  /* Sorting */
  const sorted = results ? [...results.results].sort((a, b) => {
    if (sort === "price")     return a.price - b.price;
    if (sort === "duration")  return parseDuration(a.duration) - parseDuration(b.duration);
    return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
  }) : [];

  const onSearch = sSubmit(async (v) => {
    const res = await searchFlights.mutateAsync(v);
    setResults(res);
    setSelected(null);
    window.scrollTo({ top: 400, behavior: "smooth" });
  });

  const onBook = bSubmit(() => setConfirmOpen(true));

  const confirmBooking = async () => {
    if (!selected || !results) return;
    const v = getValues();
    await createBooking.mutateAsync({
      search_id:     results.search_id,
      offer_id:      selected.offer_id,
      passengers:    v.passengers.map(p => ({
        type: p.type,
        title: p.title,
        first_name: p.first_name,
        last_name: p.last_name,
        dob: p.dob,
        passport_number: p.passport_no || undefined,
        nationality: p.nationality || undefined,
      })),
      payment_details: {
        method: "wallet",
      },
      contact_email: v.contact_email,
      contact_phone: v.contact_phone,
    });
    setConfirmOpen(false);
    setResults(null);
    setSelected(null);
  };

  const totalFare = selected ? selected.price * fields.length : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Search panel ── */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Search Flights</h2>

        {/* Trip type toggle */}
        <div className="flex gap-1 rounded-xl border border-slate-200 p-1 w-fit mb-5">
          {(["one_way", "round_trip"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => sSet("trip_type", t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                tripType === t ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {t === "one_way" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>

        <form onSubmit={onSearch} className="space-y-4">
          {/* Origin / Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            <FormField label="From" error={sErrors.origin?.message} required>
              <Input
                {...sReg("origin", { setValueAs: (v: string) => v?.toUpperCase()?.trim() })}
                placeholder="DEL — Delhi"
                maxLength={3}
                className="uppercase font-mono text-base h-12"
                leftIcon={<PlaneTakeoff className="h-4 w-4" />}
              />
            </FormField>
            <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 hidden sm:flex">
              <button
                type="button"
                onClick={() => {
                  const o = sWatch("origin");
                  const d = sWatch("destination");
                  sSet("origin", d); sSet("destination", o);
                }}
                className="h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors shadow-sm"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <FormField label="To" error={sErrors.destination?.message} required>
              <Input
                {...sReg("destination", { setValueAs: (v: string) => v?.toUpperCase()?.trim() })}
                placeholder="BOM — Mumbai"
                maxLength={3}
                className="uppercase font-mono text-base h-12"
                leftIcon={<PlaneLanding className="h-4 w-4" />}
              />
            </FormField>
          </div>

          {/* Dates + pax + cabin */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="Departure" error={sErrors.travel_date?.message} required>
              <Input {...sReg("travel_date")} type="date" min={new Date().toISOString().split("T")[0]} className="h-11" />
            </FormField>
            {tripType === "round_trip" && (
              <FormField label="Return">
                <Input {...sReg("return_date")} type="date" min={new Date().toISOString().split("T")[0]} className="h-11" />
              </FormField>
            )}
            <FormField label="Passengers">
              <Select
                {...sReg("adults", { valueAsNumber: true })}
                options={Array.from({ length: 9 }, (_, i) => ({
                  value: String(i + 1), label: `${i + 1} Adult${i > 0 ? "s" : ""}`,
                }))}
                className="h-11"
              />
            </FormField>
            <FormField label="Cabin Class">
              <Select {...sReg("cabin_class")} options={[
                { value: "economy",          label: "Economy" },
                { value: "premium_economy",  label: "Premium Economy" },
                { value: "business",         label: "Business" },
                { value: "first",            label: "First Class" },
              ]} className="h-11" />
            </FormField>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button type="submit" size="lg" isLoading={searchFlights.isPending} className="gap-2 px-8">
              <Search className="h-4 w-4" />
              {searchFlights.isPending ? "Searching…" : "Search Flights"}
            </Button>
            {results && (
              <button type="button" onClick={() => { setResults(null); setSelected(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                <RefreshCw className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Loading skeletons ── */}
      {searchFlights.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      )}

      {/* ── Results ── */}
      {results && !searchFlights.isPending && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-primary">{results.total_results || results.results.length}</span> flights found
            </p>
            <SortBar sort={sort} setSort={setSort} />
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-12 flex flex-col items-center text-center">
              <AlertCircle className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">No flights found for this route and date.</p>
              <p className="text-xs text-slate-400 mt-1">Try nearby airports or different dates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((r) => (
                <FlightCard
                  key={r.offer_id}
                  result={r}
                  selected={selected?.offer_id === r.offer_id}
                  onSelect={() => { setSelected(r); setTimeout(() => window.scrollTo({ top: 9999, behavior: "smooth" }), 100); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Passenger form ── */}
      {selected && (
        <form onSubmit={onBook} className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Traveller Details</h3>
              {fields.length < adults && (
                <Button type="button" size="sm" variant="outline"
                  onClick={() => append({ type: "ADT", title: "Mr", first_name: "", last_name: "", dob: "" })}
                  className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Traveller
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {fields.map((field, i) => {
                const pErr = bErrors.passengers?.[i];
                return (
                  <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Traveller {i + 1}
                      </p>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(i)}
                          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <FormField label="Title">
                        <Select {...bReg(`passengers.${i}.title`)} options={[
                          { value: "Mr", label: "Mr" },
                          { value: "Mrs", label: "Mrs" },
                          { value: "Ms", label: "Ms" },
                          { value: "Miss", label: "Miss" },
                          { value: "Dr", label: "Dr" },
                          { value: "Mstr", label: "Mstr" },
                        ]} />
                      </FormField>
                      <FormField label="First Name" error={pErr?.first_name?.message} required>
                        <Input {...bReg(`passengers.${i}.first_name`)} placeholder="As in passport" />
                      </FormField>
                      <FormField label="Last Name" error={pErr?.last_name?.message} required>
                        <Input {...bReg(`passengers.${i}.last_name`)} placeholder="As in passport" />
                      </FormField>
                      <FormField label="Date of Birth" error={pErr?.dob?.message} required>
                        <Input {...bReg(`passengers.${i}.dob`)} type="date" required />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Passport No." error={pErr?.passport_no?.message} hint="Required for international flights">
                        <Input {...bReg(`passengers.${i}.passport_no`)} placeholder="P1234567" className="uppercase" />
                      </FormField>
                      <FormField label="Nationality" error={pErr?.nationality?.message} hint="2-letter ISO country code (e.g. IN)">
                        <Input {...bReg(`passengers.${i}.nationality`, { setValueAs: (v: string) => v?.toUpperCase()?.trim() })} placeholder="IN" maxLength={2} className="uppercase font-mono" />
                      </FormField>
                    </div>
                    <input type="hidden" {...bReg(`passengers.${i}.type`)} value="ADT" />
                  </div>
                );
              })}
            </div>

            {/* Contact */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Email" error={bErrors.contact_email?.message} hint="E-ticket will be sent here" required>
                  <Input {...bReg("contact_email")} type="email" placeholder="you@example.com" />
                </FormField>
                <FormField label="Phone" error={bErrors.contact_phone?.message} hint="For booking updates" required>
                  <Input {...bReg("contact_phone")} type="tel" placeholder="+91 98765 43210" />
                </FormField>
              </div>
            </div>
          </div>

          {/* Fare summary */}
          <div className="rounded-2xl bg-white border border-primary/30 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Fare · {fields.length} traveller{fields.length > 1 ? "s" : ""}</p>
                <p className="text-3xl font-bold text-slate-900">₹{totalFare.toLocaleString("en-IN")}</p>
                <div className="flex gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                  <span>Class: {selected.travel_class}</span>
                  <span>Refund: {selected.refundable ? "Yes" : "No"}</span>
                </div>
                {wallet && totalFare > wallet.balance && (
                  <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Wallet balance (₹{wallet.balance.toLocaleString("en-IN")}) is insufficient
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="gap-2" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue to Pay
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── Confirm dialog ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <DialogHeader title="Confirm Your Booking" onClose={() => setConfirmOpen(false)} />
        <DialogBody>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Flight</span>
                  <span className="font-semibold">{selected.airline} {selected.flight_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route</span>
                  <span className="font-semibold">{selected.origin} → {selected.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-semibold text-right">
                    {fmtDate(selected.departure_time)}, {fmtTime(selected.departure_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Travellers</span>
                  <span className="font-semibold">{fields.length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5 mt-1">
                  <span className="font-semibold text-slate-700">Total Amount</span>
                  <span className="text-xl font-bold text-slate-900">₹{totalFare.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Your wallet will be debited. The e-ticket will be sent to your email within minutes.
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Back</Button>
          <Button size="sm" isLoading={createBooking.isPending} onClick={confirmBooking}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
