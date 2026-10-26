import * as React from 'react';
import { router } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit3,
    FileSpreadsheet,
    Plus,
    Printer,
    Search,
    Trash2,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
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
import { AuthUser, MemberRecord } from '@/types';

interface MembersDataTableViewProps {
    members: MemberRecord[];
    user: AuthUser | null;
    globalSearch: string;
    onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const MINISTRIES = [
    'Worship & Creative',
    'Kingdom Youth',
    'Kids Kingdom',
    'Ushering & Hospitality',
    'Intercessory Prayer',
    'Butuan Outreach & Missions',
    'Media & Broadcast',
];

const LIFE_GROUPS = [
    'Libertad Grace Group',
    'Ampayon Campus Life',
    'Baan Riverside Fellowship',
    'Butuan North Cell',
    'Villa Kananga Connect',
    'Langihan Family Circle',
];

const BAPTISM_STATUSES = ['Water Baptized', 'Scheduled', 'New Believer', 'Transferred'];
const ROLE_TYPES = ['Ministry Leader', 'Cell Leader', 'Active Member', 'Volunteer', 'First-Time Guest'];

export default function MembersDataTableView({
    members,
    user,
    globalSearch,
    onNotify,
}: MembersDataTableViewProps) {
    // Search & Portal Select Filters
    const [localSearch, setLocalSearch] = React.useState('');
    const [ministryFilter, setMinistryFilter] = React.useState('all');
    const [lifeGroupFilter, setLifeGroupFilter] = React.useState('all');
    const [baptismFilter, setBaptismFilter] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');

    // Pagination
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState('10');

    // Batch Selection with Custom Gradient Checkboxes
    const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

    // Inline Editing State
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editDraft, setEditDraft] = React.useState<Partial<MemberRecord>>({});

    // New Member Modal & CSV Import Modal
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [newMember, setNewMember] = React.useState({
        full_name: '',
        email: '',
        phone: '+63 917 ',
        ministry: 'Worship & Creative',
        life_group: 'Libertad Grace Group',
        baptism_status: 'Water Baptized',
        role_type: 'Active Member',
        status: 'Active',
    });

    const csvInputRef = React.useRef<HTMLInputElement>(null);

    const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

    const filteredMembers = React.useMemo(() => {
        return members.filter((m) => {
            if (ministryFilter !== 'all' && m.ministry !== ministryFilter) return false;
            if (lifeGroupFilter !== 'all' && m.life_group !== lifeGroupFilter) return false;
            if (baptismFilter !== 'all' && m.baptism_status !== baptismFilter) return false;
            if (statusFilter !== 'all' && m.status !== statusFilter) return false;

            if (effectiveSearch) {
                return (
                    m.full_name.toLowerCase().includes(effectiveSearch) ||
                    m.member_code.toLowerCase().includes(effectiveSearch) ||
                    (m.email && m.email.toLowerCase().includes(effectiveSearch)) ||
                    m.ministry.toLowerCase().includes(effectiveSearch) ||
                    m.life_group.toLowerCase().includes(effectiveSearch) ||
                    m.role_type.toLowerCase().includes(effectiveSearch)
                );
            }
            return true;
        });
    }, [members, ministryFilter, lifeGroupFilter, baptismFilter, statusFilter, effectiveSearch]);

