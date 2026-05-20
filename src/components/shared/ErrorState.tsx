import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  icon: Icon = AlertTriangle,
  error,
  onRetry,
}: ErrorStateProps) {
  const msg =
    description ??
    (error ? getErrorMessage(error) : "An unexpected error occurred. Please try again.");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <Icon className="h-6 w-6 text-[var(--color-destructive)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="max-w-sm text-center text-sm text-[var(--color-text-secondary)]">{msg}</p>
      {onRetry && (
        <Button variant="default" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
