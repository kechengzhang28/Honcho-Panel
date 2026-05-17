import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
        success: "bg-green-50 text-green-600",
        warning: "bg-amber-50 text-amber-600",
        destructive: "bg-red-50 text-red-600",
        secondary: "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
