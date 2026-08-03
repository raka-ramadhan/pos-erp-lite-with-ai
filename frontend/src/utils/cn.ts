import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for optimal className handling
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
