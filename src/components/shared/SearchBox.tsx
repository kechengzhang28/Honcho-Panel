import { type LucideIcon, Search } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface SearchBoxProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  icon: Icon = Search,
  className = "",
  onKeyDown,
}: SearchBoxProps) {
  return (
    <div
      className={`flex w-full max-w-sm items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
      />
    </div>
  );
}
