/**
 * Format number to Indian Rupees (INR)
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format ISO date string to readable date (e.g. 13 Jun 2026)
 */
export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format ISO date string to readable date and time (e.g. 13 Jun 2026, 01:09 PM)
 */
export function formatDateTime(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format ISO date string to relative time (e.g. "3 days ago", "in 2 hours", "Just now")
 */
export function formatRelative(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) {
    return "Just now";
  }
  
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
  if (Math.abs(diffDays) >= 1) {
    return formatter.format(diffDays, "day");
  } else if (Math.abs(diffHours) >= 1) {
    return formatter.format(diffHours, "hour");
  } else {
    return formatter.format(diffMins, "minute");
  }
}
