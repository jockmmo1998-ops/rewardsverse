import { Sun } from 'lucide-react';

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Light theme enabled"
      title="Light theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm"
    >
      <Sun className="h-4 w-4" />
    </button>
  );
}
