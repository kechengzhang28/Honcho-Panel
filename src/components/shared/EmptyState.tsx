import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
        <Icon className="h-6 w-6 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="max-w-sm text-center text-sm text-[var(--color-text-secondary)]">{description}</p>
      {action && (
        <Button variant="default" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
