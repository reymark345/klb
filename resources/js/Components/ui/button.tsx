import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.99]',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                outline:
                    'border border-border/80 bg-card text-foreground shadow-xs hover:bg-accent/60 hover:text-accent-foreground',
                ghost:
                    'text-foreground/80 hover:bg-accent/60 hover:text-accent-foreground',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
                subtle:
                    'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/15',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-lg px-3 text-xs',
                lg: 'h-11 rounded-xl px-6 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, type = 'button', ...props }, ref) => {
        return (
            <button
                type={type}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

