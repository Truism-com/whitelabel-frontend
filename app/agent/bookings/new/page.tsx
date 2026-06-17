"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlaneTakeoff, PlaneLanding, Search,
  Luggage, Plus, Trash2, Check, AlertCircle, ArrowRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useSearchFlights, useCreateBooking, useAgentWallet } from "@/lib/hooks/use-agent";
import { cn } from "@/lib/utils/cn";
import type { FlightResult, FlightSearchResponse } from "@/lib/types/agent.types";

/* ─── Search form schema ──────────────────────────────────────────── */
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

/* ─── Booking form schema ─────────────────────────────────────────── */
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
  client_name:   z.string().optional(),
});
type BookingForm = z.infer<typeof bookingSchema>;

/* ─── Helpers ────────────────────────────────────────────────────── */
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

/* ─── Flight result card ─────────────────────────────────────────── */
function FlightCard({
  result, selected, onSelect,
}: {
  result: FlightResult; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-150",
        selected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-40 shrink-0">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <PlaneTakeoff className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{result.airline}</p>
            <p className="text-xs text-slate-400 font-mono">{result.flight_number}</p>
          </div>
        </div>

        {/* Route + duration */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{fmtTime(result.departure_time)}</p>
            <p className="text-xs font-semibold text-slate-500">{result.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-[10px] text-slate-400">{result.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-slate-200" />
              <PlaneTakeoff className="h-3 w-3 text-slate-400" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <p className="text-[10px] text-slate-400">{result.stops === 0 ? "Non-stop" : `${result.stops} stop${result.stops > 1 ? "s" : ""}`}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{fmtTime(result.arrival_time)}</p>
            <p className="text-xs font-semibold text-slate-500">{result.destination}</p>
          </div>
        </div>

        {/* Price + meta */}
        <div className="sm:text-right sm:w-36 shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold text-slate-900">₹{result.price.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-400">per person</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={result.refundable ? "success" : "secondary"} className="text-[10px]">
              {result.refundable ? "Refundable" : "Non-refund"}
            </Badge>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Luggage className="h-3 w-3" />{result.baggage_allowance ?? "15 kg"}
            </span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-1.5 text-primary text-xs font-medium">
          <Check className="h-3.5 w-3.5" /> Selected — fill passenger details below
        </div>
      )}
    </button>
  );
}

/* ─── Passenger row ──────────────────────────────────────────────── */
function PassengerRow({ index, register, errors, remove, canRemove }: {
  index: number;
  register: ReturnType<typeof useForm<BookingForm>>["register"];
  errors: ReturnType<typeof useForm<BookingForm>>["formState"]["errors"];
  remove: () => void;
  canRemove: boolean;
}) {
  const pErrors = errors.passengers?.[index];
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Passenger {index + 1}</p>
        {canRemove && (
          <button type="button" onClick={remove} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FormField label="Title" error={pErrors?.title?.message}>
          <Select {...register(`passengers.${index}.title`)} options={[
            { value: "Mr", label: "Mr" },
            { value: "Mrs", label: "Mrs" },
            { value: "Ms", label: "Ms" },
            { value: "Miss", label: "Miss" },
            { value: "Dr", label: "Dr" },
            { value: "Mstr", label: "Mstr" },
          ]} />
        </FormField>
        <FormField label="First Name" error={pErrors?.first_name?.message} required>
          <Input {...register(`passengers.${index}.first_name`)} placeholder="First" />
        </FormField>
        <FormField label="Last Name" error={pErrors?.last_name?.message} required>
          <Input {...register(`passengers.${index}.last_name`)} placeholder="Last" />
        </FormField>
        <FormField label="Date of Birth" error={pErrors?.dob?.message} required>
          <Input {...register(`passengers.${index}.dob`)} type="date" required />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Passport No." error={pErrors?.passport_no?.message} hint="Required for international">
          <Input {...register(`passengers.${index}.passport_no`)} placeholder="e.g. P1234567" className="uppercase" />
        </FormField>
        <FormField label="Nationality" error={pErrors?.nationality?.message} hint="2-letter ISO country code (e.g. IN)">
          <Input {...register(`passengers.${index}.nationality`, { setValueAs: (v: string) => v?.toUpperCase()?.trim() })} placeholder="IN" maxLength={2} className="uppercase font-mono" />
        </FormField>
      </div>
      <input type="hidden" {...register(`passengers.${index}.type`)} value="ADT" />
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function NewBookingPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [bookingStep, setBookingStep] = useState<"search" | "select" | "details" | "confirm">("search");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const searchFlight  = useSearchFlights();
  const createBooking = useCreateBooking();
  const { data: wallet } = useAgentWallet();

  /* Search form */
  const {
    register: sReg, handleSubmit: sSubmit, watch: sWatch, setValue: sSet,
    formState: { errors: sErrors },
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: { adults: 1, children: 0, infants: 0, cabin_class: "economy", trip_type: "one_way" },
  });
  const tripType = sWatch("trip_type");

  /* Booking form */
  const {
    register: bReg, handleSubmit: bSubmit, control,
    formState: { errors: bErrors }, getValues,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: [{ type: "ADT", title: "Mr", first_name: "", last_name: "", dob: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "passengers" });

  const onSearch = sSubmit(async (values) => {
    const res = await searchFlight.mutateAsync(values);
    setSearchResults(res);
    setBookingStep("select");
    setSelectedFlight(null);
  });

  const onBook = bSubmit(() => setConfirmOpen(true));

  const confirmBooking = async () => {
    if (!selectedFlight || !searchResults) return;
    const vals = getValues();
    const res = await createBooking.mutateAsync({
      search_id:     searchResults.search_id,
      offer_id:      selectedFlight.offer_id,
      passengers:    vals.passengers.map(p => ({
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
      contact_email: vals.contact_email,
      contact_phone: vals.contact_phone,
      client_name:   vals.client_name,
    });
    setConfirmOpen(false);
    setBookingStep("search");
    setSearchResults(null);
    setSelectedFlight(null);
    const bookingId = (res as any).booking_id ?? (res as any).id;
    if (bookingId) {
      router.push(`/agent/bookings/confirm/${bookingId}`);
    }
  };

  const totalFare = selectedFlight
    ? selectedFlight.price * (getValues("passengers")?.length || 1)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Search panel ── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <p className="text-sm font-semibold text-slate-800">Flight Search</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(["one_way", "round_trip"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => sSet("trip_type", t)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    tripType === t ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {t === "one_way" ? "One Way" : "Round Trip"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="From (IATA)" error={sErrors.origin?.message} required>
                <Input
                  {...sReg("origin", { setValueAs: (v: string) => v?.toUpperCase()?.trim() })}
                  placeholder="DEL"
                  maxLength={3}
                  className="uppercase font-mono"
                  leftIcon={<PlaneTakeoff className="h-4 w-4" />}
                />
              </FormField>
              <FormField label="To (IATA)" error={sErrors.destination?.message} required>
                <Input
                  {...sReg("destination", { setValueAs: (v: string) => v?.toUpperCase()?.trim() })}
                  placeholder="BOM"
                  maxLength={3}
                  className="uppercase font-mono"
                  leftIcon={<PlaneLanding className="h-4 w-4" />}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField label="Departure" error={sErrors.travel_date?.message} required>
                <Input {...sReg("travel_date")} type="date" min={new Date().toISOString().split("T")[0]} />
              </FormField>
              {tripType === "round_trip" && (
                <FormField label="Return" error={sErrors.return_date?.message}>
                  <Input {...sReg("return_date")} type="date" min={new Date().toISOString().split("T")[0]} />
                </FormField>
              )}
              <FormField label="Adults">
                <Select {...sReg("adults", { valueAsNumber: true })} options={
                  Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
                } />
              </FormField>
              <FormField label="Cabin">
                <Select {...sReg("cabin_class")} options={[
                  { value: "economy",         label: "Economy" },
                  { value: "premium_economy", label: "Prem. Economy" },
                  { value: "business",        label: "Business" },
                  { value: "first",           label: "First Class" },
                ]} />
              </FormField>
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" isLoading={searchFlight.isPending} className="gap-1.5">
                <Search className="h-4 w-4" />
                {searchFlight.isPending ? "Searching…" : "Search Flights"}
              </Button>
              {searchResults && (
                <button
                  type="button"
                  onClick={() => { setSearchResults(null); setBookingStep("search"); setSelectedFlight(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Clear results
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Search results ── */}
      {searchFlight.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      )}

      {searchResults && !searchFlight.isPending && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {searchResults.total_results || searchResults.results.length} flights found
            </p>
            <p className="text-xs text-slate-400">Select a flight to continue</p>
          </div>

          {searchResults.results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">No flights found for this route and date.</p>
                <p className="text-xs text-slate-300 mt-1">Try different dates or airports.</p>
              </CardContent>
            </Card>
          ) : (
            searchResults.results.map((r) => (
              <FlightCard
                key={r.offer_id}
                result={r}
                selected={selectedFlight?.offer_id === r.offer_id}
                onSelect={() => {
                  setSelectedFlight(r);
                  setBookingStep("details");
                }}
              />
            ))
          )}
        </div>
      )}

      {/* ── Passenger + contact details ── */}
      {selectedFlight && bookingStep === "details" && (
        <form onSubmit={onBook} className="space-y-5">
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Passenger Details</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ type: "ADT", title: "Mr", first_name: "", last_name: "", dob: "" })}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Passenger
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, i) => (
                  <PassengerRow
                    key={field.id}
                    index={i}
                    register={bReg}
                    errors={bErrors}
                    remove={() => remove(i)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Contact Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Client Name (optional)">
                    <Input {...bReg("client_name")} placeholder="Booking made for…" />
                  </FormField>
                  <FormField label="Contact Email" error={bErrors.contact_email?.message} required>
                    <Input {...bReg("contact_email")} type="email" placeholder="client@example.com" />
                  </FormField>
                  <FormField label="Contact Phone" error={bErrors.contact_phone?.message} required>
                    <Input {...bReg("contact_phone")} type="tel" placeholder="+91 98765 43210" />
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fare summary + submit */}
          <Card className="border-primary/30">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Fare ({fields.length} passenger{fields.length > 1 ? "s" : ""})</p>
                  <p className="text-2xl font-bold text-slate-900">₹{totalFare.toLocaleString("en-IN")}</p>
                  <div className="flex gap-3 mt-1 text-xs text-slate-400">
                    <span>Class: {selectedFlight.travel_class}</span>
                    <span>Refund: {selectedFlight.refundable ? "Yes" : "No"}</span>
                  </div>
                  {wallet && totalFare > wallet.balance && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Wallet balance (₹{wallet.balance.toLocaleString("en-IN")}) may be insufficient
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="gap-1.5" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Review & Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ── Confirm dialog ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <DialogHeader title="Confirm Booking" onClose={() => setConfirmOpen(false)} />
        <DialogBody>
          {selectedFlight && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Flight</span>
                  <span className="font-semibold">{selectedFlight.airline} {selectedFlight.flight_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route</span>
                  <span className="font-semibold">{selectedFlight.origin} → {selectedFlight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure</span>
                  <span className="font-semibold">{new Date(selectedFlight.departure_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers</span>
                  <span className="font-semibold">{fields.length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="font-bold text-lg text-slate-900">₹{totalFare.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">Wallet will be debited. This action cannot be undone.</p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Back</Button>
          <Button size="sm" isLoading={createBooking.isPending} onClick={confirmBooking}>
            Confirm & Book
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
