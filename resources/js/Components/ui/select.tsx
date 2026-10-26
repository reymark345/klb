import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string;
    label: string;
    badge?: string;
    description?: string;
}

export interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    clearValue?: string;
    className?: string;
    disabled?: boolean;
    size?: 'sm' | 'default';
}

export function Select({
    value,
    onValueChange,
    options,
    placeholder = 'Select option...',
    searchable = true,
    clearable = true,
    clearValue = '',
    className,
    disabled = false,
    size = 'default',
}: SelectProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [coords, setCoords] = React.useState<{
        top: number;
        left: number;
        width: number;
    }>({ top: 0, left: 0, width: 220 });

    const selectedOption = React.useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value]
    );

    const filteredOptions = React.useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.value.toLowerCase().includes(q) ||
                (opt.description && opt.description.toLowerCase().includes(q))
        );
    }, [options, query]);

    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const estimatedHeight = Math.min(320, filteredOptions.length * 38 + 60);
        const spaceBelow = viewportHeight - rect.bottom;
        const top =
            spaceBelow < estimatedHeight && rect.top > estimatedHeight
                ? rect.top - estimatedHeight - 4
                : rect.bottom + 4;

        setCoords({
            top: Math.max(8, top),
            left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 220) - 12)),
            width: Math.max(rect.width, 220),
        });
    }, [filteredOptions.length]);

    const handleOpenToggle = () => {
        if (disabled) return;
        if (!open) {
            updatePosition();
            setQuery('');
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    React.useEffect(() => {
        if (!open) return;
        updatePosition();
        if (searchable && options.length >= 4) {
            requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
        }

        const handleOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            updatePosition();
        };

        window.addEventListener('mousedown', handleOutside);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('mousedown', handleOutside);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [open, options.length, searchable, updatePosition]);

    const showClear =
        clearable && value !== clearValue && value !== '' && value !== 'all';

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={handleOpenToggle}
                className={cn(
                    'group relative inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-card text-left text-foreground shadow-2xs transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 cursor-pointer select-none',
                    size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm',
                    open && 'border-primary ring-2 ring-ring/25',
                    disabled && 'cursor-not-allowed opacity-50',
                    className
                )}
            >
                <span
                    className={cn(
                        'truncate',
                        !selectedOption && 'text-muted-foreground'
                    )}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <span className="flex items-center gap-1 shrink-0">
                    {showClear && (
                        <span
                            role="button"
                            tabIndex={-1}
                            title="Clear selection"
                            onClick={(e) => {
                                e.stopPropagation();
                                onValueChange(clearValue);
                                setOpen(false);
                            }}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-100',
                            open && 'rotate-180 text-primary'
                        )}
                    />
                </span>
            </button>

            {open &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                            zIndex: 9999,
                        }}
                        className="rounded-xl border border-border/90 bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5"
                    >
                        {searchable && options.length >= 4 && (
                            <div className="flex items-center gap-2 border-b border-border/70 px-2.5 py-2">
                                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Filter options..."
                                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                    No matching options found.
                                </div>
                            ) : (
                                filteredOptions.map((opt) => {
                                    const active = opt.value === value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                onValueChange(opt.value);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer',
                                                active
                                                    ? 'bg-primary/12 font-semibold text-primary dark:bg-primary/20 dark:text-sky-300'
                                                    : 'text-foreground hover:bg-muted/80'
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate">{opt.label}</div>
                                                {opt.description && (
                                                    <div className="truncate text-[10px] text-muted-foreground">
                                                        {opt.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {opt.badge && (
                                                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                        {opt.badge}
                                                    </span>
                                                )}
                                                {active && (
                                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

