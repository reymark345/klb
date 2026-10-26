import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    ExternalLink,
    Globe,
    Image as ImageIcon,
    Layers,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import AppShell, { AdminSectionId, ToastNotice } from '@/Layouts/AppShell';
import VisualImageStudioView from '@/Components/Admin/VisualImageStudioView';
import MembersDataTableView from '@/Components/Admin/MembersDataTableView';
import RolesPermissionsView from '@/Components/Admin/RolesPermissionsView';
import AuditTrailView from '@/Components/Admin/AuditTrailView';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    AuditLogRecord,
    DonationRecord,
    MemberRecord,
    RolePermissionRecord,
    SharedPageProps,
    SiteContent,
} from '@/types';

interface AdminPortalProps {
    initialSection?: string;
    siteContents: SiteContent[];
    members: MemberRecord[];
    users: any[];
    rolePermissions: RolePermissionRecord[];
    auditLogs: AuditLogRecord[];
    donations?: DonationRecord[];
}

export default function Portal({
    initialSection = 'overview',
    siteContents,
    members,
    users,
    rolePermissions,
    auditLogs,
    donations = [],
}: AdminPortalProps) {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth?.user ?? null;

    const [activeSection, setActiveSection] = React.useState<AdminSectionId>(() => {
        const valid: AdminSectionId[] = [
            'overview',
            'cms-images',
            'cms-pages',
            'members',
            'rbac',
            'audit',
        ];
        return valid.includes(initialSection as AdminSectionId)
            ? (initialSection as AdminSectionId)
            : 'overview';
    });

    const [cmsPageFilter, setCmsPageFilter] = React.useState<string>('all');
    const [globalSearch, setGlobalSearch] = React.useState<string>('');
    const [toast, setToast] = React.useState<ToastNotice | null>(null);

    const handleNotify = React.useCallback(
        (
            type: 'success' | 'error' | 'warning' | 'info',
            title: string,
            message: string
        ) => {
            setToast({
                id: String(Date.now()),
                type,
                title,
                message,
            });
        },
        []
    );

    const handleNavigate = (section: AdminSectionId, filterPage?: string) => {
        setActiveSection(section);
        if (filterPage) {
            setCmsPageFilter(filterPage);
        }
    };

    const pageGroups = React.useMemo(() => {
        const pages = [
            {
                name: 'Landing Page',
                desc: 'Hero Sanctuary Backdrop, Pastor Welcome & Vision Banner',
            },
            {
                name: 'About Us',
                desc: 'KLB Butuan Heritage Story, Sanctuary Campus, Senior & Associate Pastors',
            },
            {
                name: 'Ministries',
                desc: 'Worship & Creative, Kingdom Youth, Kids Kingdom & Caraga Outreach',
            },
            {
                name: 'Sermons & Media',
                desc: 'Featured Sermon Series Artwork & Message Study Archives',
            },
            {
                name: 'Events & Gatherings',
                desc: 'Caraga Awakening Conference, Masao Water Baptism & Worship Nights',
            },
            {
                name: 'Global / Branding',
                desc: 'Visitor Fellowship Photo Gallery & Community Highlights',
            },
        ];

        return pages.map((p) => {
            const items = siteContents.filter((c) => c.page === p.name);
            return {
                ...p,
                count: items.length,
                previewImage: items[0]?.image_url,
            };
        });
    }, [siteContents]);

    return (
        <>
            <Head title="Admin Portal & Visual CMS — Kingdom Life Butuan (KLB)" />
            <AppShell
                activeSection={activeSection}
                onNavigate={handleNavigate}
                globalSearch={globalSearch}
                onGlobalSearchChange={setGlobalSearch}
                toast={toast}
                onDismissToast={() => setToast(null)}
            >
                {activeSection === 'overview' && (
                    <div className="space-y-6">
                        {/* Executive Welcome Hero Card */}
                        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/14 via-card to-accent/35 p-6 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="default">
                                            <Sparkles className="h-3 w-3" />
                                            Kingdom Life Butuan • Enterprise Command
                                        </Badge>
                                        <Badge variant="success">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Active Operator: {user?.name} ({user?.role})
                                        </Badge>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                        Welcome to the KLB Butuan Full-Stack CMS & Ministry Portal
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
                                        Manage every photograph, banner, and text block displayed on the{' '}
                                        <strong className="text-foreground">Landing Page</strong>,{' '}
                                        <strong className="text-foreground">About Us</strong>,{' '}
                                        <strong className="text-foreground">Ministries</strong>, and{' '}
                                        <strong className="text-foreground">Events</strong> pages, alongside the Butuan Church Member Registry, RBAC permissions, and Security Audit Trail.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                    <Button
                                        onClick={() => {
                                            setCmsPageFilter('all');
                                            setActiveSection('cms-images');
                                        }}
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        Open Visual Image Studio
                                    </Button>
                                    <Link
                                        href="/"
                                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-xs font-semibold text-foreground shadow-2xs hover:bg-accent/60 transition-colors"
                                    >
                                        <Globe className="h-4 w-4 text-primary" />
                                        Launch Visitor Website
                                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 4 KPI Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <Card
                                onClick={() => setActiveSection('cms-images')}
                                className="p-5 cursor-pointer hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Visitor CMS Image Slots
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline justify-between">
                                    <span className="font-mono text-2xl font-extrabold text-foreground">
                                        {siteContents.length}
                                    </span>
                                    <Badge variant="success">100% Live Editable</Badge>
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    Landing Page, About Us, Pastors, Ministries, Sermons & Gallery
                                </p>
                            </Card>

                            <Card
                                onClick={() => setActiveSection('members')}
                                className="p-5 cursor-pointer hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Registered KLB Leaders & Members
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline justify-between">
                                    <span className="font-mono text-2xl font-extrabold text-foreground">
                                        {members.length}
                                    </span>
                                    <Badge variant="default">6 Butuan Cells</Badge>
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    Inline editable registry with CSV import/export & print
                                </p>
                            </Card>

                            <Card
                                onClick={() => setActiveSection('rbac')}
                                className="p-5 cursor-pointer hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        RBAC & Approval Queue
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline justify-between">
                                    <span className="font-mono text-2xl font-extrabold text-foreground">
                                        4 Roles / {users.length} Users
                                    </span>
                                    <Badge variant="warning">
                                        {users.filter((u) => u.status === 'Pending').length} Pending
                                    </Badge>
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    Primary Admin, Admin & Content Creator can edit CMS & images
                                </p>
                            </Card>

                            <Card
                                onClick={() => setActiveSection('audit')}
                                className="p-5 cursor-pointer hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Enterprise Audit Trail Events
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-400">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline justify-between">
                                    <span className="font-mono text-2xl font-extrabold text-foreground">
                                        {auditLogs.length}
                                    </span>
                                    <Badge variant="mono">Auto-Logged</Badge>
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    Tracks create, update, delete, image upload, import & export
                                </p>
                            </Card>
                        </div>

                        {/* Pending Personal Info Approval Alert & Landing Page Donations Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card className="p-5 border-amber-500/35 bg-amber-500/5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="warning">Personal Info Registration Gate</Badge>
                                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                                                {users.filter((u) => u.status === 'Pending').length} Awaiting Approval
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground">
                                            Approve Registered Users as Admin or Content Creator
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Every new user registers their Personal Info first at <code className="font-mono text-foreground">/register</code>. Approve them in the RBAC queue to let them log in and edit website content &amp; images.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveSection('rbac')}
                                    >
                                        Review Queue →
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="success">Landing Page Generosity</Badge>
                                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {donations.length} Gifts Recorded
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground">
                                            Total Tithes, Offerings &amp; Kingdom Builders Donations: ₱
                                            {donations
                                                .reduce((sum, d) => sum + Number(d.amount || 0), 0)
                                                .toLocaleString()}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Visitors can give via GCash, Maya, Bank Transfer, or In-Person directly on the Landing Page <code className="font-mono text-foreground">#make-donation</code> section.
                                        </p>
                                    </div>
                                    <Link
                                        href="/#make-donation"
                                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-primary hover:bg-muted"
                                    >
                                        View Section →
                                    </Link>
                                </div>
                            </Card>
                        </div>

                        {/* Visitor Website Page-by-Page Image Manager Shortcuts */}
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70">
                                <div>
                                    <CardTitle>
                                        Visitor Website Pages — Click Any Page to Update Its Images & Copy
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Every section visible to visitors on the Kingdom Life Butuan website is organized below for instant visual management.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCmsPageFilter('all');
                                        setActiveSection('cms-images');
                                    }}
                                >
                                    View All {siteContents.length} Visual Slots
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pageGroups.map((pg) => (
                                        <div
                                            key={pg.name}
                                            onClick={() => {
                                                setCmsPageFilter(pg.name);
                                                setActiveSection('cms-images');
                                            }}
                                            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-primary transition-all cursor-pointer shadow-2xs"
                                        >
                                            <div className="relative h-32 w-full overflow-hidden bg-muted">
                                                {pg.previewImage && (
                                                    <img
                                                        src={pg.previewImage}
                                                        alt={pg.name}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
                                                <div className="absolute top-2.5 right-2.5">
                                                    <span className="rounded-lg bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow">
                                                        {pg.count} Images
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-white">
                                                        {pg.name}
                                                    </span>
                                                    <ArrowUpRight className="h-4 w-4 text-sky-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                </div>
                                            </div>
                                            <div className="p-3.5">
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {pg.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Audit Activity Preview */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/70">
                                <div>
                                    <CardTitle>Recent Security & CMS Audit Activity</CardTitle>
                                    <CardDescription className="mt-1">
                                        Latest operator actions recorded across KLB Butuan modules
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveSection('audit')}
                                >
                                    Full Audit Trail →
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2.5">
                                {auditLogs.slice(0, 4).map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2.5 text-xs"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Badge variant="default">{log.action}</Badge>
                                            <span className="font-semibold text-foreground truncate">
                                                {log.target_label}
                                            </span>
                                            <span className="hidden md:inline text-muted-foreground truncate">
                                                — {log.details}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-muted-foreground">
                                            <span>{log.user_name}</span>
                                            <span>•</span>
                                            <span className="text-primary">{log.time_ago}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {(activeSection === 'cms-images' || activeSection === 'cms-pages') && (
                    <VisualImageStudioView
                        contents={siteContents}
                        user={user}
                        globalSearch={globalSearch}
                        initialPageFilter={
                            activeSection === 'cms-pages' && cmsPageFilter === 'all'
                                ? 'About Us'
                                : cmsPageFilter
                        }
                        onNotify={handleNotify}
                    />
                )}

                {activeSection === 'members' && (
                    <MembersDataTableView
                        members={members}
                        user={user}
                        globalSearch={globalSearch}
                        onNotify={handleNotify}
                    />
                )}

                {activeSection === 'rbac' && (
                    <RolesPermissionsView
                        rolePermissions={rolePermissions}
                        users={users}
                        currentUser={user}
                        onNotify={handleNotify}
                    />
                )}

                {activeSection === 'audit' && (
                    <AuditTrailView logs={auditLogs} globalSearch={globalSearch} />
                )}
            </AppShell>
        </>
    );
}

