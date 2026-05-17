interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Coming soon</p>
      </div>
    </div>
  );
}
