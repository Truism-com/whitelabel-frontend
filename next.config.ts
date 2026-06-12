import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://trurism-backend-2.onrender.com";

const backendPrefixes = [
  "auth",
  "admin",
  "agent",
  "flights",
  "bookings",
  "wallet",
  "cms",
  "customer",
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
