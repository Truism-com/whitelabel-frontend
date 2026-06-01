import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlightDesk — White-Label Flight Booking Platform",
    template: "%s | FlightDesk",
  },
  description:
    "Launch your own branded flight booking business in minutes. White-label platform with 235+ APIs, multi-role access, and full customization.",
  keywords: ["flight booking", "white label", "travel platform", "B2B travel"],
  authors: [{ name: "FlightDesk" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "FlightDesk",
    title: "FlightDesk — White-Label Flight Booking Platform",
    description:
      "Launch your own branded flight booking business with FlightDesk.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
