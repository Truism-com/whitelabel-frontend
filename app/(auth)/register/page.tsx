"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Building2, CreditCard, Plane, ArrowRight, ArrowLeft,
  Users, Star, CheckCircle2, MapPin, ShieldCheck
} from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Input }      from "@/components/ui/input";
import { FormField }  from "@/components/ui/form-field";
import { Alert }      from "@/components/ui/alert";
import { cn }         from "@/lib/utils/cn";
import { useAuth }    from "@/lib/hooks/use-auth";
import { AuthPanel }  from "@/components/auth/auth-panel";

/* ─── Types ──────────────────────────────────────────────────────── */
type AccountType = "customer" | "agent";

/* ─── Schema ─────────────────────────────────────────────────────── */
const schema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().min(1, "Email is required").email("Enter a valid email"),
  phone:           z.string().optional(),
  address:         z.string().optional(),
  password:        z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Need uppercase").regex(/[0-9]/, "Need number"),
  confirmPassword: z.string().min(1, "Confirm password"),
  role:            z.enum(["customer", "agent"]),
  company_name:    z.string().optional(),
  pan_number:      z.string().optional(),
  terms:           z.literal(true, { message: "You must accept the terms" }),
})
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (d) => {
      if (d.role === "agent") {
        return !!d.company_name?.trim();
      }
      return true;
    },
    { message: "Company name is required for agents", path: ["company_name"] }
  )
  .refine(
    (d) => {
      if (d.role === "agent") {
        return !!d.pan_number?.trim();
      }
      return true;
    },
    { message: "PAN number is required for agents", path: ["pan_number"] }
  )
  .refine(
    (d) =>
      !d.pan_number ||
      d.pan_number.trim() === "" ||
      /^[a-zA-Z0-9]{10}$/.test(d.pan_number.trim()),
    { message: "PAN number must be exactly 10 alphanumeric characters", path: ["pan_number"] }
  );

type FormValues = z.infer<typeof schema>;

/* ─── Immersive Role Card (Enlarged for Step 1) ─────────────────── */
function RoleCard({
  icon: Icon, title, description, selected, onSelect,
}: {
  icon: React.ElementType; title: string; description: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start gap-4 rounded-3xl p-6 text-left transition-all duration-300 border w-full",
        selected
          ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 scale-[1.02] z-10"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300",
          selected ? "bg-white/10" : "bg-slate-100"
        )}>
          <Icon className={cn("h-6 w-6 transition-colors duration-300", selected ? "text-white" : "text-slate-600")} />
        </div>
        <div className={cn(
          "h-6 w-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
          selected ? "border-blue-500 bg-blue-500" : "border-slate-200"
        )}>
          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
        </div>
      </div>
      
      <div>
        <h3 className={cn("text-lg font-bold tracking-tight mb-1 transition-colors duration-300", selected ? "text-white" : "text-slate-900")}>
          {title}
        </h3>
        <p className={cn("text-sm leading-relaxed transition-colors duration-300", selected ? "text-slate-300" : "text-slate-500")}>
          {description}
        </p>
      </div>
    </button>
  );
}