    const perPage = Math.max(1, parseInt(pageSize, 10) || 10);
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / perPage));
    const currentPage = Math.min(page, totalPages);

    const paginatedMembers = React.useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredMembers.slice(start, start + perPage);
    }, [filteredMembers, currentPage, perPage]);

    const allVisibleSelected =
        paginatedMembers.length > 0 &&
        paginatedMembers.every((m) => selectedIds.includes(m.id));
    const someVisibleSelected =
        paginatedMembers.some((m) => selectedIds.includes(m.id)) && !allVisibleSelected;

    const toggleSelectAllVisible = () => {
        if (allVisibleSelected) {
            const visibleSet = new Set(paginatedMembers.map((m) => m.id));
            setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
        } else {
            const next = new Set(selectedIds);
            paginatedMembers.forEach((m) => next.add(m.id));
            setSelectedIds(Array.from(next));
        }
    };

    const toggleRowSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const startInlineEdit = (member: MemberRecord) => {
        setEditingId(member.id);
        setEditDraft({ ...member });
    };

    const saveInlineEdit = (member: MemberRecord) => {
        router.put(
            `/admin/members/${member.id}`,
            {
                full_name: editDraft.full_name || member.full_name,
                email: editDraft.email ?? member.email,
                phone: editDraft.phone ?? member.phone,
                ministry: editDraft.ministry || member.ministry,
                life_group: editDraft.life_group || member.life_group,
                baptism_status: editDraft.baptism_status || member.baptism_status,
                role_type: editDraft.role_type || member.role_type,
                status: editDraft.status || member.status,
                joined_date: member.joined_date,
                notes: editDraft.notes ?? member.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    onNotify(
                        'success',
                        'Inline Edit Saved',
                        `Updated ${editDraft.full_name || member.full_name} in KLB Registry.`
                    );
                },
            }
        );
    };

    const handleBatchAction = (action: 'delete' | 'status_active' | 'status_visiting' | 'baptized') => {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/members/batch',
            {
                ids: selectedIds,
                action,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                },
            }
        );
    };

    // Export Filtered Records to CSV / Excel
    const handleExportCsv = () => {
        const headers = [
            'Member Code',
            'Full Name',
            'Email',
            'Phone',
            'Ministry',
            'Life Group',
            'Baptism Status',
            'Role Type',
            'Status',
            'Joined Date',
        ];
        const rows = filteredMembers.map((m) => [
            m.member_code,
            `"${(m.full_name || '').replace(/"/g, '""')}"`,
            m.email || '',
            `"${m.phone || ''}"`,
            `"${m.ministry}"`,
            `"${m.life_group}"`,
            `"${m.baptism_status}"`,
            `"${m.role_type}"`,
            m.status,
            m.joined_date || '',
        ]);

        const csvContent =
            '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KLB_Butuan_Members_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        router.post(
            '/admin/export-log',
            {
                module: 'Members & Life Group Registry',
                format: 'CSV / Excel',
                record_count: filteredMembers.length,
            },
            { preserveScroll: true }
        );
    };

    // CSV File Upload Parser & Quick Demo Import
    const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || '');
            const lines = text
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            if (lines.length < 2) {
                onNotify('error', 'Invalid CSV', 'CSV file must contain a header row and at least 1 record.');
                return;
            }

            const parsedRecords = lines.slice(1).map((line) => {
                const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
                return {
                    member_code: cols[0] && cols[0].startsWith('KLB-') ? cols[0] : undefined,
                    full_name: cols[1] || cols[0] || 'New KLB Member',
                    email: cols[2] || 'member@klbbutuan.org',
                    phone: cols[3] || '+63 917 842 9000',
                    ministry: cols[4] || 'Worship & Creative',
                    life_group: cols[5] || 'Libertad Grace Group',
                    baptism_status: cols[6] || 'Water Baptized',
                    role_type: cols[7] || 'Active Member',
                    status: cols[8] || 'Active',
                };
            });

            router.post(
                '/admin/members/import',
                { records: parsedRecords },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (csvInputRef.current) csvInputRef.current.value = '';
                    },
                }
            );
        };
        reader.readAsText(file);
    };

    const handleSampleBatchImport = () => {
        const sampleRows = [
            {
                full_name: 'Arch. Lorenzo Montalban',
                email: 'lorenzo.m@klbbutuan.org',
                phone: '+63 917 550 1120',
                ministry: 'Worship & Creative',
                life_group: 'Libertad Grace Group',
                baptism_status: 'Water Baptized',
                role_type: 'Volunteer',
                status: 'Active',
            },
            {
                full_name: 'Hannah Faith Dumagan',
                email: 'hannah.d@klbbutuan.org',
                phone: '+63 917 550 1121',
                ministry: 'Kingdom Youth',
                life_group: 'Ampayon Campus Life',
                baptism_status: 'Scheduled',
                role_type: 'Active Member',
                status: 'Active',
            },
        ];

        router.post('/admin/members/import', { records: sampleRows }, { preserveScroll: true });
    };

    const handleAddMemberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/members', newMember, {
            preserveScroll: true,
            onSuccess: () => {
                setAddModalOpen(false);
                setNewMember({
                    full_name: '',
                    email: '',
                    phone: '+63 917 ',
                    ministry: 'Worship & Creative',
                    life_group: 'Libertad Grace Group',
                    baptism_status: 'Water Baptized',
                    role_type: 'Active Member',
                    status: 'Active',
                });
            },
        });
    };

    return (
        <div className="space-y-5">
            {/* Print-Only Header */}
            <div className="hidden print-only border-b-2 border-slate-900 pb-4 mb-4">
                <h1 className="text-xl font-bold">
                    KINGDOM LIFE BUTUAN (KLB) — OFFICIAL CHURCH MEMBER & LIFE GROUP REGISTRY
                </h1>
                <p className="text-xs text-slate-600">
                    J.C. Aquino Avenue, Butuan City, Agusan del Norte • Generated by {user?.name} ({user?.role}) on{' '}
                    {new Date().toLocaleDateString()}
                </p>
            </div>

            {/* Top Action Bar */}
            <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="default">
                            <Users className="h-3 w-3" />
                            Enterprise Registry
                        </Badge>
                        <Badge variant="mono">{filteredMembers.length} Records</Badge>
                    </div>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                        KLB Church Members, Ministries & Butuan Life Groups
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Double-click any row or click the pencil icon for instant inline editing. Select rows with custom gradient checkboxes for batch operations.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => csvInputRef.current?.click()}
                        title="Upload a .csv file to import members"
                    >
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        Import CSV File
                    </Button>
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={handleSampleBatchImport}
                        title="One-click test batch import of 2 Butuan members"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        +2 Sample CSV Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCsv}>
                        <Download className="h-3.5 w-3.5 text-emerald-600" />
                        Export CSV / Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            window.print();
                        }}
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Print Directory
                    </Button>
                    <Button size="sm" onClick={() => setAddModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Filters Bar with Portal-Based <Select> Dropdowns */}
            <Card className="no-print p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={localSearch}
                            onChange={(e) => {
                                setLocalSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search name, code, email..."
                            className="pl-8"
                        />
                        {localSearch && (
                            <button
                                type="button"
                                onClick={() => setLocalSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <Select
                        value={ministryFilter}
                        onValueChange={(val) => {
                            setMinistryFilter(val);
                            setPage(1);
                        }}
                        clearValue="all"
                        placeholder="All Ministries"
                        options={[
                            { value: 'all', label: 'All Ministries' },
                            ...MINISTRIES.map((m) => ({ value: m, label: m })),
                        ]}
                    />

                    <Select
                        value={lifeGroupFilter}
                        onValueChange={(val) => {
                            setLifeGroupFilter(val);
                            setPage(1);
                        }}
                        clearValue="all"
                        placeholder="All Butuan Life Groups"
                        options={[
                            { value: 'all', label: 'All Butuan Life Groups' },
                            ...LIFE_GROUPS.map((lg) => ({ value: lg, label: lg })),
                        ]}
                    />

                    <Select
                        value={baptismFilter}
                        onValueChange={(val) => {
                            setBaptismFilter(val);
                            setPage(1);
                        }}
                        clearValue="all"
                        placeholder="All Baptism Statuses"
                        options={[
                            { value: 'all', label: 'All Baptism Statuses' },
                            ...BAPTISM_STATUSES.map((b) => ({ value: b, label: b })),
                        ]}
                    />

                    <Select
                        value={statusFilter}
                        onValueChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                        }}
                        clearValue="all"
                        searchable={false}
                        placeholder="All Statuses"
                        options={[
                            { value: 'all', label: 'All Statuses' },
                            { value: 'Active', label: 'Active' },
                            { value: 'Visiting', label: 'Visiting' },
                            { value: 'Inactive', label: 'Inactive' },
                        ]}
                    />
                </div>
            </Card>

            {/* Floating Batch Selection Action Bar */}
            {selectedIds.length > 0 && (
                <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <Badge variant="default">{selectedIds.length} Selected</Badge>
                        <span className="text-xs font-medium text-foreground">
                            Batch actions for selected KLB members:
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchAction('status_active')}
                        >
                            Set Active
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchAction('baptized')}
                        >
                            Mark Water Baptized
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBatchAction('delete')}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Sticky-Header Data Table */}
            <Card className="overflow-hidden">
                <div className="max-h-[480px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 no-print">
                                    <Checkbox
                                        checked={allVisibleSelected}
                                        indeterminate={someVisibleSelected}
                                        onCheckedChange={toggleSelectAllVisible}
                                        aria-label="Select all visible rows"
                                    />
                                </TableHead>
                                <TableHead className="w-32">Code</TableHead>
                                <TableHead>Member Name & Contact</TableHead>
                                <TableHead>Ministry Department</TableHead>
                                <TableHead>Butuan Life Group</TableHead>
                                <TableHead>Baptism</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right no-print">Inline Edit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMembers.map((member) => {
                                const isSelected = selectedIds.includes(member.id);
                                const isEditing = editingId === member.id;

                                return (
                                    <TableRow
                                        key={member.id}
                                        data-state={isSelected ? 'selected' : undefined}
                                        onDoubleClick={() => {
                                            if (!isEditing) startInlineEdit(member);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <TableCell className="no-print">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleRowSelect(member.id)}
                                                aria-label={`Select ${member.full_name}`}
                                            />
                                        </TableCell>

                                        <TableCell className="font-mono text-xs font-semibold text-primary">
                                            {member.member_code}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="space-y-1 min-w-[180px]">
                                                    <Input
                                                        value={editDraft.full_name || ''}
                                                        onChange={(e) =>
                                                            setEditDraft((d) => ({
                                                                ...d,
                                                                full_name: e.target.value,
                                                            }))
                                                        }
                                                        className="h-7 text-xs"
                                                    />
                                                    <Input
                                                        value={editDraft.phone || ''}
                                                        onChange={(e) =>
                                                            setEditDraft((d) => ({
                                                                ...d,
                                                                phone: e.target.value,
                                                            }))
                                                        }
                                                        className="h-7 text-xs font-mono"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-semibold text-foreground text-xs">
                                                        {member.full_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground font-mono">
                                                        {member.phone || member.email}
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="w-44">
                                                    <Select
                                                        size="sm"
                                                        value={editDraft.ministry || member.ministry}
                                                        onValueChange={(val) =>
                                                            setEditDraft((d) => ({ ...d, ministry: val }))
                                                        }
                                                        clearable={false}
                                                        options={MINISTRIES.map((m) => ({
                                                            value: m,
                                                            label: m,
                                                        }))}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-foreground">
                                                    {member.ministry}
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="w-44">
                                                    <Select
                                                        size="sm"
                                                        value={editDraft.life_group || member.life_group}
                                                        onValueChange={(val) =>
                                                            setEditDraft((d) => ({
                                                                ...d,
                                                                life_group: val,
                                                            }))
                                                        }
                                                        clearable={false}
                                                        options={LIFE_GROUPS.map((lg) => ({
                                                            value: lg,
                                                            label: lg,
                                                        }))}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {member.life_group}
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="w-36">
                                                    <Select
                                                        size="sm"
                                                        value={
                                                            editDraft.baptism_status ||
                                                            member.baptism_status
                                                        }
                                                        onValueChange={(val) =>
                                                            setEditDraft((d) => ({
                                                                ...d,
                                                                baptism_status: val,
                                                            }))
                                                        }
                                                        clearable={false}
                                                        searchable={false}
                                                        options={BAPTISM_STATUSES.map((b) => ({
                                                            value: b,
                                                            label: b,
                                                        }))}
                                                    />
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant={
                                                        member.baptism_status === 'Water Baptized'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                >
                                                    {member.baptism_status}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="w-36">
                                                    <Select
                                                        size="sm"
                                                        value={editDraft.role_type || member.role_type}
                                                        onValueChange={(val) =>
                                                            setEditDraft((d) => ({
                                                                ...d,
                                                                role_type: val,
                                                            }))
                                                        }
                                                        clearable={false}
                                                        searchable={false}
                                                        options={ROLE_TYPES.map((r) => ({
                                                            value: r,
                                                            label: r,
                                                        }))}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-foreground">
                                                    {member.role_type}
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <div className="w-28">
                                                    <Select
                                                        size="sm"
                                                        value={editDraft.status || member.status}
                                                        onValueChange={(val) =>
                                                            setEditDraft((d) => ({ ...d, status: val }))
                                                        }
                                                        clearable={false}
                                                        searchable={false}
                                                        options={[
                                                            { value: 'Active', label: 'Active' },
                                                            { value: 'Visiting', label: 'Visiting' },
                                                            { value: 'Inactive', label: 'Inactive' },
                                                        ]}
                                                    />
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant={
                                                        member.status === 'Active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {member.status}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right no-print">
                                            {isEditing ? (
                                                <div className="inline-flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => saveInlineEdit(member)}
                                                        className="h-7 px-2.5"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingId(null)}
                                                        className="h-7 px-2"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => startInlineEdit(member)}
                                                    className="h-7 px-2.5 text-xs"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                                                    Edit
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Footer */}
                <div className="no-print flex flex-wrap items-center justify-between gap-4 border-t border-border/80 bg-muted/25 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>
                            Showing{' '}
                            <strong className="font-mono text-foreground">
                                {filteredMembers.length === 0
                                    ? 0
                                    : (currentPage - 1) * perPage + 1}
                            </strong>{' '}
                            to{' '}
                            <strong className="font-mono text-foreground">
                                {Math.min(currentPage * perPage, filteredMembers.length)}
                            </strong>{' '}
                            of{' '}
                            <strong className="font-mono text-foreground">
                                {filteredMembers.length}
                            </strong>{' '}
                            members
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Rows:</span>
                            <div className="w-20">
                                <Select
                                    size="sm"
                                    value={pageSize}
                                    onValueChange={(val) => {
                                        setPageSize(val);
                                        setPage(1);
                                    }}
                                    searchable={false}
                                    clearable={false}
                                    options={[
                                        { value: '6', label: '6' },
                                        { value: '10', label: '10' },
                                        { value: '25', label: '25' },
                                        { value: '50', label: '50' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="px-2 font-mono text-xs font-semibold">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Add New Member Modal */}
            {addModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                    onClick={() => setAddModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-base font-bold text-foreground">
                                Register New KLB Church Member
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddMemberSubmit} className="mt-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold">Full Name</label>
                                <Input
                                    required
                                    value={newMember.full_name}
                                    onChange={(e) =>
                                        setNewMember((m) => ({ ...m, full_name: e.target.value }))
                                    }
                                    placeholder="e.g. Joshua Emmanuel Caraga"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Email</label>
                                    <Input
                                        type="email"
                                        value={newMember.email}
                                        onChange={(e) =>
                                            setNewMember((m) => ({ ...m, email: e.target.value }))
                                        }
                                        placeholder="name@klbbutuan.org"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Mobile Phone</label>
                                    <Input
                                        value={newMember.phone}
                                        onChange={(e) =>
                                            setNewMember((m) => ({ ...m, phone: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Ministry</label>
                                    <Select
                                        value={newMember.ministry}
                                        onValueChange={(val) =>
                                            setNewMember((m) => ({ ...m, ministry: val }))
                                        }
                                        clearable={false}
                                        options={MINISTRIES.map((m) => ({ value: m, label: m }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Butuan Life Group</label>
                                    <Select
                                        value={newMember.life_group}
                                        onValueChange={(val) =>
                                            setNewMember((m) => ({ ...m, life_group: val }))
                                        }
                                        clearable={false}
                                        options={LIFE_GROUPS.map((lg) => ({ value: lg, label: lg }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Baptism Status</label>
                                    <Select
                                        value={newMember.baptism_status}
                                        onValueChange={(val) =>
                                            setNewMember((m) => ({ ...m, baptism_status: val }))
                                        }
                                        clearable={false}
                                        searchable={false}
                                        options={BAPTISM_STATUSES.map((b) => ({ value: b, label: b }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Role Type</label>
                                    <Select
                                        value={newMember.role_type}
                                        onValueChange={(val) =>
                                            setNewMember((m) => ({ ...m, role_type: val }))
                                        }
                                        clearable={false}
                                        searchable={false}
                                        options={ROLE_TYPES.map((r) => ({ value: r, label: r }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Register Member</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

