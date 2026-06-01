export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  { id: "skyblue",   name: "SkyBlue",     category: "Professional", description: "Clean, trusted, and corporate",    primaryColor: "#2563eb", secondaryColor: "#0f172a", accentColor: "#3b82f6" },
  { id: "emerald",   name: "EmeraldAir",  category: "Modern",       description: "Fresh, eco-friendly, modern",      primaryColor: "#059669", secondaryColor: "#064e3b", accentColor: "#10b981" },
  { id: "sunset",    name: "SunsetJets",  category: "Adventure",    description: "Warm, vibrant, travel-forward",    primaryColor: "#ea580c", secondaryColor: "#1c1917", accentColor: "#f97316" },
  { id: "violet",    name: "VioletSkies", category: "Premium",      description: "Sophisticated and bold",           primaryColor: "#7c3aed", secondaryColor: "#1e1b4b", accentColor: "#8b5cf6" },
  { id: "midnight",  name: "MidnightAir", category: "Luxury",       description: "Dark, sleek, premium feel",        primaryColor: "#f59e0b", secondaryColor: "#0a0a0a", accentColor: "#fbbf24" },
  { id: "rose",      name: "RoseJet",     category: "Lifestyle",    description: "Friendly, lifestyle-focused",      primaryColor: "#e11d48", secondaryColor: "#0f172a", accentColor: "#f43f5e" },
];
