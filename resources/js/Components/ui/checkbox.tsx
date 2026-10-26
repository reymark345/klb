import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
    checked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    'aria-label'?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    (
        {
            checked = false,
            indeterminate = false,
            onCheckedChange,
            disabled = false,
            className,
            id,
            'aria-label': ariaLabel,
        },
        ref
    ) => {
        const isActive = checked || indeterminate;

        return (
            <button
                ref={ref}
                id={id}
                type="button"
                role="checkbox"
                aria-checked={indeterminate ? 'mixed' : checked}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled && onCheckedChange) {
                        onCheckedChange(!checked);
                    }
                }}
                className={cn(
                    'group relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-150 cursor-pointer select-none',
                    'hover:ring-4 hover:ring-primary/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25',
                    isActive
                        ? 'border-transparent bg-gradient-to-br from-primary via-sky-600 to-cyan-500 text-white shadow-xs'
                        : 'border-border bg-card/90 text-transparent shadow-2xs hover:border-primary/60',
                    disabled && 'cursor-not-allowed opacity-50 hover:ring-0',
                    className
                )}
            >
                {indeterminate ? (
                    <Minus className="h-3 w-3 stroke-[3] text-white" />
                ) : (
                    <Check
                        className={cn(
                            'h-3 w-3 stroke-[3] transition-transform duration-100',
                            checked ? 'scale-100 text-white' : 'scale-0 text-transparent'
                        )}
                    />
                )}
            </button>
        );
    }
);
Checkbox.displayName = 'Checkbox';