/* ─── Main register page ─────────────────────────────────────────── */
export default function RegisterPage() {
  const [step, setStep]                 = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  
  const { register: doRegister, isLoading } = useAuth();

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "agent" }, // Defaulting to agent to guide B2B users
  });

  const selectedRole = watch("role") as AccountType;

  // Handles moving to Step 2
  const handleNextStep = async () => {
    const isRoleValid = await trigger("role");
    if (isRoleValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      const { confirmPassword: _cp, terms: _t, ...payload } = values;
      if (!payload.pan_number?.trim()) delete payload.pan_number;
      if (!payload.address?.trim())    delete payload.address;
      await doRegister(payload as Parameters<typeof doRegister>[0]);
    } catch (err) {
      setApiError((err as Error).message);
    }
  }

  // Content for the left panel based on role
  const PANEL_PROPS = {
    customer: {
      title: "Book smarter, travel better.",
      subtitle: "Search hundreds of flights, compare prices, and manage all your bookings in one place.",
      features: ["Real-time flight search", "Instant e-ticket download", "Wallet & refund management", "24/7 booking support"],
      testimonial: { quote: "Booking my family trip took under 3 minutes. The wallet top-up is seamless.", name: "Priya Mehta", role: "Frequent Flyer" },
    },
    agent: {
      title: "Earn more with every booking.",
      subtitle: "Book on behalf of your clients, track your commissions in real-time, and grow your travel business.",
      features: ["Book for multiple clients", "Commission wallet dashboard", "Credit limit management", "Full booking history & tickets"],
      testimonial: { quote: "My commission earnings doubled in the first month. The wallet system is brilliant.", name: "Suresh Pillai", role: "Independent Travel Agent" },
    },
    admin: {
      title: "Launch your own branded booking site.",
      subtitle: "White-label flight booking powered by TravelOS. Your brand, your agents, your commissions.",
      features: ["Custom domain & logo", "6 professional templates", "Agent network & markup rules", "Razorpay payment integration"],
      testimonial: { quote: "We launched our branded OTA in one day. The markup engine saves us hours every week.", name: "Ravi Sharma", role: "MD, TravelEase Pvt. Ltd." },
    },
  };

  const panel = PANEL_PROPS[selectedRole];

  return (
    <>
      <AuthPanel {...panel} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto relative">
        
        {/* Progress Bar (Visible on both steps) */}
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-100">
          <div 
            className="h-full bg-slate-900 transition-all duration-500 ease-in-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
              <Plane className="h-4 w-4 text-white -rotate-45" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">TravelOS</span>
          </div>

          {apiError && <Alert variant="destructive" className="mb-6">{apiError}</Alert>}

          {/* ================= STEP 1: ROLE SELECTION ================= */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome to TravelOS</h1>
                <p className="text-slate-500 font-medium">How do you plan to use the platform?</p>
              </div>

              <div className="space-y-4 mb-8">
                <RoleCard
                  icon={Users}
                  title="Join as an Agent"
                  description="I want to book flights for my clients and earn commissions."
                  selected={selectedRole === "agent"}
                  onSelect={() => setValue("role", "agent")}
                />
                <RoleCard
                  icon={Star}
                  title="Personal Account"
                  description="I just want to search and book flights for myself."
                  selected={selectedRole === "customer"}
                  onSelect={() => setValue("role", "customer")}
                />
              </div>

              <Button 
                onClick={handleNextStep} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-300 h-14 text-base"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-slate-900 font-bold hover:underline transition-all">Sign in</Link>
              </p>
            </div>
          )}

          {/* ================= STEP 2: FORM DETAILS ================= */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to roles
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {selectedRole === "agent" && "Create Agent Profile"}
                  {selectedRole === "customer" && "Create Personal Account"}
                </h1>
                <p className="text-slate-500 font-medium">Let's get your details to finalize setup.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                
                {/* Core Details */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name" htmlFor="name" error={errors.name?.message} required>
                    <Input id="name" autoComplete="name" placeholder="John Doe" error={!!errors.name}
                      leftIcon={<User className="h-4 w-4 text-slate-400" />} {...register("name")} />
                  </FormField>
                  <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
                    <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765…"
                      leftIcon={<Phone className="h-4 w-4 text-slate-400" />} {...register("phone")} />
                  </FormField>
                </div>

                <FormField label="Email Address" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" autoComplete="email" placeholder="john@company.com"
                    error={!!errors.email} leftIcon={<Mail className="h-4 w-4 text-slate-400" />} {...register("email")} />
                </FormField>

                {/* Conditional Fields: Agent */}
                {selectedRole === "agent" && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-bold text-slate-900 tracking-tight">Agency Info</p>
                    </div>
                    <FormField label="Agency Name" htmlFor="company_name" error={errors.company_name?.message} required>
                      <Input id="company_name" placeholder="Independent or Agency Name"
                        leftIcon={<Building2 className="h-4 w-4 text-slate-400" />} {...register("company_name")} />
                    </FormField>
                    <FormField label="PAN Number" htmlFor="pan_number" error={errors.pan_number?.message} required hint="Exactly 10 alphanumeric characters">
                      <Input id="pan_number" placeholder="ABCDE1234F" maxLength={10} className="uppercase"
                        leftIcon={<CreditCard className="h-4 w-4 text-slate-400" />}
                        {...register("pan_number", { setValueAs: (v: string) => v?.toUpperCase() })} />
                    </FormField>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
                    <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                      placeholder="••••••••" error={!!errors.password}
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle password">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      {...register("password")} />
                  </FormField>
                  <FormField label="Confirm" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password"
                      placeholder="••••••••" error={!!errors.confirmPassword}
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />} {...register("confirmPassword")} />
                  </FormField>
                </div>

                {/* Terms */}
                <FormField error={errors.terms?.message}>
                  <label className="flex items-start gap-3 cursor-pointer group mt-2">
                    <div className="relative flex items-start pt-1">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-colors" {...register("terms")} />
                    </div>
                    <span className="text-sm text-slate-500 leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-slate-900 hover:underline font-semibold">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-slate-900 hover:underline font-semibold">Privacy Policy</a>
                    </span>
                  </label>
                </FormField>

                <Button type="submit" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-300 h-14 text-base" isLoading={isLoading}>
                  {isLoading ? "Preparing your workspace..." : "Create Account"}
                  {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}