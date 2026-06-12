"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plane,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/hooks/use-auth";

/* ─── Validation schema ──────────────────────────────────────────── */
const schema = z.object({
  email:    z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

/* ─── Left decorative panel ──────────────────────────────────────── */
function AuthPanel() {
  const features = [
    "Manage bookings across all channels",
    "Real-time agent commission tracking",
    "White-label site customization",
    "Razorpay payment integration",
  ];

  return (
    <div className="hidden lg:flex lg:w-[55%] relative bg-slate-950 flex-col justify-between p-12 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl" />

      {/* Flight Path SVG Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <path
          id="flight-path"
          d="M 50 600 Q 200 200 450 350 T 750 150"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <g className="motion-reduce:hidden">
          <path
            fill="white"
            d="M -6 -6 L 12 0 L -6 6 L -3 0 Z"
          >
            <animateMotion
              dur="3s"
              repeatCount="1"
              fill="freeze"
              path="M 50 600 Q 200 200 450 350 T 750 150"
              rotate="auto"
            />
          </path>
        </g>
        <g className="hidden motion-reduce:block">
          <path
            fill="white"
            d="M -6 -6 L 12 0 L -6 6 L -3 0 Z"
            transform="translate(750, 150) rotate(-20)"
          />
        </g>
      </svg>

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-lg">
          <Plane className="h-4.5 w-4.5 text-white -rotate-45" />
        </div>
        <span className="text-white font-bold text-xl">FlightDesk</span>
      </div>

      {/* Center content */}
      <div className="relative">
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight text-balance">
          Your complete<br />travel business platform.
        </h2>
        <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
          From flight search to commission payouts — everything you need to run
          a modern travel business, in one dashboard.
        </p>

        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial */}
      <div className="relative glass-dark rounded-xl p-5">
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3.5 w-3.5 text-amber-400">★</div>
          ))}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          &ldquo;We launched our branded booking site in under an hour. The markup
          rules and agent wallet features are exactly what we needed.&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600" />
          <div>
            <p className="text-white text-xs font-semibold">Ravi Sharma</p>
            <p className="text-slate-500 text-xs">MD, TravelEase Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login form wrapper ─────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();

  const isExpired = searchParams.get("expired") === "true";
  const redirectTo = searchParams.get("next") || undefined;

  useEffect(() => {
    if (isExpired) {
      const t = setTimeout(() => {
        toast.error("Session expired, please sign in", {
          id: "session-expired",
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isExpired]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await login(values, redirectTo);
    } catch (err) {
      setApiError((err as Error).message);
    }
  }

  return (
    <>
      <AuthPanel />

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="h-4 w-4 text-white -rotate-45" />
            </div>
            <span className="font-bold text-lg text-slate-900">FlightDesk</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">
              Sign in to your dashboard to continue.
            </p>
          </div>

          {apiError && (
            <Alert variant="destructive" className="mb-6">
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField
              label="Email address"
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={!!errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              required
            >
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                error={!!errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("password")}
              />
            </FormField>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-primary"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:opacity-80 font-medium transition-opacity"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:opacity-80 transition-opacity"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
