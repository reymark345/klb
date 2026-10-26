import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    onValueChange: (val: string) => void;
}

export function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export function TabsList({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            role="tablist"
            className={cn(
                'inline-flex items-center gap-1 rounded-xl bg-muted/80 p-1 text-muted-foreground border border-border/60',
                className
            )}
            {...props}
        />
    );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx?.value === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => ctx?.onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none',
                isActive
                    ? 'bg-card text-primary shadow-xs ring-1 ring-border/80'
                    : 'text-muted-foreground hover:text-foreground',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const ctx = React.useContext(TabsContext);
    if (ctx?.value !== value) return null;

    return (
        <div role="tabpanel" className={cn('mt-3 focus:outline-none', className)} {...props}>
            {children}
        </div>
    );
}

