import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    KeyRound,
    Lock,
    LogIn,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { SharedPageProps } from '@/types';

interface AuthPortalProps {
    initialMode?: 'login' | 'register';
    primaryAdminEmail?: string;
    primaryAdminName?: string;
}

export default function AuthPortal({
    initialMode = 'login',
    primaryAdminEmail = 'joshua@klbbutuan.org',
    primaryAdminName = 'RN Valdehueza (Primary Admin)',
}: AuthPortalProps) {
    const { flash, auth } = usePage<SharedPageProps>().props;
    const currentUser = auth?.user;

    const [mode, setMode] = React.useState<'login' | 'register'>(initialMode);
    const [submitting, setSubmitting] = React.useState(false);

    // Login Form State
    const [loginEmail, setLoginEmail] = React.useState('');
    const [loginPassword, setLoginPassword] = React.useState('');

    // Register Personal Info Form State
    const [regForm, setRegForm] = React.useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '+63 917 ',
        address: '',
        birthdate: '1998-05-15',
        gender: 'Male',
        ministry: 'Media & Creative',
        department: 'Digital Media & Communications',
        requested_role: 'Content Creator',
        bio: '',
    });

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/login',
            {
                email: loginEmail,
                password: loginPassword,
            },
            {
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleQuickPrimaryAdminLogin = () => {
        setSubmitting(true);
        router.post(
            '/login',
            {
                quick_primary_admin: true,
            },
            {
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/register', regForm, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                setLoginEmail(regForm.email);
                setMode('login');
            },
        });
    };

    return (
        <>
            <Head title="Staff & Creator Login / Personal Info Registration — Kingdom Life Butuan (KLB)" />

            <div className="min-h-screen flex flex-col bg-background text-foreground">
                {/* Top Navigation Header */}
                <header className="border-b border-border/80 bg-card/90 backdrop-blur-xl">
                    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/klb_logo.png"
                                alt="Kingdom Life Butuan Logo"
                                className="h-11 w-11 shrink-0 rounded-full object-cover shadow-md ring-1 ring-border/60"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-extrabold tracking-tight text-foreground">
                                        KINGDOM LIFE BUTUAN
                                    </span>
                                    <span className="rounded-md bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-primary/25">
                                        PORTAL ACCESS
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Personal Info Registration • Admin Approval • Role-Based Access
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2.5">
                            {currentUser && (
                                <Link
                                    href="/admin"
                                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Back to Admin Portal ({currentUser.role})
                                </Link>
                            )}
                            <Link
                                href="/"
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-accent/60 transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to Landing Page
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-8 py-10">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 shadow-xs">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold">Registration & Session Notice</div>
                                <p className="mt-0.5 leading-relaxed">{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {flash?.warning && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/45 bg-amber-500/12 p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200 shadow-xs">
                            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold">Awaiting Admin Approval</div>
                                <p className="mt-0.5 leading-relaxed">{flash.warning}</p>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/45 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive shadow-xs">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold">Authentication Notice</div>
                                <p className="mt-0.5 leading-relaxed">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Workflow Explanation & Primary Admin Quick Access */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/14 via-card to-accent/35 p-6 shadow-sm space-y-4">
                                <Badge variant="default">
                                    <Sparkles className="h-3 w-3" />
                                    KLB Security & Role Governance
                                </Badge>
                                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                                    Register Personal Info First Before Admin Login
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    To protect Kingdom Life Butuan’s official website and church records, every operator must complete a 3-step verification flow:
                                </p>

                                <div className="space-y-3 pt-1">
                                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/85 p-3.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                                            1
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">
                                                Register Personal Information
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                Submit your full name, Butuan address, mobile number, birthdate, ministry department, and requested role.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/85 p-3.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-white">
                                            2
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">
                                                Primary Admin Approves & Assigns Role
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                The Primary Admin reviews your Personal Info and approves your account as either{' '}
                                                <strong className="text-foreground">Admin</strong> or{' '}
                                                <strong className="text-foreground">Content Creator</strong>.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/85 p-3.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                                            3
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">
                                                Edit Website Content & Images
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                Once approved as <strong className="text-foreground">Admin</strong> or{' '}
                                                <strong className="text-foreground">Content Creator</strong>, you can log in and update any content or image across the website. Unapproved or other roles cannot edit.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Login & Register Personal Info Tabs */}
                        <div className="lg:col-span-7">
                            <Card className="overflow-hidden shadow-lg">
                                {/* Mode Switcher Tabs */}
                                <div className="grid grid-cols-2 border-b border-border/80 bg-muted/30 p-1.5 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setMode('register')}
                                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                            mode === 'register'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        1. Register Personal Info First
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                            mode === 'login'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        2. Sign In (Approved Users)
                                    </button>
                                </div>

                                {mode === 'register' ? (
                                    <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                                        <div>
                                            <h2 className="text-lg font-extrabold text-foreground">
                                                Step 1: Personal Information Registration
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Complete your personal details below. After registering, the Primary Admin will approve your account and assign your role (<strong>Admin</strong> or <strong>Content Creator</strong>).
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Full Name *
                                                </label>
                                                <Input
                                                    required
                                                    value={regForm.name}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({ ...f, name: e.target.value }))
                                                    }
                                                    placeholder="e.g. Joshua Caraga"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Email Address *
                                                </label>
                                                <Input
                                                    type="email"
                                                    required
                                                    value={regForm.email}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({ ...f, email: e.target.value }))
                                                    }
                                                    placeholder="you@klbbutuan.org"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Mobile / Phone Number *
                                                </label>
                                                <Input
                                                    required
                                                    value={regForm.phone}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({ ...f, phone: e.target.value }))
                                                    }
                                                    placeholder="+63 917 000 0000"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Birthdate *
                                                </label>
                                                <Input
                                                    type="date"
                                                    required
                                                    value={regForm.birthdate}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({
                                                            ...f,
                                                            birthdate: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Gender *
                                                </label>
                                                <Select
                                                    value={regForm.gender}
                                                    clearable={false}
                                                    searchable={false}
                                                    onValueChange={(val) =>
                                                        setRegForm((f) => ({ ...f, gender: val }))
                                                    }
                                                    options={[
                                                        { value: 'Male', label: 'Male' },
                                                        { value: 'Female', label: 'Female' },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Home Address / Barangay in Butuan City *
                                            </label>
                                            <Input
                                                required
                                                value={regForm.address}
                                                onChange={(e) =>
                                                    setRegForm((f) => ({ ...f, address: e.target.value }))
                                                }
                                                placeholder="Purok / Street, Barangay (e.g. Brgy. Libertad, Butuan City)"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Church Ministry *
                                                </label>
                                                <Select
                                                    value={regForm.ministry}
                                                    clearable={false}
                                                    searchable={false}
                                                    onValueChange={(val) =>
                                                        setRegForm((f) => ({ ...f, ministry: val }))
                                                    }
                                                    options={[
                                                        {
                                                            value: 'Media & Creative',
                                                            label: 'Media & Creative',
                                                        },
                                                        {
                                                            value: 'Worship & Music',
                                                            label: 'Worship & Music',
                                                        },
                                                        {
                                                            value: 'Kingdom Youth (KYB)',
                                                            label: 'Kingdom Youth (KYB)',
                                                        },
                                                        {
                                                            value: 'Kids Kingdom',
                                                            label: 'Kids Kingdom',
                                                        },
                                                        {
                                                            value: 'Pastoral & Life Groups',
                                                            label: 'Pastoral & Life Groups',
                                                        },
                                                        {
                                                            value: 'Caraga Missions & Outreach',
                                                            label: 'Caraga Missions & Outreach',
                                                        },
                                                    ]}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Department / Team *
                                                </label>
                                                <Input
                                                    required
                                                    value={regForm.department}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({
                                                            ...f,
                                                            department: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Digital Media & Communications"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Requested Role *
                                                </label>
                                                <Select
                                                    value={regForm.requested_role}
                                                    clearable={false}
                                                    searchable={false}
                                                    onValueChange={(val) =>
                                                        setRegForm((f) => ({
                                                            ...f,
                                                            requested_role: val,
                                                        }))
                                                    }
                                                    options={[
                                                        {
                                                            value: 'Content Creator',
                                                            label: 'Content Creator (Edit Content & Images)',
                                                        },
                                                        {
                                                            value: 'Admin',
                                                            label: 'Admin (Edit Content, Images & Manage)',
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Brief Personal Info / Ministry Responsibilities
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={regForm.bio}
                                                onChange={(e) =>
                                                    setRegForm((f) => ({ ...f, bio: e.target.value }))
                                                }
                                                placeholder="Share your role in KLB Butuan and what pages/photos you will be managing..."
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-border/60">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Create Password *
                                                </label>
                                                <Input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={regForm.password}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({
                                                            ...f,
                                                            password: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Minimum 6 characters"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Confirm Password *
                                                </label>
                                                <Input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={regForm.password_confirmation}
                                                    onChange={(e) =>
                                                        setRegForm((f) => ({
                                                            ...f,
                                                            password_confirmation: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Re-enter password"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11"
                                            disabled={submitting}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            {submitting
                                                ? 'Submitting Personal Info for Admin Approval...'
                                                : 'Submit Personal Info Registration (Requires Admin Approval)'}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
                                        <div>
                                            <h2 className="text-lg font-extrabold text-foreground">
                                                Step 2: Sign In to KLB Portal
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Only accounts that have registered their Personal Info and been <strong>Approved by the Admin</strong> can sign in.
                                            </p>
                                        </div>

                                        <div className="space-y-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Username or Registered Email Address
                                                </label>
                                                <Input
                                                    type="text"
                                                    required
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    placeholder="Enter username or email"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Password
                                                </label>
                                                <Input
                                                    type="password"
                                                    required
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11"
                                            disabled={submitting}
                                        >
                                            <LogIn className="h-4 w-4" />
                                            {submitting ? 'Verifying Approval & Signing In...' : 'Sign In to Account'}
                                        </Button>
                                    </form>
                                )}
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

