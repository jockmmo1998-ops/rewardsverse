import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center gap-4 mb-6', className)}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-1 min-w-0"
      >
        <h1 className="font-heading font-bold text-xl md:text-2xl text-foreground text-balance">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 text-pretty">{subtitle}</p>}
      </motion.div>
      {children && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
          className="flex items-center gap-2 shrink-0"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
