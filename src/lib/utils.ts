import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if ("status" in error) {
      const apiError = error as { status: number; body?: { detail?: string } };
      return apiError.body?.detail ?? `Server error (${apiError.status})`;
    }
    if (error.message === "Failed to fetch") {
      return "Cannot reach Honcho server. Check the API URL in Settings.";
    }
    return error.message;
  }
  return "An unexpected error occurred.";
}
