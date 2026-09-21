import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/35 hover:bg-muted hover:text-foreground',
        compact ? 'h-9 w-9' : 'h-9 px-3 text-xs font-semibold',
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-primary" />}
      {!compact && <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'} mode</span>}
    </button>
  );
}
