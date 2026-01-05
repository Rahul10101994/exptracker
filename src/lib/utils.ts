import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A simple client-side only unique ID generator
let a = 0;
export function cuid() {
  const time = Date.now().toString(36);
  const random = (++a + Math.random()).toString(36).substring(3, 7);
  return `${time}-${random}`;
}
