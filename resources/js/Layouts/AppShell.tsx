import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Bell,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Compass,
    ExternalLink,
    Globe,
    Image as ImageIcon,
    LayoutDashboard,
    Lock,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    ShieldCheck,
    Sparkles,
    Sun,
    Users,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { SharedPageProps } from '@/types';

export type AdminSectionId =
    | 'overview'
    | 'cms-images'
    | 'cms-pages'
    | 'members'
    | 'rbac'
    | 'audit';

export interface ToastNotice {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
}

interface AppShellProps {
    activeSection: AdminSectionId;
    onNavigate: (section: AdminSectionId, filterPage?: string) => void;
    globalSearch: string;
    onGlobalSearchChange: (q: string) => void;
    toast: ToastNotice | null;
    onDismissToast: () => void;
    children: React.ReactNode;
}

interface NavGroup {
    id: string;
    label: string;
    items: {
        id: AdminSectionId;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        count?: number;
        badgeColor?: 'default' | 'success' | 'warning';
        subFilter?: string;
    }[];
}

export default function AppShell({
    activeSection,
    onNavigate,
    globalSearch,
    onGlobalSearchChange,
    toast,
    onDismissToast,
    children,
}: AppShellProps) {
    const { auth, counts, flash } = usePage<SharedPageProps>().props;
    const user = auth?.user;

    // Collapsible Left Sidebar with persistent localStorage state
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('klb_sidebar_collapsed') === 'true';
    });

    // Dark / Light Mode with persistent localStorage state
    const [darkMode, setDarkMode] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('klb_theme_dark') === 'true';
    });

    // Collapsible navigation groups state
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
        cms: true,
        ministry: true,
        governance: true,
    });

    // Header popovers & Command Palette
    const [notifOpen, setNotifOpen] = React.useState(false);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [cmdPaletteOpen, setCmdPaletteOpen] = React.useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const [unreadNotifications, setUnreadNotifications] = React.useState([
        {
            id: 'n1',
            type: 'info',
            title: 'Landing Page Hero Image Active',
            description: '23 visitor visual slots published across Landing Page & About Us.',
            time: '5m ago',
            unread: true,
            target: 'cms-images' as AdminSectionId,
        },
        {
            id: 'n2',
            type: 'warning',
            title: 'Water Baptism Candidates Ready',
            description: '2 new believers scheduled for Masao Beach Baptism on Nov 8.',
            time: '24m ago',
            unread: true,
            target: 'members' as AdminSectionId,
        },
        {
            id: 'n3',
            type: 'warning',
            title: 'RBAC Visual Studio Guard Enabled',
            description: 'Primary Admin & Admin roles authorized to update all visitor images.',
            time: '1h ago',
            unread: false,
            target: 'rbac' as AdminSectionId,
        },
    ]);

    React.useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', darkMode);
            window.localStorage.setItem('klb_theme_dark', String(darkMode));
        }
    }, [darkMode]);

    const toggleSidebar = React.useCallback(() => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('klb_sidebar_collapsed', String(next));
            }
            return next;
        });
    }, []);

    // Keyboard shortcuts: Ctrl+B (Sidebar Collapse) & Ctrl+K (Global Search)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebar();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCmdPaletteOpen((prev) => !prev);
                requestAnimationFrame(() => searchInputRef.current?.focus());
            } else if (e.key === 'Escape') {
                setCmdPaletteOpen(false);
                setNotifOpen(false);
                setProfileOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    const navGroups: NavGroup[] = [
        {
            id: 'cms',
            label: 'Visitor Website & Media',
            items: [
                {
                    id: 'overview',
                    label: 'Executive Overview',
                    icon: LayoutDashboard,
                },
                {
                    id: 'cms-images',
                    label: 'Visual Image Studio',
                    icon: ImageIcon,
                    count: counts?.cms_images ?? 23,
                    badgeColor: 'default',
                },
                {
                    id: 'cms-pages',
                    label: 'Landing & About CMS',
                    icon: BookOpen,
                    count: counts?.cms_items ?? 23,
                    badgeColor: 'success',
                },
            ],
        },
        {
            id: 'ministry',
            label: 'Ministry & People',
            items: [
                {
                    id: 'members',
                    label: 'Members & Life Groups',
                    icon: Users,
                    count: counts?.members ?? 14,
                    badgeColor: 'default',
                },
            ],
        },
        {
            id: 'governance',
            label: 'Enterprise Governance',
            items: [
                {
                    id: 'rbac',
                    label: 'Roles & Permissions',
                    icon: ShieldCheck,
                    count: counts?.users ?? 5,
                    badgeColor: 'warning',
                },
                {
                    id: 'audit',
                    label: 'Security Audit Trail',
                    icon: Activity,
                    count: counts?.audit_logs ?? 4,
                    badgeColor: 'default',
                },
            ],
        },
    ];

    const sectionMeta: Record<AdminSectionId, { group: string; title: string; subtitle: string }> = {
        overview: {
            group: 'Visitor Website & Media',
            title: 'Executive Command & CMS Overview',
            subtitle: 'Kingdom Life Butuan (KLB) • Real-Time Ministry & Website Telemetry',
        },
        'cms-images': {
            group: 'Visitor Website & Media',
            title: 'Visual Image & Banner Studio',
            subtitle: 'Update every photograph, hero backdrop, pastor portrait, and banner seen by visitors',
        },
        'cms-pages': {
            group: 'Visitor Website & Media',
            title: 'Page Content & Section Matrix',
            subtitle: 'Manage Landing Page, About Us, Ministries, Sermons, Events, and Gallery blocks',
        },
        members: {
            group: 'Ministry & People',
            title: 'Church Members & Life Groups Data Table',
            subtitle: 'Inline editing, batch selection, CSV/Excel import & export, and print-ready reports',
        },
        rbac: {
            group: 'Enterprise Governance',
            title: 'Roles, Permissions & Operator Accounts',
            subtitle: 'Granular module matrix for Primary Admin, Admin, and Staff/Analyst roles',
        },
        audit: {
            group: 'Enterprise Governance',
            title: 'Enterprise Security & Audit Trail',
            subtitle: 'Immutable log of all CMS image updates, record edits, imports, exports, and RBAC changes',
        },
    };

    const currentMeta = sectionMeta[activeSection];
    const unreadCount = unreadNotifications.filter((n) => n.unread).length;

    const handleRoleSwitch = (role: string) => {
        router.post(
            '/admin/switch-user',
            { role },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProfileOpen(false);
                },
            }
        );
    };

    const activeBanner =
        toast ||
        (flash?.error
            ? { id: 'flash-err', type: 'error' as const, title: 'Action Blocked', message: flash.error }
            : flash?.warning
              ? { id: 'flash-warn', type: 'warning' as const, title: 'Security Notice', message: flash.warning }
              : flash?.success
                ? { id: 'flash-ok', type: 'success' as const, title: 'Changes Saved', message: flash.success }
                : null);

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Collapsible Left Sidebar */}
            <aside
                className={cn(
                    'no-print sticky top-0 h-screen shrink-0 border-r border-border/80 bg-card/95 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 z-30',
                    sidebarCollapsed ? 'w-[74px]' : 'w-[276px]'
                )}
            >
                {/* Top Brand + Role/Network Badge + Nav Groups */}
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between gap-2.5 border-b border-border/80 px-4 h-16 shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src="/images/klb_logo.png"
                                alt="Kingdom Life Butuan Logo"
                                className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-border/60"
                            />
                            {!sidebarCollapsed && (
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold tracking-tight text-sm text-foreground truncate">
                                            KLB Butuan
                                        </span>
                                        <span className="rounded-md bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary ring-1 ring-inset ring-primary/25">
                                            CMS v4.2
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        Kingdom Life Butuan Church
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            title="Toggle Sidebar (Ctrl+B)"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                            {sidebarCollapsed ? (
                                <PanelLeftOpen className="h-4 w-4" />
                            ) : (
                                <PanelLeftClose className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* User Role & Network Status Badge */}
                    <div className="px-3 py-3 border-b border-border/70 shrink-0">
                        {sidebarCollapsed ? (
                            <div
                                title={`${user?.role ?? 'Primary Admin'} • Butuan Sanctuary Node`}
                                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-muted/60 p-2 ring-1 ring-inset ring-border/80"
                            >
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-mono text-[9px] font-bold text-primary">
                                    {user?.role === 'Primary Admin'
                                        ? 'P-ADM'
                                        : user?.role === 'Admin'
                                          ? 'ADMIN'
                                          : 'STAFF'}
                                </span>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-gradient-to-br from-primary/8 via-card to-accent/30 p-3 ring-1 ring-inset ring-border/80">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {user?.role ?? 'Primary Admin'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        BXU-LIVE
                                    </span>
                                </div>
                                <div className="mt-1.5 text-xs font-medium text-foreground truncate">
                                    {user?.name ?? 'Pastor Joshua Valdehueza'}
                                </div>
                                <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span className="truncate">{user?.department ?? 'Executive Leadership'}</span>
                                    <span className="font-mono text-[10px]">Ctrl+B</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collapsible Navigation Groups */}
                    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                        {navGroups.map((group) => {
                            const isOpen = openGroups[group.id] ?? true;
                            return (
                                <div key={group.id} className="space-y-1">
                                    {!sidebarCollapsed && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenGroups((prev) => ({
                                                    ...prev,
                                                    [group.id]: !isOpen,
                                                }))
                                            }
                                            className="flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            <span>{group.label}</span>
                                            {isOpen ? (
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}

                                    {(isOpen || sidebarCollapsed) && (
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const active = activeSection === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        title={sidebarCollapsed ? item.label : undefined}
                                                        onClick={() => onNavigate(item.id, item.subFilter)}
                                                        className={cn(
                                                            'group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer',
                                                            active
                                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                                : 'text-foreground/80 hover:bg-muted/80 hover:text-foreground'
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <Icon
                                                                className={cn(
                                                                    'h-4 w-4 shrink-0',
                                                                    active
                                                                        ? 'text-primary-foreground'
                                                                        : 'text-muted-foreground group-hover:text-primary'
                                                                )}
                                                            />
                                                            {!sidebarCollapsed && (
                                                                <span className="truncate">{item.label}</span>
                                                            )}
                                                        </div>

                                                        {!sidebarCollapsed && item.count !== undefined && (
                                                            <span
                                                                className={cn(
                                                                    'rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ring-1 ring-inset',
                                                                    active
                                                                        ? 'bg-white/20 text-white ring-white/30'
                                                                        : item.badgeColor === 'warning'
                                                                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25'
                                                                          : item.badgeColor === 'success'
                                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25'
                                                                            : 'bg-primary/10 text-primary dark:text-sky-300 ring-primary/25'
                                                                )}
                                                            >
                                                                {item.count}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Quick Link to Live Visitor Website */}
                <div className="border-t border-border/80 p-3 shrink-0 space-y-2">
                    <Link
                        href="/"
                        className={cn(
                            'flex items-center justify-center gap-2 rounded-xl bg-accent/80 px-3 py-2.5 text-xs font-semibold text-accent-foreground ring-1 ring-inset ring-primary/20 hover:bg-accent transition-colors',
                            sidebarCollapsed && 'px-0'
                        )}
                        title="Open Public Visitor Website"
                    >
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        {!sidebarCollapsed && (
                            <>
                                <span className="truncate">View Visitor Website</span>
                                <ExternalLink className="h-3.5 w-3.5 ml-auto shrink-0 opacity-70" />
                            </>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Sticky Top Header */}
                <header className="no-print sticky top-0 z-20 h-16 border-b border-border/80 bg-card/85 backdrop-blur-xl px-6 flex items-center justify-between gap-4">
                    {/* Left: Breadcrumbs */}
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            KLB Admin
                        </span>
                        <ChevronRight className="hidden md:inline h-3.5 w-3.5 text-muted-foreground" />
                        <span className="hidden sm:inline text-xs text-muted-foreground truncate">
                            {currentMeta.group}
                        </span>
                        <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground truncate">
                            {currentMeta.title}
                        </span>
                    </div>

                    {/* Right: Global Search (Ctrl+K), Role Switcher, Dark Mode, Notification Bell, User Dropdown */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* Global Search Input */}
                        <div className="relative hidden lg:block w-64 xl:w-72">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={globalSearch}
                                onChange={(e) => onGlobalSearchChange(e.target.value)}
                                placeholder="Search images, pages, members..."
                                className="h-9 w-full rounded-xl border border-border/80 bg-background/80 pl-8 pr-14 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                            />
                            {globalSearch ? (
                                <button
                                    type="button"
                                    onClick={() => onGlobalSearchChange('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    Ctrl+K
                                </kbd>
                            )}
                        </div>

                        {/* Instant RBAC Role Switcher Pill for testing Admin vs Staff */}
                        <div className="hidden xl:flex items-center rounded-xl border border-border/80 bg-muted/60 p-0.5">
                            {(['Primary Admin', 'Admin', 'Staff/Analyst'] as const).map((r) => {
                                const isCurrent = (user?.role ?? 'Primary Admin') === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleRoleSwitch(r)}
                                        title={`Switch active session to ${r}`}
                                        className={cn(
                                            'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                                            isCurrent
                                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {r}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dark / Light Mode Toggle */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDarkMode((d) => !d)}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? (
                                <Sun className="h-4 w-4 text-amber-400" />
                            ) : (
                                <Moon className="h-4 w-4 text-slate-700" />
                            )}
                        </Button>

                        {/* Notification Bell Popover */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setNotifOpen((o) => !o);
                                    setProfileOpen(false);
                                }}
                                title="System & Ministry Alerts"
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/90 bg-popover p-4 text-popover-foreground shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                KLB Operations & Alerts
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground">
                                                Real-time CMS & Ministry notifications
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setUnreadNotifications((prev) =>
                                                    prev.map((n) => ({ ...n, unread: false }))
                                                )
                                            }
                                            className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                                        >
                                            Mark all read
                                        </button>
                                    </div>

                                    <div className="mt-2.5 space-y-2 max-h-72 overflow-y-auto">
                                        {unreadNotifications.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    setUnreadNotifications((prev) =>
                                                        prev.map((n) =>
                                                            n.id === item.id ? { ...n, unread: false } : n
                                                        )
                                                    );
                                                    onNavigate(item.target);
                                                    setNotifOpen(false);
                                                }}
                                                className={cn(
                                                    'flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer',
                                                    item.unread
                                                        ? 'bg-primary/8 hover:bg-primary/12 ring-1 ring-inset ring-primary/20'
                                                        : 'hover:bg-muted/70'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                                        item.type === 'warning'
                                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                                            : 'bg-primary/15 text-primary'
                                                    )}
                                                >
                                                    {item.type === 'warning' ? (
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-semibold text-foreground truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                                            {item.time}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen((o) => !o);
                                    setNotifOpen(false);
                                }}
                                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card px-2.5 py-1.5 text-left hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                <img
                                    src={
                                        user?.avatar_url ||
                                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                                    }
                                    alt={user?.name || 'Admin'}
                                    className="h-7 w-7 rounded-lg object-cover ring-1 ring-border"
                                />
                                <div className="hidden sm:block min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                                        {user?.name ?? 'RN Valdehueza (Primary Admin)'}
                                    </div>
                                    <div className="text-[10px] font-medium text-primary truncate">
                                        {user?.role ?? 'Primary Admin'}
                                    </div>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/90 bg-popover p-3 text-popover-foreground shadow-xl z-50">
                                    <div className="border-b border-border/70 pb-2.5">
                                        <div className="text-xs font-bold text-foreground">
                                            {user?.name ?? 'RN Valdehueza (Primary Admin)'}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground truncate">
                                            {user?.email ?? 'joshua@klbbutuan.org'}
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <Badge variant="default">{user?.role ?? 'Primary Admin'}</Badge>
                                            {user?.can_edit_content && (
                                                <Badge variant="success">Can Edit CMS</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="py-2 space-y-1">
                                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Switch Operator Role (RBAC Demo)
                                        </div>
                                        {(['Primary Admin', 'Admin', 'Content Creator', 'Staff/Analyst'] as const).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => handleRoleSwitch(r)}
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer',
                                                    user?.role === r
                                                        ? 'bg-primary/12 font-semibold text-primary'
                                                        : 'hover:bg-muted'
                                                )}
                                            >
                                                <span>{r}</span>
                                                {user?.role === r && (
                                                    <span className="font-mono text-[10px]">Active</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-border/70 pt-2 space-y-1">
                                        <Link
                                            href="/register"
                                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                                        >
                                            <span>Register Personal Info / Login</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                        <Link
                                            href="/"
                                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                                        >
                                            <span>Open Visitor Landing Page</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => router.post('/logout')}
                                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                        >
                                            <span>Sign Out</span>
                                            <Lock className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Toast / Status Notice Banner for Instant User Feedback */}
                {activeBanner && (
                    <div className="no-print px-6 pt-4">
                        <div
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs shadow-xs transition-all',
                                activeBanner.type === 'error'
                                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                                    : activeBanner.type === 'warning'
                                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                            )}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                {activeBanner.type === 'error' ? (
                                    <Lock className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                ) : activeBanner.type === 'warning' ? (
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <div className="min-w-0">
                                    <span className="font-bold mr-1.5">{activeBanner.title}:</span>
                                    <span>{activeBanner.message}</span>
                                </div>
                            </div>
                            {toast && (
                                <button
                                    type="button"
                                    onClick={onDismissToast}
                                    className="rounded-lg p-1 hover:bg-black/10 cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Workspace Body */}
                <main className="flex-1 p-6 print-container">{children}</main>
            </div>

            {/* Global Ctrl+K Command Palette Modal */}
            {cmdPaletteOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs pt-20 px-4"
                    onClick={() => setCmdPaletteOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                            <Search className="h-4 w-4 text-primary" />
                            <input
                                type="text"
                                autoFocus
                                value={globalSearch}
                                onChange={(e) => onGlobalSearchChange(e.target.value)}
                                placeholder="Jump to any CMS image slot, visitor page, member, or RBAC setting..."
                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                ESC
                            </kbd>
                        </div>
                        <div className="mt-3 space-y-1">
                            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Quick Navigation
                            </div>
                            {[
                                {
                                    id: 'cms-images' as AdminSectionId,
                                    label: 'Visual Image Studio — Replace Landing Page & About Us Images',
                                    badge: 'CMS Images',
                                },
                                {
                                    id: 'cms-pages' as AdminSectionId,
                                    label: 'Visitor Page Content Matrix (Landing, About Us, Ministries, Sermons)',
                                    badge: 'Pages',
                                },
                                {
                                    id: 'members' as AdminSectionId,
                                    label: 'Church Members & Life Groups Directory (Inline Edit / CSV / Print)',
                                    badge: 'Data Table',
                                },
                                {
                                    id: 'rbac' as AdminSectionId,
                                    label: 'RolesPermissionsView — Primary Admin, Admin & Staff/Analyst Matrix',
                                    badge: 'RBAC',
                                },
                                {
                                    id: 'audit' as AdminSectionId,
                                    label: 'Enterprise Security & Audit Trail Logs',
                                    badge: 'Audit',
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setCmdPaletteOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <span className="font-medium text-foreground">{item.label}</span>
                                    <Badge variant="mono">{item.badge}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

