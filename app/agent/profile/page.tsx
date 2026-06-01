"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Building2, CreditCard, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

/* ─── Profile schema ──────────────────────────────────────────────── */
const profileSchema = z.object({
  name:         z.string().min(2, "Min 2 characters"),
  phone:        z.string().optional(),
  address:      z.string().optional(),
  company_name: z.string().optional(),
  pan_number:   z.string().optional()
    .refine((v) => !v || v.trim() === "" || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v), "Invalid PAN"),
});
type ProfileForm = z.infer<typeof profileSchema>;

/* ─── Password schema ─────────────────────────────────────────────── */
const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password:     z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Include uppercase").regex(/[0-9]/, "Include a number"),
  confirm_password: z.string().min(1, "Required"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AgentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [showPw, setShowPw]     = useState(false);
  const [pwLoading, setPwLoad]  = useState(false);

  /* Profile form */
  const { register: pReg, handleSubmit: pSubmit, formState: { errors: pErrors, isDirty: pDirty } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name:         user?.name ?? "",
        phone:        user?.phone ?? "",
        address:      user?.address ?? "",
        company_name: user?.company_name ?? "",
        pan_number:   user?.pan_number ?? "",
      },
    });

  const onSaveProfile = pSubmit(async (values) => {
    try {
      await authApi.updateProfile({
        name:         values.name,
        phone:        values.phone || undefined,
        address:      values.address || undefined,
        company_name: values.company_name || undefined,
        pan_number:   values.pan_number || undefined,
      });
      await refreshUser();
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to update profile.");
    }
  });

  /* Password form */
  const { register: wReg, handleSubmit: wSubmit, reset: wReset, formState: { errors: wErrors } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onChangePassword = wSubmit(async (values) => {
    setPwLoad(true);
    try {
      await authApi.changePassword({
        current_password: values.current_password,
        new_password:     values.new_password,
      });
      wReset();
      toast.success("Password changed.");
    } catch {
      toast.error("Current password is incorrect.");
    } finally {
      setPwLoad(false);
    }
  });

  const approvalColor: Record<string, "success" | "warning" | "destructive"> = {
    approved: "success", pending: "warning", rejected: "destructive",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Avatar + summary */}
      <Card>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-lg truncate">{user?.name}</p>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">Agent</Badge>
              {user?.approval_status && (
                <Badge variant={approvalColor[user.approval_status] ?? "secondary"}>
                  {user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1)}
                </Badge>
              )}
              {!user?.is_active && <Badge variant="destructive">Inactive</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">Personal & Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" error={pErrors.name?.message} required>
                <Input {...pReg("name")} leftIcon={<User className="h-4 w-4" />} />
              </FormField>
              <FormField label="Phone" error={pErrors.phone?.message}>
                <Input {...pReg("phone")} type="tel" leftIcon={<Phone className="h-4 w-4" />} />
              </FormField>
            </div>

            <FormField label="Email address">
              <Input
                value={user?.email ?? ""}
                readOnly
                disabled
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-50 cursor-not-allowed"
              />
            </FormField>

            <FormField label="Address" error={pErrors.address?.message}>
              <Input {...pReg("address")} placeholder="Street, City, State, PIN" leftIcon={<MapPin className="h-4 w-4" />} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Agency / Company Name" error={pErrors.company_name?.message}>
                <Input {...pReg("company_name")} placeholder="Your agency name" leftIcon={<Building2 className="h-4 w-4" />} />
              </FormField>
              <FormField label="PAN Number" error={pErrors.pan_number?.message} hint="Required for payouts above ₹50,000">
                <Input
                  {...pReg("pan_number", { setValueAs: (v: string) => v?.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="uppercase"
                  leftIcon={<CreditCard className="h-4 w-4" />}
                />
              </FormField>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" disabled={!pDirty}>Save Changes</Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="New Password" error={wErrors.new_password?.message} required>
                <Input {...wReg("new_password")} type={showPw ? "text" : "password"} leftIcon={<Lock className="h-4 w-4" />} placeholder="Min 8 chars" />
              </FormField>
              <FormField label="Confirm New Password" error={wErrors.confirm_password?.message} required>
                <Input {...wReg("confirm_password")} type={showPw ? "text" : "password"} leftIcon={<Lock className="h-4 w-4" />} placeholder="Repeat" />
              </FormField>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" isLoading={pwLoading}>Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
