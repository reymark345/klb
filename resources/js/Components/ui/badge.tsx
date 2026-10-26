import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium transition-colors ring-1 ring-inset tabular-nums',
    {
        variants: {
            variant: {
                default:
                    'bg-primary/10 text-primary ring-primary/25 dark:bg-primary/20 dark:text-sky-300 dark:ring-sky-400/30',
                secondary:
                    'bg-secondary text-secondary-foreground ring-border/80',
                success:
                    'bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
                warning:
                    'bg-amber-500/10 text-amber-700 ring-amber-600/25 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
                destructive:
                    'bg-rose-500/10 text-rose-700 ring-rose-600/25 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
                outline:
                    'bg-transparent text-foreground ring-border/80',
                mono:
                    'font-mono bg-muted/80 text-muted-foreground ring-border/80 text-[11px]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };

