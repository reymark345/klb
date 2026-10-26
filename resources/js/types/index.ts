export type RoleType =
    | 'Primary Admin'
    | 'Admin'
    | 'Content Creator'
    | 'Staff/Analyst'
    | 'Pending Approval';

export interface ModulePermission {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_import: boolean;
    can_export: boolean;
}

export interface AuthUser {
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
    avatar_url?: string | null;
    last_login_at?: string;
    can_edit_content?: boolean;
    permissions: Record<string, ModulePermission>;
}

export interface SiteContent {
    id: number;
    key: string;
    page: string;
    section: string;
    label: string;
    title: string;
    subtitle?: string | null;
    body?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    image_url?: string | null;
    gallery_images?: string[] | null;
    image_alt?: string | null;
    focal_point: string;
    aspect_ratio: string;
    is_published: boolean;
    sort_order: number;
    updated_by?: string | null;
    updated_at?: string;
}

export interface MemberRecord {
    id: number;
    member_code: string;
    full_name: string;
    email?: string | null;
    phone?: string | null;
    ministry: string;
    life_group: string;
    baptism_status: string;
    role_type: string;
    status: string;
    joined_date?: string | null;
    notes?: string | null;
}

export interface DonationRecord {
    id: number;
    donor_name: string;
    email?: string | null;
    phone?: string | null;
    amount: number;
    fund_category: string;
    payment_method: string;
    reference_number?: string | null;
    message?: string | null;
    is_anonymous?: boolean;
    status?: string;
    created_at?: string;
    time_ago?: string;
}

export interface RolePermissionRecord {
    id: number;
    role_name: RoleType;
    module_key: string;
    module_label: string;
    module_description?: string | null;
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_import: boolean;
    can_export: boolean;
}

export interface AuditLogRecord {
    id: number;
    user_name: string;
    user_role: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | string;
    module: string;
    target_label: string;
    details?: string | null;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    ip_address?: string | null;
    severity: 'info' | 'warning' | 'critical' | string;
    created_at?: string;
    time_ago?: string;
}

export interface SharedPageProps {
    auth: {
        user: AuthUser | null;
    };
    counts: {
        cms_items: number;
        cms_images: number;
        members: number;
        users: number;
        pending_users?: number;
        donations?: number;
        audit_logs: number;
    };
    flash: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
    [key: string]: unknown;
}
