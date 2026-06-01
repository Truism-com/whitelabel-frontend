"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plane, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { authApi } from "@/lib/api/auth";
import { parseApiError } from "@/lib/api/client";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email });
      setSentEmail(values.email);
      setSent(true);
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-slate-50 px-6 py-12">
      {/* Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="h-4 w-4 text-white -rotate-45" />
          </div>
          <span className="font-bold text-lg text-slate-900">FlightDesk</span>
        </Link>

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 mb-5">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Check your inbox
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-slate-700">{sentEmail}</span>.
              The link expires in 30 minutes.
            </p>
            <Alert variant="info" className="text-left mb-6 text-xs">
              Didn&apos;t receive the email? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-medium underline"
              >
                try again
              </button>
              .
            </Alert>
            <Link href="/login">
              <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Forgot your password?
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                No worries. Enter your email and we&apos;ll send you a reset link.
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Sending link…" : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
