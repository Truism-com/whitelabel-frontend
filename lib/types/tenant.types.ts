export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  borderRadius?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface TenantModules {
  flights: boolean;
  hotels: boolean;
  buses: boolean;
  holidays: boolean;
  visa: boolean;
  transfers: boolean;
  activities: boolean;
}

export interface TenantSEO {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export interface TenantContact {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface TenantSocial {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  branding: TenantBranding;
  modules: TenantModules;
  seo: TenantSEO;
  contact: TenantContact;
  social: TenantSocial;
  is_active: boolean;
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: "platform",
  slug: "platform",
  name: "FlightDesk",
  branding: {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    accentColor: "#3b82f6",
    fontFamily: "Inter",
    borderRadius: "0.5rem",
  },
  modules: {
    flights: true,
    hotels: true,
    buses: true,
    holidays: true,
    visa: true,
    transfers: true,
    activities: true,
  },
  seo: {
    title: "FlightDesk — White-Label Flight Booking Platform",
    description: "Launch your own flight booking business with FlightDesk.",
  },
  contact: {},
  social: {},
  is_active: true,
};
