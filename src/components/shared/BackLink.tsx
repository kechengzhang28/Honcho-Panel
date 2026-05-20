import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  children: string;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      to={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
