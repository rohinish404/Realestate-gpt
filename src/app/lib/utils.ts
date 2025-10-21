import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    if (price >= 10_000_000) {
        return `₹${(price / 10_000_000).toFixed(2)} Cr`;
    } else if (price >= 100_000) {
        return `₹${(price / 100_000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

export function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}