"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Building2, CreditCard, Plane, ArrowRight, ArrowLeft,
  Users, Star, CheckCircle2, AlertTriangle
} from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Input }      from "@/components/ui/input";
import { FormField }  from "@/components/ui/form-field";
import { Alert }      from "@/components/ui/alert";
import { cn }         from "@/lib/utils/cn";
import { useAuth }    from "@/lib/hooks/use-auth";
import { AuthPanel }  from "@/components/auth/auth-panel";

/* ─── Types ──────────────────────────────────────────────────────── */
type AccountType = "customer" | "agent" | "admin";

/* ─── Schema ─────────────────────────────────────────────────────── */
const schema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().min(1, "Email is required").email("Enter a valid email"),
  phone:           z.string().optional(),
  address:         z.string().optional(),
  password:        z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"),
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
  .superRefine((data, ctx) => {
    if (data.role === "agent") {
      if (!data.company_name || data.company_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agency Name is required and must be at least 2 characters",
          path: ["company_name"],
        });
      }
      if (!data.pan_number || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PAN number is required and must match ABCDE1234F",
          path: ["pan_number"],
        });
      }
    }
  });

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
  const router = useRouter();
  const [step, setStep]                 = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [isTimeout, setIsTimeout]       = useState(false);
  const [selectedCard, setSelectedCard] = useState<AccountType>("customer");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const { register: doRegister, isLoading } = useAuth();

  const {
    register, handleSubmit, watch, setValue, trigger, setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "customer" },
  });

  const { ref: passwordRef, onBlur: passwordOnBlur, ...passwordRegister } = register("password");
  const selectedRole = watch("role") as AccountType;
  const passwordValue = watch("password") || "";

  const passwordRules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "At least one digit (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)", valid: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordValue) },
  ];

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
    setIsTimeout(false);
    try {
      const { confirmPassword: _cp, terms: _t, ...payload } = values;
      if (!payload.pan_number?.trim()) delete payload.pan_number;
      if (!payload.address?.trim())    delete payload.address;
      if (payload.role !== "agent") {
        delete payload.company_name;
        delete payload.pan_number;
      }
      await doRegister(payload as any, values.password);
    } catch (err) {
      if ((err as any).isTimeout) {
        setIsTimeout(true);
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          let generalErrors: string[] = [];
          detail.forEach((item: any) => {
            const fieldName = item.loc && item.loc.length > 0 ? item.loc[item.loc.length - 1] : null;
            if (fieldName && fieldName in values) {
              setError(fieldName as any, { message: item.msg });
            } else {
              generalErrors.push(item.msg);
            }
          });
          if (generalErrors.length > 0) {
            setApiError(generalErrors.join(", "));
          }
        } else if (typeof detail === "string") {
          setApiError(detail);
        } else {
          setApiError("Validation error occurred");
        }
      } else {
        const msg = (err as any).response?.data?.detail || (err as any).message || "An unexpected error occurred";
        setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
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

  const panel = PANEL_PROPS[selectedCard];

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

          {/* Timeout banner - shown regardless of step */}
          {isTimeout && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Server took too long to respond</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Your account may have been created. Try signing in first - if that fails, submit this form again.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
                    >
                      Try Sign In
                    </button>
                    <span className="text-amber-400 text-xs">or</span>
                    <button
                      type="button"
                      onClick={() => setIsTimeout(false)}
                      className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API error banner - shown regardless of step */}
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
                  icon={Building2}
                  title="Register a Business"
                  description="I want to launch a white-label booking website and manage an agency."
                  selected={selectedCard === "admin"}
                  onSelect={() => !isLoading && setSelectedCard("admin")}
                />
                <RoleCard
                  icon={Users}
                  title="Join as an Agent"
                  description="I want to book flights for my clients and earn commissions."
                  selected={selectedCard === "agent"}
                  onSelect={() => {
                    if (isLoading) return;
                    setSelectedCard("agent");
                    setValue("role", "agent");
                  }}
                />
                <RoleCard
                  icon={Star}
                  title="Personal Account"
                  description="I just want to search and book flights for myself."
                  selected={selectedCard === "customer"}
                  onSelect={() => {
                    if (isLoading) return;
                    setSelectedCard("customer");
                    setValue("role", "customer");
                  }}
                />
              </div>

              {selectedCard === "admin" ? (
                <Alert variant="info" className="mb-8">
                  To set up a white-label business portal, contact us at hello@trurism.com
                </Alert>
              ) : (
                <Button 
                  onClick={handleNextStep} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-300 h-14 text-base"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

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
                onClick={() => !isLoading && setStep(1)}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to roles
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {selectedRole === "admin" && "Setup your Business"}
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
                    <FormField label="PAN Number" htmlFor="pan_number" error={errors.pan_number?.message} hint="Required for GST invoicing" required>
                      <Input id="pan_number" placeholder="ABCDE1234F" maxLength={10} className="uppercase"
                        leftIcon={<CreditCard className="h-4 w-4 text-slate-400" />}
                        {...register("pan_number", { setValueAs: (v: string) => v?.toUpperCase() })} />
                    </FormField>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={!!errors.password}
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle password">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      {...passwordRegister}
                      ref={passwordRef}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={(e) => {
                        passwordOnBlur(e);
                        setIsPasswordFocused(false);
                      }}
                    />
                  </FormField>
                  <FormField label="Confirm" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password"
                      placeholder="••••••••" error={!!errors.confirmPassword}
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />} {...register("confirmPassword")} />
                  </FormField>
                </div>

                {isPasswordFocused && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Password requirements:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {passwordRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={cn("h-4 w-4 shrink-0 transition-colors duration-200", rule.valid ? "text-green-500 fill-green-50" : "text-slate-300")} />
                          <span className={rule.valid ? "text-green-700 font-medium" : "text-slate-500"}>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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