import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param {...string[]} inputs - Tailwind class names
 * @returns {string}
 *
 * @see https://github.com/lukeed/clsx
 * @see https://tailwindcss.com/docs
 *
 * This hint enables Tailwind autocomplete in JetBrains IDEs.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
