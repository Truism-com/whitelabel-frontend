import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/lib/types/api.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Token helpers (browser-only) ─────────────────────────────── */
const storage = {
  getAccess: () =>
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null,
  getRefresh: () =>
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null,
  setAccess: (t: string) => localStorage.setItem("access_token", t),
  setRefresh: (t: string) => localStorage.setItem("refresh_token", t),
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

/* ─── Queue management for concurrent 401 retries ──────────────── */
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

function drainQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!)
  );
  queue = [];
}

/* ─── Axios instance ────────────────────────────────────────────── */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/* ─── Request interceptor — attach JWT + tenant header ─────────── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (typeof document !== "undefined") {
      const tenantSlug = document.cookie
        .split("; ")
        .find((r) => r.startsWith("x-tenant-slug="))
        ?.split("=")[1];
      if (tenantSlug) config.headers["X-Tenant-Code"] = tenantSlug;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ─── Response interceptor — silent token refresh on 401 ────────── */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(parseApiError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) =>
        queue.push({ resolve, reject })
      ).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresh = storage.getRefresh();
      if (!refresh) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refresh,
      });

      storage.setAccess(data.access_token);
      if (data.refresh_token) storage.setRefresh(data.refresh_token);

      drainQueue(null, data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(original);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      storage.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* ─── Error formatter ───────────────────────────────────────────── */
export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail))
      return data.detail.map((d) => d.msg).join(", ");
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}
