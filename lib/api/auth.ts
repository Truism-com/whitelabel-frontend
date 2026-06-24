import { apiClient } from "./client";
import type {
  AuthTokens,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from "@/lib/types/auth.types";

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await apiClient.post<AuthTokens>("/auth/login", data);
    return res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await apiClient.post<User>("/auth/register", data);
    return res.data;
  },

  logout: async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;
    await apiClient.post("/auth/logout", {
      refresh_token: refreshToken ?? undefined,
    });
  },

  me: async () => {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const res = await apiClient.put<User>("/auth/me", data);
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const res = await apiClient.put("/auth/me/password", data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const res = await apiClient.post("/auth/forgot-password", data);
    return res.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const res = await apiClient.post("/auth/reset_password", data);
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post<{ access_token: string }>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
    return res.data;
  },
};
