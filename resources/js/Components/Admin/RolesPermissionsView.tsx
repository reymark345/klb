import * as React from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    KeyRound,
    Lock,
    MapPin,
    Phone,
    Plus,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserCheck,
    UserPlus,
    X,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { AuthUser, RolePermissionRecord, RoleType } from '@/types';

export interface ManagedUserItem {
    id: number;
    name: string;
    email: string;
    role: RoleType;
    requested_role?: string | null;
    department: string;
    phone?: string | null;
    address?: string | null;
    birthdate?: string | null;
    gender?: string | null;
    ministry?: string | null;
    bio?: string | null;
    status: string;
    approved_by?: string | null;
    approved_at?: string | null;
    avatar_url?: string | null;
    created_at?: string | null;
    last_login_at?: string;
}

interface RolesPermissionsViewProps {
    rolePermissions: RolePermissionRecord[];
    users: ManagedUserItem[];
    currentUser: AuthUser | null;
    onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const ROLE_CARDS: {
    role: RoleType;
    badge: 'default' | 'success' | 'warning';
    canEdit: boolean;
    tagline: string;
    description: string;
}[] = [
    {
        role: 'Primary Admin',
        badge: 'default',
        canEdit: true,
        tagline: 'Owner & Senior Governance (You)',
        description:
            'Unrestricted authority: approves pending Personal Info registrations, assigns Admin or Content Creator roles, and edits all website content & images.',
    },
    {
        role: 'Admin',
        badge: 'success',
        canEdit: true,
        tagline: 'Approved Admin • Can Edit Content & Images',
        description:
            'Approved by Primary Admin. Full privileges to edit and replace every content block and image on the Landing Page, About Us, Ministries, Donations, and Gallery.',
    },
    {
        role: 'Content Creator',
        badge: 'success',
        canEdit: true,
        tagline: 'Approved Creator • Can Edit Content & Images',
        description:
            'Approved by Admin after registering Personal Info. Authorized to update all website content and upload/replace images across all visitor pages.',
    },
    {
        role: 'Staff/Analyst',
        badge: 'warning',
        canEdit: false,
        tagline: 'Other Role • Cannot Edit Content or Images',
        description:
            'Restricted from editing website content or replacing visitor images. Can only view records or assist with internal member directories.',
    },
];

export default function RolesPermissionsView({
    rolePermissions,
    users,
    currentUser,
    onNotify,
}: RolesPermissionsViewProps) {
    const [selectedRoleTab, setSelectedRoleTab] = React.useState<RoleType>('Content Creator');
    const [addUserOpen, setAddUserOpen] = React.useState(false);
    const [inspectUser, setInspectUser] = React.useState<ManagedUserItem | null>(null);

    const [newUserForm, setNewUserForm] = React.useState({
        name: '',
        email: '',
        role: 'Content Creator' as RoleType,
        department: 'Digital Media & Communications',
        ministry: 'Media & Creative',
        phone: '+63 917 842 ',
        address: 'Butuan City, Agusan del Norte',
        status: 'Active',
    });

    const canEditRbac =
        currentUser?.role === 'Primary Admin' ||
        currentUser?.role === 'Admin' ||
        Boolean(currentUser?.permissions?.rbac_users?.can_update);

    const pendingUsers = React.useMemo(
        () => users.filter((u) => u.status === 'Pending'),
        [users]
    );

    const roleMatrixRows = React.useMemo(
        () => rolePermissions.filter((r) => r.role_name === selectedRoleTab),
        [rolePermissions, selectedRoleTab]
    );

    const togglePermissionBit = (
        row: RolePermissionRecord,
        field:
            | 'can_view'
            | 'can_create'
            | 'can_update'
            | 'can_delete'
            | 'can_import'
            | 'can_export'
    ) => {
        if (!canEditRbac) {
            onNotify(
                'error',
                'RBAC Locked',
                `Your active role (${currentUser?.role}) cannot modify role permissions. Switch to Primary Admin.`
            );
            return;
        }

        const payload = {
            can_view: row.can_view,
            can_create: row.can_create,
            can_update: row.can_update,
            can_delete: row.can_delete,
            can_import: row.can_import,
            can_export: row.can_export,
            [field]: !row[field],
        };

        router.put(`/admin/role-permissions/${row.id}`, payload, {
            preserveScroll: true,
        });
    };

    const handleApproveUser = (
        targetUser: ManagedUserItem,
        assignRole: 'Admin' | 'Content Creator' | 'Staff/Analyst',
        newStatus: 'Active' | 'Rejected' = 'Active'
    ) => {
        if (!canEditRbac) {
            onNotify(
                'error',
                'Approval Restricted',
                'Only Primary Admin or Admin can approve registrations and assign roles.'
            );
            return;
        }

        router.post(
            `/admin/users/${targetUser.id}/approve`,
            {
                role: assignRole,
                status: newStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (inspectUser?.id === targetUser.id) {
                        setInspectUser(null);
                    }
                },
            }
        );
    };

