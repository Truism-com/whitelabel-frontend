"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authApi } from "@/lib/api/auth";
import { parseApiError } from "@/lib/api/client";
import type {
  LoginRequest,
  RegisterRequest,
  ROLE_DASHBOARDS,
  UserRole,
} from "@/lib/types/auth.types";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isHydrated,
    setAuth,
    setUser,
    setLoading,
    clearAuth,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest, redirectTo?: string) => {
      setLoading(true);
      try {
        const tokens = await authApi.login(credentials);
        /* Temporarily set tokens so /auth/me can attach the Bearer header */
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", tokens.access_token);
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }
        const user = await authApi.me();
        setAuth(user, tokens);
        setLoading(false);

        const destination =
          redirectTo ||
          {
            superadmin: "/superadmin/dashboard",
            admin: "/admin/dashboard",
            agent: "/agent/dashboard",
            customer: "/my/dashboard",
          }[user.role as UserRole] ||
          "/";

        router.push(destination);
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      } catch (err) {
        setLoading(false);
        const message = parseApiError(err);
        toast.error(message);
        throw new Error(message);
      }
    },
    [router, setAuth, setLoading]
  );

  const register = useCallback(
    async (data: RegisterRequest, plainPassword?: string) => {
      setLoading(true);
      try {
        await authApi.register(data);
      } catch (err) {
        setLoading(false);
        if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
          const timeoutErr = new Error("REGISTRATION_TIMEOUT") as Error & { isTimeout: boolean };
          timeoutErr.isTimeout = true;
          throw timeoutErr;
        }
        throw err;
      }

      /* Auto-login after successful registration */
      const loginPassword = plainPassword || data.password;
      try {
        const tokens = await authApi.login({ email: data.email, password: loginPassword });
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", tokens.access_token);
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }
        const user = await authApi.me();
        setAuth(user, tokens);
        setLoading(false);

        const destination =
          {
            superadmin: "/superadmin/dashboard",
            admin: "/admin/dashboard",
            agent: "/agent/dashboard",
            customer: "/my/dashboard",
          }[user.role as UserRole] || "/";

        router.push(destination);
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      } catch (err) {
        setLoading(false);
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    },
    [router, setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* Swallow — we clear state regardless */
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("You've been signed out.");
    }
  }, [clearAuth, router]);

  const refreshUser = useCallback(async () => {
    try {
      const updated = await authApi.me();
      setUser(updated);
    } catch {
      /* Silent */
    }
  }, [setUser]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isHydrated,
    login,
    register,
    logout,
    refreshUser,
  };
}
