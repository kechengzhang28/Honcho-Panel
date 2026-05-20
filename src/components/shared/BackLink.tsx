import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

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