    const handleUserRoleChange = (targetUser: ManagedUserItem, newRole: string) => {
        if (!canEditRbac) {
            onNotify('error', 'RBAC Locked', 'Switch to Primary Admin to reassign user roles.');
            return;
        }
        router.put(
            `/admin/users/${targetUser.id}`,
            {
                name: targetUser.name,
                role: newRole,
                department: targetUser.department,
                phone: targetUser.phone,
                status: newRole === 'Pending Approval' ? 'Pending' : 'Active',
            },
            { preserveScroll: true }
        );
    };

    const handleUserStatusChange = (targetUser: ManagedUserItem, newStatus: string) => {
        if (!canEditRbac) {
            onNotify('error', 'RBAC Locked', 'Switch to Primary Admin to change user approval status.');
            return;
        }
        const effectiveRole =
            newStatus === 'Active' && targetUser.role === 'Pending Approval'
                ? targetUser.requested_role || 'Content Creator'
                : targetUser.role;

        router.put(
            `/admin/users/${targetUser.id}`,
            {
                name: targetUser.name,
                role: effectiveRole,
                department: targetUser.department,
                phone: targetUser.phone,
                status: newStatus,
            },
            { preserveScroll: true }
        );
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/users', newUserForm, {
            preserveScroll: true,
            onSuccess: () => {
                setAddUserOpen(false);
                setNewUserForm({
                    name: '',
                    email: '',
                    role: 'Content Creator',
                    department: 'Digital Media & Communications',
                    ministry: 'Media & Creative',
                    phone: '+63 917 842 ',
                    address: 'Butuan City, Agusan del Norte',
                    status: 'Active',
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Pending Personal Info Registration Approval Queue */}
            <Card className="border-amber-500/45 bg-gradient-to-br from-amber-500/8 via-card to-card overflow-hidden">
                <CardHeader className="border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base">
                                Personal Info Registration & Admin Approval Queue
                            </CardTitle>
                            <Badge variant={pendingUsers.length > 0 ? 'warning' : 'success'}>
                                <Clock className="h-3 w-3" />
                                {pendingUsers.length} Pending Approval
                            </Badge>
                        </div>
                        <CardDescription className="mt-1">
                            Anyone who wants to log in must first register their <strong>Personal Info</strong> at{' '}
                            <Link href="/register" className="text-primary underline font-semibold">
                                /register
                            </Link>
                            . Review their Personal Info below and approve them as <strong>Admin</strong> or{' '}
                            <strong>Content Creator</strong> so they can log in and edit content &amp; images.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/register"
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Test Registration Page (/register)
                        </Link>
                    </div>
                </CardHeader>

                <CardContent className="p-5">
                    {pendingUsers.length === 0 ? (
                        <div className="rounded-xl border border-border/70 bg-muted/25 p-5 text-center space-y-2">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                            <div className="text-xs font-bold text-foreground">
                                All Registered Personal Info Accounts Have Been Reviewed!
                            </div>
                            <p className="text-xs text-muted-foreground">
                                When a new user registers their Personal Info on the{' '}
                                <Link href="/register" className="text-primary underline">
                                    Registration Page
                                </Link>
                                , their application will appear here for your approval.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {pendingUsers.map((pending) => (
                                <div
                                    key={pending.id}
                                    className="rounded-2xl border border-amber-500/40 bg-card p-5 shadow-sm space-y-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    pending.avatar_url ||
                                                    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
                                                }
                                                alt={pending.name}
                                                className="h-11 w-11 rounded-xl object-cover ring-2 ring-amber-500/40"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-extrabold text-foreground">
                                                        {pending.name}
                                                    </span>
                                                    <Badge variant="warning">Pending Approval</Badge>
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {pending.email}
                                                </div>
                                            </div>
                                        </div>

                                        <Badge variant="default">
                                            Requested: {pending.requested_role || 'Content Creator'}
                                        </Badge>
                                    </div>

                                    {/* Personal Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl bg-muted/40 p-3.5 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-semibold text-foreground truncate">
                                                {pending.phone || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="text-muted-foreground">Birthdate:</span>
                                            <span className="font-semibold text-foreground">
                                                {pending.birthdate || 'N/A'}{' '}
                                                {pending.gender ? `(${pending.gender})` : ''}
                                            </span>
                                        </div>
                                        <div className="sm:col-span-2 flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="text-muted-foreground">Address:</span>
                                            <span className="font-semibold text-foreground">
                                                {pending.address || 'Butuan City'}
                                            </span>
                                        </div>
                                        <div className="sm:col-span-2 flex items-center gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="text-muted-foreground">Ministry / Dept:</span>
                                            <span className="font-semibold text-foreground">
                                                {pending.ministry || pending.department} • {pending.department}
                                            </span>
                                        </div>
                                        {pending.bio && (
                                            <div className="sm:col-span-2 pt-1 border-t border-border/60 text-[11px] text-muted-foreground italic">
                                                "{pending.bio}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Approval & Role Assignment Buttons */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                            Approve &amp; Assign Role to Allow Login:
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleApproveUser(pending, 'Content Creator', 'Active')
                                                }
                                                disabled={!canEditRbac}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Approve as Content Creator
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleApproveUser(pending, 'Admin', 'Active')
                                                }
                                                disabled={!canEditRbac}
                                                className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                                            >
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Approve as Admin
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleApproveUser(pending, 'Staff/Analyst', 'Rejected')
                                                }
                                                disabled={!canEditRbac}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 4 Role Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {ROLE_CARDS.map((card) => {
                    const isSelected = selectedRoleTab === card.role;
                    const count = users.filter((u) => u.role === card.role).length;
                    return (
                        <div
                            key={card.role}
                            onClick={() => setSelectedRoleTab(card.role)}
                            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
                                isSelected
                                    ? 'border-primary bg-primary/6 shadow-sm ring-2 ring-primary/20'
                                    : 'border-border/80 bg-card hover:border-primary/40'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <Badge variant={card.badge}>
                                    <ShieldCheck className="h-3 w-3" />
                                    {card.role}
                                </Badge>
                                <span className="font-mono text-xs font-semibold text-muted-foreground">
                                    {count} {count === 1 ? 'User' : 'Users'}
                                </span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-foreground">
                                {card.tagline}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {card.description}
                            </p>
                            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">Website Content &amp; Images:</span>
                                {card.canEdit ? (
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        ✓ Can Edit Content &amp; Images
                                    </span>
                                ) : (
                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                        ✕ Cannot Edit
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Granular Module Permission Matrix */}
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/70 bg-muted/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle>
                                Granular Module Permissions Matrix — {selectedRoleTab}
                            </CardTitle>
                            {canEditRbac ? (
                                <Badge variant="success">Interactive Matrix</Badge>
                            ) : (
                                <Badge variant="warning">
                                    <Lock className="h-3 w-3" /> Read-Only ({currentUser?.role})
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="mt-1">
                            Both <strong>Admin</strong> and <strong>Content Creator</strong> (along with{' '}
                            <strong>Primary Admin</strong>) have full permission to edit website content and images. Any other role cannot edit content or images.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/80 bg-card p-1">
                        {(
                            [
                                'Primary Admin',
                                'Admin',
                                'Content Creator',
                                'Staff/Analyst',
                            ] as const
                        ).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setSelectedRoleTab(r)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                    selectedRoleTab === r
                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Enterprise Module</TableHead>
                                <TableHead className="text-center">View</TableHead>
                                <TableHead className="text-center">Create</TableHead>
                                <TableHead className="text-center">
                                    Update Content / Replace Image
                                </TableHead>
                                <TableHead className="text-center">Delete</TableHead>
                                <TableHead className="text-center">CSV Import</TableHead>
                                <TableHead className="text-center">CSV Export</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roleMatrixRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <div className="font-semibold text-xs text-foreground">
                                            {row.module_label}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {row.module_description}
                                        </div>
                                    </TableCell>
                                    {(
                                        [
                                            'can_view',
                                            'can_create',
                                            'can_update',
                                            'can_delete',
                                            'can_import',
                                            'can_export',
                                        ] as const
                                    ).map((permField) => (
                                        <TableCell key={permField} className="text-center">
                                            <div className="inline-flex justify-center">
                                                <Checkbox
                                                    checked={row[permField]}
                                                    disabled={!canEditRbac}
                                                    onCheckedChange={() =>
                                                        togglePermissionBit(row, permField)
                                                    }
                                                    aria-label={`${row.module_label} ${permField}`}
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* User Management & Operator Session Switcher */}
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/70 bg-muted/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle>
                            Registered Accounts, Personal Info &amp; Role Assignment
                        </CardTitle>
                        <CardDescription className="mt-1">
                            View Personal Info of registered users, approve pending accounts, assign{' '}
                            <code>Primary Admin</code>, <code>Admin</code>, or <code>Content Creator</code>, or switch active session.
                        </CardDescription>
                    </div>
                    {canEditRbac && (
                        <Button size="sm" onClick={() => setAddUserOpen(true)}>
                            <UserPlus className="h-3.5 w-3.5" />
                            Add Approved Account
                        </Button>
                    )}
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Registered User</TableHead>
                                <TableHead>Personal Info Summary</TableHead>
                                <TableHead>Approval Status</TableHead>
                                <TableHead>Assigned Role</TableHead>
                                <TableHead>Content &amp; Image Permission</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => {
                                const isActiveSession = currentUser?.id === u.id;
                                const canEditWebsite =
                                    u.status === 'Active' &&
                                    (u.role === 'Primary Admin' ||
                                        u.role === 'Admin' ||
                                        u.role === 'Content Creator');
                                return (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <img
                                                    src={
                                                        u.avatar_url ||
                                                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                                                    }
                                                    alt={u.name}
                                                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-border"
                                                />
                                                <div>
                                                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                        {u.name}
                                                        {isActiveSession && (
                                                            <Badge variant="default">You (Active)</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-muted-foreground">
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs text-foreground font-medium">
                                                {u.phone || '+63 917 842 1000'} • {u.ministry || u.department}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                                                {u.address || 'Butuan City'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-36">
                                                <Select
                                                    size="sm"
                                                    value={u.status}
                                                    disabled={!canEditRbac}
                                                    clearable={false}
                                                    searchable={false}
                                                    onValueChange={(val) =>
                                                        handleUserStatusChange(u, val)
                                                    }
                                                    options={[
                                                        { value: 'Active', label: 'Approved (Active)' },
                                                        { value: 'Pending', label: 'Pending Approval' },
                                                        { value: 'Suspended', label: 'Suspended' },
                                                    ]}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-44">
                                                <Select
                                                    size="sm"
                                                    value={u.role}
                                                    disabled={!canEditRbac}
                                                    clearable={false}
                                                    searchable={false}
                                                    onValueChange={(val) =>
                                                        handleUserRoleChange(u, val)
                                                    }
                                                    options={[
                                                        {
                                                            value: 'Primary Admin',
                                                            label: 'Primary Admin',
                                                        },
                                                        { value: 'Admin', label: 'Admin' },
                                                        {
                                                            value: 'Content Creator',
                                                            label: 'Content Creator',
                                                        },
                                                        {
                                                            value: 'Staff/Analyst',
                                                            label: 'Staff/Analyst (No Edit)',
                                                        },
                                                        {
                                                            value: 'Pending Approval',
                                                            label: 'Pending Approval',
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {canEditWebsite ? (
                                                <Badge variant="success">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Can Edit Content &amp; Images
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning">
                                                    <Lock className="h-3 w-3" />
                                                    Cannot Edit Content/Images
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setInspectUser(u)}
                                                    title="View Registered Personal Info"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Personal Info
                                                </Button>

                                                {u.status === 'Pending' ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleApproveUser(
                                                                u,
                                                                (u.requested_role as
                                                                    | 'Admin'
                                                                    | 'Content Creator') ||
                                                                    'Content Creator',
                                                                'Active'
                                                            )
                                                        }
                                                        disabled={!canEditRbac}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Approve Login
                                                    </Button>
                                                ) : isActiveSession ? (
                                                    <Badge variant="success">Active</Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.post(
                                                                '/admin/switch-user',
                                                                { user_id: u.id },
                                                                { preserveScroll: true }
                                                            )
                                                        }
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                        Switch Session
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Inspect Personal Info Modal */}
            {inspectUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                    onClick={() => setInspectUser(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h3 className="text-base font-bold text-foreground">
                                    Registered Personal Information
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Account details for {inspectUser.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectUser(null)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Full Name</div>
                                <div className="font-bold text-foreground mt-0.5">
                                    {inspectUser.name}
                                </div>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Email Address</div>
                                <div className="font-mono font-bold text-foreground mt-0.5">
                                    {inspectUser.email}
                                </div>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Mobile Number</div>
                                <div className="font-bold text-foreground mt-0.5">
                                    {inspectUser.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Birthdate &amp; Gender</div>
                                <div className="font-bold text-foreground mt-0.5">
                                    {inspectUser.birthdate || 'N/A'}{' '}
                                    {inspectUser.gender ? `• ${inspectUser.gender}` : ''}
                                </div>
                            </div>
                            <div className="col-span-2 rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Home Address</div>
                                <div className="font-bold text-foreground mt-0.5">
                                    {inspectUser.address || 'Butuan City'}
                                </div>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Ministry / Department</div>
                                <div className="font-bold text-foreground mt-0.5">
                                    {inspectUser.ministry || inspectUser.department}
                                </div>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-3">
                                <div className="text-muted-foreground">Current Role &amp; Status</div>
                                <div className="font-bold text-primary mt-0.5">
                                    {inspectUser.role} ({inspectUser.status})
                                </div>
                            </div>
                            {inspectUser.bio && (
                                <div className="col-span-2 rounded-xl bg-muted/40 p-3">
                                    <div className="text-muted-foreground">Personal Bio / Note</div>
                                    <div className="text-foreground mt-0.5">{inspectUser.bio}</div>
                                </div>
                            )}
                        </div>

                        {canEditRbac && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Quick Role &amp; Approval Action:
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleApproveUser(
                                                inspectUser,
                                                'Content Creator',
                                                'Active'
                                            )
                                        }
                                    >
                                        Approve as Content Creator
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleApproveUser(inspectUser, 'Admin', 'Active')
                                        }
                                    >
                                        Approve as Admin
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Operator Modal */}
            {addUserOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                    onClick={() => setAddUserOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-base font-bold text-foreground">
                                Create Approved KLB Account
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAddUserOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold">Full Name</label>
                                <Input
                                    required
                                    value={newUserForm.name}
                                    onChange={(e) =>
                                        setNewUserForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="Ptr. Daniel Agusan"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold">Church Email</label>
                                <Input
                                    type="email"
                                    required
                                    value={newUserForm.email}
                                    onChange={(e) =>
                                        setNewUserForm((f) => ({ ...f, email: e.target.value }))
                                    }
                                    placeholder="daniel@klbbutuan.org"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Role</label>
                                    <Select
                                        value={newUserForm.role}
                                        onValueChange={(val) =>
                                            setNewUserForm((f) => ({
                                                ...f,
                                                role: val as RoleType,
                                            }))
                                        }
                                        clearable={false}
                                        searchable={false}
                                        options={[
                                            { value: 'Primary Admin', label: 'Primary Admin' },
                                            { value: 'Admin', label: 'Admin' },
                                            { value: 'Content Creator', label: 'Content Creator' },
                                            { value: 'Staff/Analyst', label: 'Staff/Analyst' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Department</label>
                                    <Input
                                        value={newUserForm.department}
                                        onChange={(e) =>
                                            setNewUserForm((f) => ({
                                                ...f,
                                                department: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Mobile Phone</label>
                                    <Input
                                        value={newUserForm.phone}
                                        onChange={(e) =>
                                            setNewUserForm((f) => ({
                                                ...f,
                                                phone: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Butuan Address</label>
                                    <Input
                                        value={newUserForm.address}
                                        onChange={(e) =>
                                            setNewUserForm((f) => ({
                                                ...f,
                                                address: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddUserOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Account</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
