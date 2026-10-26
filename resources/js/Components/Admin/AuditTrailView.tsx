import * as React from 'react';
import { router } from '@inertiajs/react';
import {
    Activity,
    Download,
    Eye,
    Printer,
    Search,
    ShieldAlert,
    X,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
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
import { AuditLogRecord } from '@/types';

interface AuditTrailViewProps {
    logs: AuditLogRecord[];
    globalSearch: string;
}

export default function AuditTrailView({ logs, globalSearch }: AuditTrailViewProps) {
    const [actionFilter, setActionFilter] = React.useState('all');
    const [severityFilter, setSeverityFilter] = React.useState('all');
    const [localSearch, setLocalSearch] = React.useState('');
    const [inspectedLog, setInspectedLog] = React.useState<AuditLogRecord | null>(null);

    const effectiveQuery = (globalSearch || localSearch).trim().toLowerCase();

    const filteredLogs = React.useMemo(() => {
        return logs.filter((log) => {
            if (actionFilter !== 'all' && log.action !== actionFilter) return false;
            if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
            if (effectiveQuery) {
                return (
                    log.user_name.toLowerCase().includes(effectiveQuery) ||
                    log.module.toLowerCase().includes(effectiveQuery) ||
                    log.target_label.toLowerCase().includes(effectiveQuery) ||
                    (log.details && log.details.toLowerCase().includes(effectiveQuery))
                );
            }
            return true;
        });
    }, [logs, actionFilter, severityFilter, effectiveQuery]);

    const exportAuditCsv = () => {
        const headers = ['ID', 'Timestamp', 'Operator', 'Role', 'Action', 'Module', 'Target', 'Details'];
        const rows = filteredLogs.map((l) => [
            l.id,
            l.created_at || '',
            `"${l.user_name}"`,
            `"${l.user_role}"`,
            l.action,
            `"${l.module}"`,
            `"${(l.target_label || '').replace(/"/g, '""')}"`,
            `"${(l.details || '').replace(/"/g, '""')}"`,
        ]);
        const csvContent =
            '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KLB_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        router.post(
            '/admin/export-log',
            {
                module: 'Enterprise Audit Trail',
                format: 'CSV',
                record_count: filteredLogs.length,
            },
            { preserveScroll: true }
        );
    };

    const actionBadgeVariant = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'success';
            case 'UPDATE':
                return 'default';
            case 'DELETE':
                return 'destructive';
            case 'IMPORT':
            case 'EXPORT':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="default">
                            <Activity className="h-3 w-3" />
                            Immutable Security Ledger
                        </Badge>
                        <Badge variant="mono">{filteredLogs.length} Events</Badge>
                    </div>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                        Enterprise Audit Trail (Create, Update, Delete, Import, Export)
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Every CMS image replacement, member update, CSV batch import/export, and RBAC permission change is automatically logged.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportAuditCsv}>
                        <Download className="h-3.5 w-3.5 text-primary" />
                        Export Audit CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" />
                        Print Log
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="no-print p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Filter by operator, target, details..."
                            className="pl-8"
                        />
                    </div>
                    <Select
                        value={actionFilter}
                        onValueChange={setActionFilter}
                        clearValue="all"
                        searchable={false}
                        options={[
                            { value: 'all', label: 'All Action Types' },
                            { value: 'CREATE', label: 'CREATE' },
                            { value: 'UPDATE', label: 'UPDATE (Images / Records)' },
                            { value: 'DELETE', label: 'DELETE' },
                            { value: 'IMPORT', label: 'IMPORT (CSV)' },
                            { value: 'EXPORT', label: 'EXPORT (CSV)' },
                        ]}
                    />
                    <Select
                        value={severityFilter}
                        onValueChange={setSeverityFilter}
                        clearValue="all"
                        searchable={false}
                        options={[
                            { value: 'all', label: 'All Severity Levels' },
                            { value: 'info', label: 'Info (Standard)' },
                            { value: 'warning', label: 'Warning (RBAC / Delete)' },
                            { value: 'critical', label: 'Critical (Blocked Access)' },
                        ]}
                    />
                </div>
            </Card>

            {/* Sticky Table */}
            <Card className="overflow-hidden">
                <div className="max-h-[500px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-40">Timestamp</TableHead>
                                <TableHead>Operator & Role</TableHead>
                                <TableHead className="w-28">Action</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Target & Summary</TableHead>
                                <TableHead className="text-right no-print">Payload</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        <div>{log.created_at}</div>
                                        <div className="text-[10px] text-primary">{log.time_ago}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-semibold text-foreground">
                                            {log.user_name}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {log.user_role} • <span className="font-mono">{log.ip_address}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={actionBadgeVariant(log.action) as any}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-foreground">
                                        {log.module}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-semibold text-foreground">
                                            {log.target_label}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                                            {log.details}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right no-print">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setInspectedLog(log)}
                                        >
                                            <Eye className="h-3.5 w-3.5 text-primary" />
                                            Diff
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* JSON Diff Inspector Modal */}
            {inspectedLog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                    onClick={() => setInspectedLog(null)}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={actionBadgeVariant(inspectedLog.action) as any}>
                                        {inspectedLog.action}
                                    </Badge>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {inspectedLog.created_at}
                                    </span>
                                </div>
                                <h3 className="mt-1 text-base font-bold text-foreground">
                                    {inspectedLog.target_label}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectedLog(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs">
                            <p className="text-muted-foreground">{inspectedLog.details}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border bg-muted/40 p-3">
                                    <div className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1.5">
                                        Previous State (old_values)
                                    </div>
                                    <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                                        {inspectedLog.old_values
                                            ? JSON.stringify(inspectedLog.old_values, null, 2)
                                            : 'null'}
                                    </pre>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/40 p-3">
                                    <div className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                                        Updated State (new_values)
                                    </div>
                                    <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-foreground">
                                        {inspectedLog.new_values
                                            ? JSON.stringify(inspectedLog.new_values, null, 2)
                                            : 'null'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

