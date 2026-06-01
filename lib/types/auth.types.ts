export type UserRole = "superadmin" | "admin" | "agent" | "customer";

export interface User {
  id: number | string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  is_active: boolean;
  is_verified?: boolean;
  company_name?: string;
  pan_number?: string;
  approval_status?: "pending" | "approved" | "rejected";
  created_at: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "customer" | "agent" | "admin";
  company_name?: string;
  pan_number?: string;
  address?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  pan_number?: string;
}

/** Role-to-dashboard path mapping */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  agent: "/agent/dashboard",
  customer: "/my/dashboard",
};
