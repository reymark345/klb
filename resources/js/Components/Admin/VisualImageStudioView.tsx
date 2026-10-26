import * as React from 'react';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    ExternalLink,
    Eye,
    Image as ImageIcon,
    Layers,
    Lock,
    Pencil,
    Plus,
    RefreshCw,
    Sparkles,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { AuthUser, SiteContent } from '@/types';

interface VisualImageStudioViewProps {
    contents: SiteContent[];
    user: AuthUser | null;
    globalSearch: string;
    initialPageFilter?: string;
    onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const CURATED_CHURCH_PRESETS = [
    {
        label: 'Sanctuary Worship Hands',
        url: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1600&q=85',
    },
    {
        label: 'Vibrant Praise & Stage',
        url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1600&q=85',
    },
    {
        label: 'Warm Church Fellowship',
        url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80',
    },
    {
        label: 'Modern Auditorium Seats',
        url: 'https://images.unsplash.com/photo-1548625361-16802b165212?auto=format&fit=crop&w=1400&q=80',
    },
    {
        label: 'Community Compassion Outreach',
        url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1400&q=80',
    },
    {
        label: 'Youth Revival Night',
        url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80',
    },
    {
        label: 'Open Scripture & Sermon',
        url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1400&q=80',
    },
    {
        label: 'Water Baptism Ocean',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    },
];

export default function VisualImageStudioView({
    contents,
    user,
    globalSearch,
    initialPageFilter = 'all',
    onNotify,
}: VisualImageStudioViewProps) {
    const [pageFilter, setPageFilter] = React.useState<string>(initialPageFilter);
    const [sectionFilter, setSectionFilter] = React.useState<string>('all');
    const [editingItem, setEditingItem] = React.useState<SiteContent | null>(null);
    const [creatingNew, setCreatingNew] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    // Edit form state
    const [formPage, setFormPage] = React.useState('Landing Page');
    const [formSection, setFormSection] = React.useState('Hero Banner');
    const [formKey, setFormKey] = React.useState('');
    const [formLabel, setFormLabel] = React.useState('');
    const [formTitle, setFormTitle] = React.useState('');
    const [formSubtitle, setFormSubtitle] = React.useState('');
    const [formBody, setFormBody] = React.useState('');
    const [formCtaText, setFormCtaText] = React.useState('');
    const [formCtaLink, setFormCtaLink] = React.useState('');
    const [formImageUrl, setFormImageUrl] = React.useState('');
    const [formImageAlt, setFormImageAlt] = React.useState('');
    const [formFocalPoint, setFormFocalPoint] = React.useState('center');
    const [formAspectRatio, setFormAspectRatio] = React.useState('16:9');
    const [formPublished, setFormPublished] = React.useState(true);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = React.useState<string | null>(null);

    // Multi-image slideshow gallery state for a card
    const [formGalleryImages, setFormGalleryImages] = React.useState<string[]>([]);
    const [formGalleryFiles, setFormGalleryFiles] = React.useState<File[]>([]);
    const [formGalleryPreviews, setFormGalleryPreviews] = React.useState<string[]>([]);
    const [extraSlideUrl, setExtraSlideUrl] = React.useState('');

    const canEditImages =
        Boolean(user?.status === 'Active') &&
        (user?.role === 'Primary Admin' ||
            user?.role === 'Admin' ||
            user?.role === 'Content Creator' ||
            Boolean(user?.can_edit_content) ||
            Boolean(user?.permissions?.cms_visual_media?.can_update));

    const canCreateSlot =
        Boolean(user?.status === 'Active') &&
        (user?.role === 'Primary Admin' ||
            user?.role === 'Admin' ||
            user?.role === 'Content Creator' ||
            Boolean(user?.can_edit_content) ||
            Boolean(user?.permissions?.cms_visual_media?.can_create));

    const canDeleteSlot =
        Boolean(user?.status === 'Active') &&
        (user?.role === 'Primary Admin' ||
            user?.role === 'Admin' ||
            user?.role === 'Content Creator' ||
            Boolean(user?.permissions?.cms_visual_media?.can_delete));

    React.useEffect(() => {
        if (initialPageFilter) {
            setPageFilter(initialPageFilter);
        }
    }, [initialPageFilter]);

    const getCardSlideUrls = (item: SiteContent): string[] => {
        const list = Array.isArray(item.gallery_images) ? [...item.gallery_images] : [];
        if (item.image_url && !list.includes(item.image_url)) {
            list.unshift(item.image_url);
        }
        return list.map((u) => (u || '').trim()).filter(Boolean);
    };

    const openEditModal = (item: SiteContent) => {
        setCreatingNew(false);
        setEditingItem(item);
        setFormPage(item.page);
        setFormSection(item.section);
        setFormKey(item.key);
        setFormLabel(item.label);
        setFormTitle(item.title);
        setFormSubtitle(item.subtitle || '');
        setFormBody(item.body || '');
        setFormCtaText(item.cta_text || '');
        setFormCtaLink(item.cta_link || '');
        setFormImageUrl(item.image_url || '');
        setFormImageAlt(item.image_alt || '');
        setFormFocalPoint(
            item.section === 'Pastoral Leadership' || item.section === 'Worship Team'
                ? item.focal_point === 'cover-top' || item.focal_point === 'cover-center'
                    ? item.focal_point
                    : 'contain'
                : item.focal_point || 'center'
        );
        setFormAspectRatio(item.aspect_ratio || '16:9');
        setFormPublished(item.is_published);
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setFormGalleryImages(getCardSlideUrls(item));
        setFormGalleryFiles([]);
        setFormGalleryPreviews([]);
        setExtraSlideUrl('');
    };

    const openCreateModal = (
        presetType?: 'default' | 'Worship Team' | 'Pastoral Leadership' | 'Fellowship Gallery'
    ) => {
        setEditingItem(null);
        setCreatingNew(true);
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setFormGalleryFiles([]);
        setFormGalleryPreviews([]);
        setExtraSlideUrl('');
        setFormPublished(true);

        if (presetType === 'Worship Team') {
            setFormPage('Ministries');
            setFormSection('Worship Team');
            setFormKey(`worship_team_member_${Date.now().toString().slice(-5)}`);
            setFormLabel('Worship Team Member Card');
            setFormTitle('');
            setFormSubtitle('WORSHIP LEADER • SOUND OF HEAVEN');
            setFormBody('');
            setFormCtaText('Sound of Heaven');
            setFormCtaLink('#ministries');
            setFormImageUrl(
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80'
            );
            setFormImageAlt('KLB Worship Team Member');
            setFormFocalPoint('contain');
            setFormAspectRatio('1:1');
            setFormGalleryImages([
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
            ]);
            return;
        }

        if (presetType === 'Pastoral Leadership') {
            setFormPage('About Us');
            setFormSection('Pastoral Leadership');
            setFormKey(`pastor_leader_${Date.now().toString().slice(-5)}`);
            setFormLabel('Pastoral Leadership Portrait Card');
            setFormTitle('');
            setFormSubtitle('ASSOCIATE PASTOR • KINGDOM LIFE BUTUAN');
            setFormBody('');
            setFormCtaText('Pastoral Team');
            setFormCtaLink('#about');
            setFormImageUrl(
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80'
            );
            setFormImageAlt('KLB Pastor Portrait');
            setFormFocalPoint('contain');
            setFormAspectRatio('1:1');
            setFormGalleryImages([
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
            ]);
            return;
        }

        if (presetType === 'Fellowship Gallery') {
            setFormPage('Global / Branding');
            setFormSection('Fellowship Gallery');
            setFormKey(`gallery_butuan_${Date.now().toString().slice(-5)}`);
            setFormLabel('Life at Kingdom Life Butuan — Multi-Image Card');
            setFormTitle('');
            setFormSubtitle('SUNDAY CELEBRATION & FELLOWSHIP');
            setFormBody('');
            setFormCtaText('View Gallery');
            setFormCtaLink('#gallery');
            setFormImageUrl(CURATED_CHURCH_PRESETS[0].url);
            setFormImageAlt('Kingdom Life Butuan Fellowship');
            setFormFocalPoint('center');
            setFormAspectRatio('4:3');
            setFormGalleryImages([
                CURATED_CHURCH_PRESETS[0].url,
                CURATED_CHURCH_PRESETS[1].url,
                CURATED_CHURCH_PRESETS[2].url,
            ]);
            return;
        }

        setFormPage(pageFilter !== 'all' ? pageFilter : 'Landing Page');
        setFormSection('Hero Banner');
        setFormKey(`klb_visual_${Date.now().toString().slice(-4)}`);
        setFormLabel('New Visitor Feature Banner');
        setFormTitle('Experiencing God’s Grace Together in Butuan');
        setFormSubtitle('KINGDOM LIFE BUTUAN • SUNDAYS 8:30 AM & 10:30 AM');
        setFormBody(
            'Join us this week at Kingdom Life Butuan as we gather for Spirit-filled worship, biblical teaching, and authentic community.'
        );
        setFormCtaText('Plan Your Visit');
        setFormCtaLink('#visit');
        setFormImageUrl(CURATED_CHURCH_PRESETS[0].url);
        setFormImageAlt('Kingdom Life Butuan Worship Banner');
        setFormFocalPoint('center');
        setFormAspectRatio('16:9');
        setFormGalleryImages([CURATED_CHURCH_PRESETS[0].url]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setFilePreviewUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleMultipleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        const files = Array.from(fileList);
        setFormGalleryFiles((prev) => [...prev, ...files]);

        files.forEach((f) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setFormGalleryPreviews((prev) => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(f);
        });
        e.target.value = '';
    };

    const addSlideUrlToFormGallery = () => {
        const trimmed = extraSlideUrl.trim();
        if (!trimmed) return;
        if (!formGalleryImages.includes(trimmed)) {
            setFormGalleryImages((prev) => [...prev, trimmed]);
        }
        if (!formImageUrl) {
            setFormImageUrl(trimmed);
        }
        setExtraSlideUrl('');
    };

    const removeSlideFromFormGallery = (urlToRemove: string) => {
        setFormGalleryImages((prev) => {
            const next = prev.filter((u) => u !== urlToRemove);
            if (formImageUrl === urlToRemove) {
                setFormImageUrl(next[0] || '');
            }
            return next;
        });
    };

    const handleSaveSlot = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEditImages) {
            onNotify(
                'error',
                'Permission Denied',
                `Your current role (${user?.role}) cannot modify visitor images. Switch to Primary Admin or Admin.`
            );
            return;
        }

        setSubmitting(true);

        const payload: Record<string, any> = {
            page: formPage,
            section: formSection,
            label: formLabel || `${formSection} — ${formTitle}`,
            title: formTitle,
            subtitle: formSubtitle,
            body: formBody,
            cta_text: formCtaText,
            cta_link: formCtaLink,
            image_url: formImageUrl,
            gallery_images: formGalleryImages,
            image_alt: formImageAlt || formTitle,
            focal_point: formFocalPoint,
            aspect_ratio: formAspectRatio,
            is_published: formPublished ? 1 : 0,
        };

        if (selectedFile) {
            payload.image_file = selectedFile;
        }
        if (filePreviewUrl) {
            payload.image_base64 = filePreviewUrl;
        }
        if (formGalleryFiles.length > 0) {
            payload.gallery_files = formGalleryFiles;
        }
        if (formGalleryPreviews.length > 0) {
            payload.gallery_base64 = formGalleryPreviews;
        }

        if (creatingNew) {
            payload.key = formKey;
            router.post('/admin/cms', payload, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: () => {
                    setCreatingNew(false);
                    onNotify(
                        'success',
                        'Visual Slot Created',
                        `Published "${formLabel}" to ${formPage}.`
                    );
                },
            });
        } else if (editingItem) {
            router.post(`/admin/cms/${editingItem.id}`, payload, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: () => {
                    setEditingItem(null);
                    onNotify(
                        'success',
                        'Visitor Image Updated',
                        `Updated "${formLabel}" on ${formPage}. All visitors now see the new image and copy.`
                    );
                },
            });
        }
    };

    const handleDeleteSlot = (item: SiteContent) => {
        if (!canDeleteSlot) {
            onNotify('error', 'Access Denied', 'Only Primary Admin or authorized roles can delete visual slots.');
            return;
        }
        router.delete(`/admin/cms/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingItem(null);
                onNotify('warning', 'Slot Removed', `Deleted "${item.label}" from ${item.page}.`);
            },
        });
    };

    const uniquePages = React.useMemo(() => {
        const set = new Set<string>([
            'Landing Page',
            'About Us',
            'Ministries',
            'Sermons & Media',
            'Events & Gatherings',
            'Global / Branding',
        ]);
        contents.forEach((c) => set.add(c.page));
        return Array.from(set);
    }, [contents]);

    const uniqueSections = React.useMemo(() => {
        const set = new Set<string>();
        contents.forEach((c) => {
            if (pageFilter === 'all' || c.page === pageFilter) {
                set.add(c.section);
            }
        });
        return Array.from(set);
    }, [contents, pageFilter]);

    const filteredContents = React.useMemo(() => {
        return contents.filter((item) => {
            if (pageFilter !== 'all' && item.page !== pageFilter) return false;
            if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
            if (globalSearch.trim()) {
                const q = globalSearch.toLowerCase();
                return (
                    item.label.toLowerCase().includes(q) ||
                    item.title.toLowerCase().includes(q) ||
                    item.key.toLowerCase().includes(q) ||
                    item.page.toLowerCase().includes(q) ||
                    item.section.toLowerCase().includes(q) ||
                    (item.body && item.body.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [contents, pageFilter, sectionFilter, globalSearch]);

    const pageCounts = React.useMemo(() => {
        const map: Record<string, number> = { all: contents.length };
        contents.forEach((c) => {
            map[c.page] = (map[c.page] || 0) + 1;
        });
        return map;
    }, [contents]);

    return (
        <div className="space-y-6">
            {/* Top Banner & Role Permission Status */}
            <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-primary/12 via-card to-accent/40 p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="default">
                                <Sparkles className="h-3 w-3" />
                                Visitor Visual CMS Studio
                            </Badge>
                            {canEditImages ? (
                                <Badge variant="success">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {user?.role} • Full Image Replace & Upload Enabled
                                </Badge>
                            ) : (
                                <Badge variant="warning">
                                    <Lock className="h-3 w-3" />
                                    {user?.role} • Read-Only Preview Mode
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-foreground">
                            Update Every Image & Content Displayed to KLB Website Visitors
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-3xl">
                            Click any visual card below to upload a new photo from your computer, paste a high-resolution image URL, or choose a curated church photograph for the{' '}
                            <strong className="text-foreground">Landing Page</strong>,{' '}
                            <strong className="text-foreground">About Us</strong>,{' '}
                            <strong className="text-foreground">Pastoral Leadership</strong>,{' '}
                            <strong className="text-foreground">Ministries</strong>,{' '}
                            <strong className="text-foreground">Sermons</strong>,{' '}
                            <strong className="text-foreground">Events</strong>, and{' '}
                            <strong className="text-foreground">Community Gallery</strong>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-foreground shadow-2xs hover:bg-accent/60 transition-colors"
                        >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            Preview Live Site
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                        {canCreateSlot && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCreateModal('Worship Team')}
                                >
                                    <Plus className="h-3.5 w-3.5 text-primary" />
                                    Add Worship Team Member
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCreateModal('Pastoral Leadership')}
                                >
                                    <Plus className="h-3.5 w-3.5 text-primary" />
                                    Add Pastor Card
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCreateModal('Fellowship Gallery')}
                                >
                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                    Add Multi-Photo Gallery Card
                                </Button>
                                <Button onClick={() => openCreateModal('default')} size="sm">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Custom Slot
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Page Filter Pills & Section Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setPageFilter('all');
                            setSectionFilter('all');
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            pageFilter === 'all'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span>All Visitor Pages</span>
                        <span className="rounded-md bg-black/15 px-1.5 py-0.5 font-mono text-[10px]">
                            {pageCounts.all}
                        </span>
                    </button>

                    {uniquePages.map((pageName) => (
                        <button
                            key={pageName}
                            type="button"
                            onClick={() => {
                                setPageFilter(pageName);
                                setSectionFilter('all');
                            }}
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                pageFilter === pageName
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>{pageName}</span>
                            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                                {pageCounts[pageName] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="w-full md:w-64">
                    <Select
                        value={sectionFilter}
                        onValueChange={setSectionFilter}
                        clearValue="all"
                        placeholder="Filter by section..."
                        options={[
                            { value: 'all', label: 'All Page Sections' },
                            ...uniqueSections.map((sec) => ({
                                value: sec,
                                label: sec,
                            })),
                        ]}
                    />
                </div>
            </div>

            {/* Visual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredContents.map((item) => {
                    const slides = getCardSlideUrls(item);
                    const isPortraitCard =
                        item.section === 'Pastoral Leadership' ||
                        item.section === 'Worship Team' ||
                        item.focal_point === 'contain';
                    return (
                        <Card
                            key={item.id}
                            className="group overflow-hidden flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div>
                                {/* Image Preview Header */}
                                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                                    {isPortraitCard ? (
                                        <>
                                            <img
                                                src={
                                                    item.image_url ||
                                                    'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80'
                                                }
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-45"
                                            />
                                            <img
                                                src={
                                                    item.image_url ||
                                                    'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80'
                                                }
                                                alt={item.image_alt || item.title}
                                                className="relative z-10 h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                                            />
                                        </>
                                    ) : (
                                        <img
                                            src={
                                                item.image_url ||
                                                'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80'
                                            }
                                            alt={item.image_alt || item.title}
                                            style={{ objectPosition: item.focal_point || 'center' }}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent pointer-events-none" />

                                    {/* Top Badges */}
                                    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                                        <span className="rounded-lg bg-slate-950/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20">
                                            {item.page} • {item.section}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {slides.length > 1 && (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow">
                                                    <Layers className="h-3 w-3" />
                                                    {slides.length} Photos • Auto-Slider
                                                </span>
                                            )}
                                            <span className="rounded-lg bg-primary/90 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                                                {isPortraitCard ? 'Portrait Fit' : item.aspect_ratio}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Slot Label & Quick Replace Trigger */}
                                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="block font-mono text-[10px] text-sky-300 truncate">
                                                #{item.key}
                                            </span>
                                            <h4 className="text-sm font-bold text-white truncate">
                                                {item.label}
                                            </h4>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => openEditModal(item)}
                                            className="shrink-0 bg-white/95 text-slate-900 hover:bg-white shadow-md"
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-primary" />
                                            {canEditImages ? 'Edit / Photos' : 'Inspect'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Text Copy Preview */}
                                <CardContent className="p-4 space-y-2">
                                    {item.subtitle && (
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary truncate">
                                            {item.subtitle}
                                        </div>
                                    )}
                                    <h3 className="text-sm font-bold text-foreground line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {item.body}
                                    </p>
                                </CardContent>
                            </div>

                            {/* Card Footer */}
                            <div className="border-t border-border/70 px-4 py-2.5 bg-muted/30 flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            item.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                    />
                                    <span className="text-muted-foreground truncate">
                                        Updated by{' '}
                                        <strong className="text-foreground">
                                            {item.updated_by || 'Admin'}
                                        </strong>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    className="font-semibold text-primary hover:underline shrink-0 cursor-pointer"
                                >
                                    Edit Visual &amp; Multi-Photos →
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Interactive Image Upload & Content Editor Modal */}
            {(editingItem || creatingNew) && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
                    onClick={() => {
                        setEditingItem(null);
                        setCreatingNew(false);
                    }}
                >
                    <div
                        className="w-full max-w-4xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="default">
                                        <ImageIcon className="h-3 w-3" />
                                        {creatingNew
                                            ? `New ${formSection} Card`
                                            : `${editingItem?.page} • ${editingItem?.section}`}
                                    </Badge>
                                    <Badge variant="mono">
                                        {formGalleryImages.length + formGalleryPreviews.length} Photo
                                        {formGalleryImages.length + formGalleryPreviews.length === 1
                                            ? ''
                                            : 's'}
                                    </Badge>
                                </div>
                                <h3 className="mt-1 text-base font-bold text-foreground">
                                    {creatingNew
                                        ? `Create New ${formSection} Card on Visitor Website`
                                        : `Update Card & Slideshow Photos: ${editingItem?.label}`}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(null);
                                    setCreatingNew(false);
                                }}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveSlot} className="p-6 max-h-[82vh] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column: Live Image Preview, Computer Upload & Presets */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                            <span>Live Visitor Image Preview</span>
                                            <span className="font-mono text-[10px] text-primary">
                                                {formFocalPoint === 'contain'
                                                    ? 'Full Portrait (No Zoom)'
                                                    : `Focal: ${formFocalPoint}`}{' '}
                                                • {formAspectRatio}
                                            </span>
                                        </label>
                                        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-inner">
                                            <img
                                                src={
                                                    filePreviewUrl ||
                                                    formImageUrl ||
                                                    'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80'
                                                }
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-45"
                                            />
                                            <img
                                                src={
                                                    filePreviewUrl ||
                                                    formImageUrl ||
                                                    'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1000&q=80'
                                                }
                                                alt={formImageAlt || formTitle}
                                                style={{
                                                    objectPosition:
                                                        formFocalPoint === 'contain'
                                                            ? 'center'
                                                            : formFocalPoint,
                                                }}
                                                className={`relative z-10 h-full w-full ${
                                                    formFocalPoint === 'contain'
                                                        ? 'object-contain p-2'
                                                        : 'object-cover'
                                                }`}
                                            />
                                            {selectedFile && (
                                                <span className="absolute top-3 left-3 z-20 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                                                    Local File Ready: {selectedFile.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Image File from Computer */}
                                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <Upload className="h-3.5 w-3.5 text-primary" />
                                                Option 1: Upload Primary Image File
                                            </span>
                                            {selectedFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setFilePreviewUrl(null);
                                                    }}
                                                    className="text-[11px] text-rose-600 hover:underline"
                                                >
                                                    Clear file
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            disabled={!canEditImages}
                                            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                                        />
                                    </div>

                                    {/* Direct Image URL */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">
                                            Option 2: Primary Image URL
                                        </label>
                                        <Input
                                            value={formImageUrl}
                                            onChange={(e) => {
                                                setFormImageUrl(e.target.value);
                                                setSelectedFile(null);
                                                setFilePreviewUrl(null);
                                            }}
                                            disabled={!canEditImages}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>

                                    {/* Focal Point & Aspect Ratio */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                Image Fit / Zoom Mode
                                            </label>
                                            <Select
                                                value={formFocalPoint}
                                                onValueChange={setFormFocalPoint}
                                                searchable={false}
                                                clearable={false}
                                                options={[
                                                    {
                                                        value: 'contain',
                                                        label: 'Full Portrait (No Zoom)',
                                                    },
                                                    { value: 'center', label: 'Cover • Center' },
                                                    { value: 'top', label: 'Cover • Top' },
                                                    { value: 'bottom', label: 'Cover • Bottom' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                Aspect Ratio
                                            </label>
                                            <Select
                                                value={formAspectRatio}
                                                onValueChange={setFormAspectRatio}
                                                searchable={false}
                                                clearable={false}
                                                options={[
                                                    { value: '21:9', label: '21:9 Ultra Hero' },
                                                    { value: '16:9', label: '16:9 Widescreen' },
                                                    { value: '4:3', label: '4:3 Feature Card' },
                                                    { value: '1:1', label: '1:1 Portrait Square' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Multi-Image Slideshow + Page Target, Headline, Subtitle, Body, CTA */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* MULTI-IMAGE CARD GALLERY MANAGER */}
                                    <div className="rounded-xl border border-primary/35 bg-primary/5 p-3.5 space-y-2.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                    <Layers className="h-4 w-4 text-primary" />
                                                    Multiple Card Images (Auto-Rotating Slideshow + Next/Prev)
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Add multiple photos to this card. On the Landing Page (&ldquo;Life at Kingdom Life Butuan&rdquo;), they automatically cycle and allow Next / Prev browsing.
                                                </p>
                                            </div>
                                            <label className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 cursor-pointer">
                                                <Plus className="h-3.5 w-3.5" />
                                                Upload Multiple Photos
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    disabled={!canEditImages}
                                                    onChange={handleMultipleGalleryFilesSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                value={extraSlideUrl}
                                                onChange={(e) => setExtraSlideUrl(e.target.value)}
                                                placeholder="Or paste an image URL to add to this card's slideshow..."
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addSlideUrlToFormGallery}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add URL
                                            </Button>
                                        </div>

                                        {(formGalleryImages.length > 0 ||
                                            formGalleryPreviews.length > 0) && (
                                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 pt-1">
                                                {formGalleryImages.map((imgUrl, idx) => (
                                                    <div
                                                        key={`${imgUrl}-${idx}`}
                                                        className="group relative h-14 overflow-hidden rounded-lg border border-border bg-slate-900"
                                                    >
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Slide ${idx + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <span className="absolute bottom-0.5 left-1 rounded bg-black/75 px-1 font-mono text-[9px] font-bold text-white">
                                                            #{idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSlideFromFormGallery(imgUrl)
                                                            }
                                                            className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white hover:opacity-100 cursor-pointer"
                                                        >
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formGalleryPreviews.map((pUrl, idx) => (
                                                    <div
                                                        key={`new-slide-${idx}`}
                                                        className="relative h-14 overflow-hidden rounded-lg border-2 border-emerald-500 bg-slate-900"
                                                    >
                                                        <img
                                                            src={pUrl}
                                                            alt="New upload"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <span className="absolute bottom-0.5 left-1 rounded bg-emerald-600 px-1 font-mono text-[8px] font-bold text-white">
                                                            NEW
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Target Visitor Page
                                            </label>
                                            <Select
                                                value={formPage}
                                                onValueChange={setFormPage}
                                                searchable={false}
                                                clearable={false}
                                                options={[
                                                    { value: 'Landing Page', label: 'Landing Page (Home)' },
                                                    { value: 'About Us', label: 'About Us & Leadership' },
                                                    { value: 'Ministries', label: 'Ministries & Worship Team' },
                                                    { value: 'Sermons & Media', label: 'Sermons & Media' },
                                                    { value: 'Events & Gatherings', label: 'Events & Gatherings' },
                                                    { value: 'Global / Branding', label: 'Global / Fellowship Gallery' },
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Page Section Group
                                            </label>
                                            <Select
                                                value={formSection}
                                                onValueChange={setFormSection}
                                                searchable={false}
                                                clearable={false}
                                                options={[
                                                    { value: 'Worship Team', label: 'Worship Team (Dynamic Cards)' },
                                                    { value: 'Pastoral Leadership', label: 'Pastoral Leadership (Dynamic Cards)' },
                                                    { value: 'Fellowship Gallery', label: 'Fellowship Gallery (Auto-Slideshow Cards)' },
                                                    { value: 'Hero Banner', label: 'Hero Banner' },
                                                    { value: 'Our Story & Heritage', label: 'Our Story & Heritage' },
                                                    { value: 'Ministry Pillars', label: 'Ministry Pillars' },
                                                    { value: 'Recent Messages', label: 'Recent Messages' },
                                                    { value: 'Upcoming Gatherings', label: 'Upcoming Gatherings' },
                                                    { value: 'Giving & Generosity', label: 'Giving & Generosity' },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Admin Slot Label
                                            </label>
                                            <Input
                                                value={formLabel}
                                                onChange={(e) => setFormLabel(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Image Alt Text (SEO / Accessibility)
                                            </label>
                                            <Input
                                                value={formImageAlt}
                                                onChange={(e) => setFormImageAlt(e.target.value)}
                                                placeholder="Describe the image for screen readers"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground">
                                            {formSection === 'Worship Team'
                                                ? '1. Worship Team Member Full Name * (Displayed on Card)'
                                                : 'Visitor Headline / Full Name / Card Title *'}
                                        </label>
                                        <Input
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            placeholder={
                                                formSection === 'Worship Team'
                                                    ? 'e.g. Bro. Nathan Rivera'
                                                    : 'Card Headline or Full Name'
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">
                                            {formSection === 'Worship Team'
                                                ? '2. Instrument / Worship Role * (Displayed as Badge on Card)'
                                                : 'Subtitle / Role / Instrument / Schedule Badge'}
                                        </label>
                                        {formSection === 'Worship Team' && (
                                            <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-2">
                                                <div className="text-[11px] font-semibold text-foreground">
                                                    Click an Instrument / Role below (or type custom below):
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        'Worship Leader',
                                                        'Guitarist',
                                                        'Bass',
                                                        'Tambourine Dancer',
                                                        'Keys',
                                                        'Drummer',
                                                        'Acoustic Guitar',
                                                        'Backup Vocals',
                                                        'Sound & Media',
                                                    ].map((inst) => {
                                                        const isSelected = formSubtitle
                                                            .toLowerCase()
                                                            .includes(inst.toLowerCase());
                                                        return (
                                                            <button
                                                                key={inst}
                                                                type="button"
                                                                onClick={() => setFormSubtitle(inst)}
                                                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                                                        : 'border-border bg-card text-foreground hover:border-primary/50'
                                                                }`}
                                                            >
                                                                {inst}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <Input
                                            value={formSubtitle}
                                            onChange={(e) => setFormSubtitle(e.target.value)}
                                            placeholder={
                                                formSection === 'Worship Team'
                                                    ? 'e.g. Guitarist, Worship Leader, Bass, Tambourine Dancer, Keys'
                                                    : 'e.g. WORSHIP LEADER • SOUND OF HEAVEN'
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground">
                                            {formSection === 'Worship Team'
                                                ? '3. Short Bio / Note (Optional)'
                                                : 'Paragraph Description / Bio / Content Body'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formBody}
                                            onChange={(e) => setFormBody(e.target.value)}
                                            placeholder={
                                                formSection === 'Worship Team'
                                                    ? 'Optional short bio (or leave blank to only show Photo, Name, and Instrument)...'
                                                    : ''
                                            }
                                            className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-sm text-foreground shadow-2xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/35"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Call-to-Action Button Label
                                            </label>
                                            <Input
                                                value={formCtaText}
                                                onChange={(e) => setFormCtaText(e.target.value)}
                                                placeholder="Plan Your Visit"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground">
                                                Button Target / Link
                                            </label>
                                            <Input
                                                value={formCtaLink}
                                                onChange={(e) => setFormCtaLink(e.target.value)}
                                                placeholder="#visit"
                                            />
                                        </div>
                                    </div>

                                    {/* Publish Toggle & Actions */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            {!creatingNew && editingItem && canDeleteSlot && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteSlot(editingItem)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete Slot
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingItem(null);
                                                    setCreatingNew(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={submitting || !canEditImages}
                                            >
                                                <RefreshCw
                                                    className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`}
                                                />
                                                {submitting
                                                    ? 'Publishing to Visitor Site...'
                                                    : creatingNew
                                                      ? 'Create & Publish Slot'
                                                      : 'Save & Update Visitor Image'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

