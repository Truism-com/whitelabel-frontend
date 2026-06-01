"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

/* ─── Schemas ─────────────────────────────────────────────────────── */
const profileSchema = z.object({
  name:    z.string().min(2, "Min 2 characters"),
  phone:   z.string().optional(),
  address: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password:     z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Include uppercase").regex(/[0-9]/, "Include a number"),
  confirm_password: z.string().min(1, "Required"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [showPw, setShowPw]   = useState(false);
  const [pwLoading, setPwLoad] = useState(false);
  const [pwDone, setPwDone]    = useState(false);

  /* Profile form */
  const { register: pReg, handleSubmit: pSubmit, formState: { errors: pErrors, isDirty: pDirty, isSubmitting: pSaving } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "", address: user?.address ?? "" },
    });

  const onSaveProfile = pSubmit(async (v) => {
    try {
      await authApi.updateProfile({ name: v.name, phone: v.phone || undefined, address: v.address || undefined });
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch { toast.error("Failed to save profile."); }
  });

  /* Password form */
  const { register: wReg, handleSubmit: wSubmit, reset: wReset, formState: { errors: wErrors } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onChangePassword = wSubmit(async (v) => {
    setPwLoad(true);
    try {
      await authApi.changePassword({ current_password: v.current_password, new_password: v.new_password });
      wReset();
      setPwDone(true);
      toast.success("Password changed.");
      setTimeout(() => setPwDone(false), 5000);
    } catch { toast.error("Current password is incorrect."); }
    finally { setPwLoad(false); }
  });

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{user?.name}</h1>
          <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="default">Customer</Badge>
            {user?.is_verified && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Personal details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <FormField label="Full Name" error={pErrors.name?.message} required>
              <Input {...pReg("name")} leftIcon={<User className="h-4 w-4" />} />
            </FormField>
            <FormField label="Email Address">
              <Input
                value={user?.email ?? ""}
                readOnly disabled
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-50 cursor-not-allowed"
              />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Phone Number" error={pErrors.phone?.message}>
                <Input {...pReg("phone")} type="tel" placeholder="+91 98765 43210" leftIcon={<Phone className="h-4 w-4" />} />
              </FormField>
              <FormField label="Address" error={pErrors.address?.message}>
                <Input {...pReg("address")} placeholder="City, State" leftIcon={<MapPin className="h-4 w-4" />} />
              </FormField>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" disabled={!pDirty} isLoading={pSaving}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          {pwDone ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Password changed successfully!
            </div>
          ) : (
            <form onSubmit={onChangePassword} className="space-y-4">
              <FormField label="Current Password" error={wErrors.current_password?.message} required>
                <Input
                  {...wReg("current_password")}
                  type={showPw ? "text" : "password"}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPw((s) => !s)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </FormField>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="New Password" error={wErrors.new_password?.message} required>
                  <Input {...wReg("new_password")} type={showPw ? "text" : "password"}
                    leftIcon={<Lock className="h-4 w-4" />} placeholder="Min 8 chars" />
                </FormField>
                <FormField label="Confirm Password" error={wErrors.confirm_password?.message} required>
                  <Input {...wReg("confirm_password")} type={showPw ? "text" : "password"}
                    leftIcon={<Lock className="h-4 w-4" />} placeholder="Repeat" />
                </FormField>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" isLoading={pwLoading}>Update Password</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account info */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Account Info</p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-500">
          <div>
            <span className="text-slate-400">Member since </span>
            <span className="font-medium text-slate-700">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
            </span>
          </div>
          {user?.last_login && (
            <div>
              <span className="text-slate-400">Last login </span>
              <span className="font-medium text-slate-700">
                {new Date(user.last_login).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
