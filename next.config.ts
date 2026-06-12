import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://trurism-backend-2.onrender.com";

const backendPrefixes = [
  "auth",
  "search",
  "bookings",
  "wallet",
  "cms",
  "admin",
  "dashboard",
  "payments",
  "pricing",
  "settings",
  "files",
  "v1",
  "superadmin",
  "health",
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return backendPrefixes.map((prefix) => ({
      source: `/${prefix}/:path*`,
      destination: `${BACKEND_URL}/${prefix}/:path*`,
    }));
  },
};

export default nextConfig;
