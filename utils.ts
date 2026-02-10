import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Random number generator for animations
export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;