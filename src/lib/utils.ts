import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 * This is useful for combining Tailwind classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date into a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  // Less than a minute
  if (seconds < 60) {
    return "Just now";
  }

  // Less than an hour
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);

    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);

    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than a week
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Format as date
  return then.toLocaleDateString();
}

/**
 * Truncate a string if it exceeds a certain length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;

  return `${str.substring(0, maxLength - 3)}...`;
}
