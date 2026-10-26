import * as React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Compass,
    Flame,
    Globe,
    Heart,
    Image as ImageIcon,
    Layers,
    LayoutDashboard,
    LogIn,
    LogOut,
    MapPin,
    Moon,
    Music,
    Pencil,
    Phone,
    Play,
    Plus,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Sun,
    Trash2,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { DonationRecord, SharedPageProps, SiteContent } from '@/types';

interface WelcomeProps {
    contents: SiteContent[];
    initialTab?: string;
    churchStats: {
        members_count: number;
        life_groups_count: number;
        years_in_butuan: number;
        barangays_reached: number;
    };
    donations?: DonationRecord[];
}

function getSlotSlides(slot?: SiteContent): string[] {
    if (!slot) return [];
    const raw = Array.isArray(slot.gallery_images) ? [...slot.gallery_images] : [];
    if (slot.image_url && !raw.includes(slot.image_url)) {
        raw.unshift(slot.image_url);
    }
    return raw.map((u) => (u || '').trim()).filter(Boolean);
}

function AutoSwipeImageFrame({
    slot,
    editOverlay,
    className = 'relative h-72 sm:h-80 w-full overflow-hidden',
    children,
    dotsBottomClass = 'bottom-3',
}: {
    slot?: SiteContent;
    editOverlay: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    dotsBottomClass?: string;
}) {
    const slides = React.useMemo(() => getSlotSlides(slot), [slot]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const dragStartXRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (currentIndex >= slides.length) {
            setCurrentIndex(0);
        }
    }, [slides.length, currentIndex]);

    React.useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => window.clearInterval(timer);
    }, [slides.length, isPaused]);

    const handleDragStart = (clientX: number, target: EventTarget | null) => {
        if (slides.length <= 1) return;
        if (target instanceof HTMLElement && target.closest('button')) return;
        dragStartXRef.current = clientX;
    };

    const handleDragEnd = (clientX: number) => {
        if (dragStartXRef.current === null || slides.length <= 1) return;
        const deltaX = clientX - dragStartXRef.current;
        dragStartXRef.current = null;
        if (Math.abs(deltaX) < 25) return;
        if (deltaX < 0) {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        } else {
            setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }
    };

    const activeImage = slides[currentIndex] || slot?.image_url || '';

    return (
        <div
            className={`${className} ${
                slides.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''
            }`}
            style={{ touchAction: 'pan-y' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
                setIsPaused(false);
                dragStartXRef.current = null;
            }}
            onPointerDown={(e) => handleDragStart(e.clientX, e.target)}
            onPointerUp={(e) => handleDragEnd(e.clientX)}
            onPointerCancel={() => {
                dragStartXRef.current = null;
            }}
            onTouchStart={(e) => {
                if (e.touches.length > 0) {
                    handleDragStart(e.touches[0].clientX, e.target);
                }
            }}
            onTouchEnd={(e) => {
                if (e.changedTouches.length > 0) {
                    handleDragEnd(e.changedTouches[0].clientX);
                }
            }}
        >
            {editOverlay}

            {slides.length > 0 ? (
                slides.map((imgUrl, idx) => (
                    <img
                        key={`${slot?.id || 'frame'}-slide-${idx}`}
                        src={imgUrl}
                        draggable={false}
                        alt={`${slot?.image_alt || slot?.title || 'KLB Photo'} (${idx + 1}/${slides.length})`}
                        style={{ objectPosition: slot?.focal_point || 'center' }}
                        className={`absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ${
                            idx === currentIndex
                                ? 'opacity-100 scale-100 z-1'
                                : 'opacity-0 scale-105 pointer-events-none'
                        }`}
                    />
                ))
            ) : (
                <img
                    src={activeImage}
                    draggable={false}
                    alt={slot?.image_alt || slot?.title || 'KLB Photo'}
                    style={{ objectPosition: slot?.focal_point || 'center' }}
                    className="h-full w-full object-cover select-none"
                />
            )}

            {slides.length > 1 && (
                <>
                    <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 ring-1 ring-white/20 pointer-events-none">
                        <Layers className="h-3 w-3" />
                        <span>
                            {currentIndex + 1}/{slides.length}
                        </span>
                    </div>

                    <div
                        className={`absolute ${dotsBottomClass} left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/65 px-2.5 py-1 backdrop-blur-xs`}
                    >
                        {slides.map((_, idx) => (
                            <button
                                key={`frame-dot-${idx}`}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                aria-label={`View image ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-4 bg-sky-400'
                                        : 'w-1.5 bg-white/50 hover:bg-white'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {children}
        </div>
    );
}

function MultiImageGalleryCard({
    slot,
    editOverlay,
    variant = 'landing',
    imageHeightClass = 'h-52',
    subtitleStyle = 'mono',
}: {
    slot: SiteContent;
    editOverlay: React.ReactNode;
    variant?: 'landing' | 'gallery-tab' | 'standard-card';
    imageHeightClass?: string;
    subtitleStyle?: 'mono' | 'badge';
}) {
    const slides = React.useMemo(() => getSlotSlides(slot), [slot]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const dragStartXRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (currentIndex >= slides.length) {
            setCurrentIndex(0);
        }
    }, [slides.length, currentIndex]);

    React.useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => window.clearInterval(timer);
    }, [slides.length, isPaused]);

    const handleDragStart = (clientX: number, target: EventTarget | null) => {
        if (slides.length <= 1) return;
        if (target instanceof HTMLElement && target.closest('button')) return;
        dragStartXRef.current = clientX;
    };

    const handleDragEnd = (clientX: number) => {
        if (dragStartXRef.current === null || slides.length <= 1) return;
        const deltaX = clientX - dragStartXRef.current;
        dragStartXRef.current = null;
        if (Math.abs(deltaX) < 25) return;
        if (deltaX < 0) {
            // Dragged left -> next image
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        } else {
            // Dragged right -> previous image
            setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }
    };

    const dragProps =
        slides.length > 1
            ? {
                  onPointerDown: (e: React.PointerEvent) => handleDragStart(e.clientX, e.target),
                  onPointerUp: (e: React.PointerEvent) => handleDragEnd(e.clientX),
                  onPointerCancel: () => {
                      dragStartXRef.current = null;
                  },
                  onTouchStart: (e: React.TouchEvent) => {
                      if (e.touches.length > 0) {
                          handleDragStart(e.touches[0].clientX, e.target);
                      }
                  },
                  onTouchEnd: (e: React.TouchEvent) => {
                      if (e.changedTouches.length > 0) {
                          handleDragEnd(e.changedTouches[0].clientX);
                      }
                  },
              }
            : {};

    const activeImage = slides[currentIndex] || slot.image_url || '';

    if (variant === 'standard-card') {
        return (
            <Card
                className="group overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                    setIsPaused(false);
                    dragStartXRef.current = null;
                }}
            >
                <div>
                    <div
                        className={`relative ${imageHeightClass} w-full overflow-hidden bg-slate-950 ${
                            slides.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''
                        }`}
                        style={{ touchAction: 'pan-y' }}
                        {...dragProps}
                    >
                        {editOverlay}

                        {slides.length > 0 ? (
                            slides.map((imgUrl, idx) => (
                                <img
                                    key={`${slot.id}-std-slide-${idx}`}
                                    src={imgUrl}
                                    draggable={false}
                                    alt={`${slot.image_alt || slot.title} (${idx + 1}/${slides.length})`}
                                    style={{ objectPosition: slot.focal_point || 'center' }}
                                    className={`absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ${
                                        idx === currentIndex
                                            ? 'opacity-100 scale-100 z-1'
                                            : 'opacity-0 scale-105 pointer-events-none'
                                    }`}
                                />
                            ))
                        ) : (
                            <img
                                src={activeImage}
                                draggable={false}
                                alt={slot.image_alt || slot.title}
                                style={{ objectPosition: slot.focal_point || 'center' }}
                                className="h-full w-full object-cover select-none"
                            />
                        )}

                        {slides.length > 1 && (
                            <>
                                <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 ring-1 ring-white/20 pointer-events-none">
                                    <Layers className="h-3 w-3" />
                                    <span>
                                        {currentIndex + 1}/{slides.length}
                                    </span>
                                </div>

                                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/65 px-2.5 py-1 backdrop-blur-xs">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={`std-dot-${idx}`}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentIndex(idx);
                                            }}
                                            aria-label={`View image ${idx + 1}`}
                                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                                idx === currentIndex
                                                    ? 'w-4 bg-sky-400'
                                                    : 'w-1.5 bg-white/50 hover:bg-white'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <CardContent className="p-5 space-y-2">
                        {subtitleStyle === 'badge' ? (
                            <Badge variant="default">{slot.subtitle}</Badge>
                        ) : (
                            <div className="font-mono text-[10px] font-bold text-primary uppercase">
                                {slot.subtitle}
                            </div>
                        )}
                        <h3 className="text-base font-bold text-foreground">{slot.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{slot.body}</p>
                    </CardContent>
                </div>
            </Card>
        );
    }

    if (variant === 'gallery-tab') {
        return (
            <Card
                className="group overflow-hidden hover:border-primary/50 transition-all"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                    setIsPaused(false);
                    dragStartXRef.current = null;
                }}
            >
                <div
                    className={`relative h-72 w-full overflow-hidden bg-slate-950 ${
                        slides.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''
                    }`}
                    style={{ touchAction: 'pan-y' }}
                    {...dragProps}
                >
                    {editOverlay}

                    {slides.map((imgUrl, idx) => (
                        <img
                            key={`${slot.id}-slide-${idx}`}
                            src={imgUrl}
                            draggable={false}
                            alt={`${slot.image_alt || slot.title} (${idx + 1}/${slides.length})`}
                            style={{ objectPosition: slot.focal_point || 'center' }}
                            className={`absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ${
                                idx === currentIndex
                                    ? 'opacity-100 scale-100 z-1'
                                    : 'opacity-0 scale-105 pointer-events-none'
                            }`}
                        />
                    ))}

                    {slides.length > 1 && (
                        <>
                            <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 ring-1 ring-white/20 pointer-events-none">
                                <Layers className="h-3 w-3" />
                                <span>
                                    {currentIndex + 1} / {slides.length} Photos
                                </span>
                            </div>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/65 px-2.5 py-1 backdrop-blur-xs">
                                {slides.map((_, idx) => (
                                    <button
                                        key={`dot-${idx}`}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(idx);
                                        }}
                                        aria-label={`View image ${idx + 1}`}
                                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                            idx === currentIndex
                                                ? 'w-5 bg-sky-400'
                                                : 'w-1.5 bg-white/50 hover:bg-white'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <CardContent className="p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-[10px] font-bold text-primary uppercase">
                            {slot.subtitle}
                        </div>
                        {slides.length > 1 && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                                Auto-Rotating • Drag left/right for next image
                            </span>
                        )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{slot.title}</h3>
                    <p className="text-xs text-muted-foreground">{slot.body}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div
            className={`group relative h-72 overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-xs ${
                slides.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''
            }`}
            style={{ touchAction: 'pan-y' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
                setIsPaused(false);
                dragStartXRef.current = null;
            }}
            {...dragProps}
        >
            {editOverlay}

            {slides.length > 0 ? (
                slides.map((imgUrl, idx) => (
                    <img
                        key={`${slot.id}-landing-slide-${idx}`}
                        src={imgUrl}
                        draggable={false}
                        alt={`${slot.image_alt || slot.title} (${idx + 1}/${slides.length})`}
                        style={{ objectPosition: slot.focal_point || 'center' }}
                        className={`absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ${
                            idx === currentIndex
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-105 pointer-events-none'
                        }`}
                    />
                ))
            ) : (
                <img
                    src={activeImage}
                    draggable={false}
                    alt={slot.image_alt || slot.title}
                    className="h-full w-full object-cover select-none"
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent pointer-events-none" />

            {slides.length > 1 && (
                <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 ring-1 ring-white/20 pointer-events-none">
                    <Layers className="h-3 w-3" />
                    <span>
                        {currentIndex + 1}/{slides.length}
                    </span>
                </div>
            )}

            <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[10px] text-sky-300 truncate">
                        {slot.subtitle}
                    </div>
                    {slides.length > 1 && (
                        <div className="flex items-center gap-1 shrink-0">
                            {slides.map((_, idx) => (
                                <button
                                    key={`landing-dot-${idx}`}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    aria-label={`Slide ${idx + 1}`}
                                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                        idx === currentIndex
                                            ? 'w-4 bg-sky-400'
                                            : 'w-1.5 bg-white/45 hover:bg-white'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="text-sm font-bold leading-snug">{slot.title}</div>
                {slot.body && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {slot.body}
                    </p>
                )}
            </div>
        </div>
    );
}

const WORSHIP_INSTRUMENT_PRESETS = [
    'Worship Leader',
    'Guitarist',
    'Bass',
    'Tambourine Dancer',
    'Keys',
    'Drummer',
    'Acoustic Guitar',
    'Backup Vocals',
    'Sound & Media',
] as const;

function PortraitLeaderCard({
    member,
    slot,
    editOverlay,
    canEdit,
    onEdit,
    canDelete,
    onDelete,
}: {
    member?: SiteContent;
    slot?: SiteContent;
    editOverlay: React.ReactNode;
    canEdit?: boolean;
    onEdit?: (s: SiteContent) => void;
    canDelete?: boolean;
    onDelete?: (s: SiteContent) => void;
}) {
    const item = member || slot;
    if (!item) return null;

    const slides = React.useMemo(() => getSlotSlides(item), [item]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const dragStartXRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (currentIndex >= slides.length) {
            setCurrentIndex(0);
        }
    }, [slides.length, currentIndex]);

    React.useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 3500);
        return () => window.clearInterval(timer);
    }, [slides.length, isPaused]);

    const handleDragStart = (clientX: number, target: EventTarget | null) => {
        if (slides.length <= 1) return;
        if (target instanceof HTMLElement && target.closest('button')) return;
        dragStartXRef.current = clientX;
    };

    const handleDragEnd = (clientX: number) => {
        if (dragStartXRef.current === null || slides.length <= 1) return;
        const deltaX = clientX - dragStartXRef.current;
        dragStartXRef.current = null;
        if (Math.abs(deltaX) < 25) return;
        if (deltaX < 0) {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        } else {
            setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }
    };

    const activeImage = slides[currentIndex] || item.image_url || '';
    const isCoverMode =
        item.focal_point === 'cover-top' || item.focal_point === 'cover-center';
    const isWorshipMember = item.section === 'Worship Team';

    return (
        <Card
            className="group overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
                setIsPaused(false);
                dragStartXRef.current = null;
            }}
        >
            <div>
                <div
                    className={`relative h-80 w-full overflow-hidden bg-slate-950/90 flex items-center justify-center ${
                        slides.length > 1 ? 'cursor-grab active:cursor-grabbing select-none' : ''
                    }`}
                    style={{ touchAction: 'pan-y' }}
                    onPointerDown={(e) => handleDragStart(e.clientX, e.target)}
                    onPointerUp={(e) => handleDragEnd(e.clientX)}
                    onPointerCancel={() => {
                        dragStartXRef.current = null;
                    }}
                    onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                            handleDragStart(e.touches[0].clientX, e.target);
                        }
                    }}
                    onTouchEnd={(e) => {
                        if (e.changedTouches.length > 0) {
                            handleDragEnd(e.changedTouches[0].clientX);
                        }
                    }}
                >
                    {editOverlay}
                    {/* Soft blurred studio backdrop so any aspect ratio portrait looks full and never cuts off heads/faces */}
                    <img
                        src={activeImage}
                        draggable={false}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />
                    <img
                        src={activeImage}
                        draggable={false}
                        alt={item.image_alt || item.title}
                        style={{
                            objectPosition:
                                item.focal_point === 'cover-top'
                                    ? 'top'
                                    : item.focal_point === 'cover-center'
                                      ? 'center'
                                      : 'center',
                        }}
                        className={`relative z-10 h-full w-full select-none transition-transform duration-300 group-hover:scale-[1.02] ${
                            isCoverMode ? 'object-cover' : 'object-contain p-1.5'
                        }`}
                    />
                    {slides.length > 1 && (
                        <>
                            <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl bg-slate-950/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 ring-1 ring-white/20 pointer-events-none">
                                <Layers className="h-3 w-3" />
                                <span>
                                    {currentIndex + 1}/{slides.length}
                                </span>
                            </div>
                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/65 px-2.5 py-1 backdrop-blur-xs">
                                {slides.map((_, idx) => (
                                    <button
                                        key={`leader-dot-${idx}`}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(idx);
                                        }}
                                        aria-label={`View image ${idx + 1}`}
                                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                            idx === currentIndex
                                                ? 'w-4 bg-sky-400'
                                                : 'w-1.5 bg-white/50 hover:bg-white'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <CardContent className="p-5 space-y-2.5">
                    {isWorshipMember ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold text-primary uppercase">
                            <Music className="h-3 w-3 shrink-0" />
                            <span>{item.subtitle || 'Worship Team'}</span>
                        </div>
                    ) : (
                        <div className="font-mono text-[10px] font-bold text-primary uppercase">
                            {item.subtitle}
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-extrabold text-foreground leading-snug">
                            {item.title}
                        </h3>
                    </div>
                    {item.body && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.body}
                        </p>
                    )}
                </CardContent>
            </div>
            {(canEdit || canDelete) && (
                <div className="px-5 pb-4 pt-2 border-t border-border/60 flex items-center justify-between gap-2 bg-muted/20">
                    {canEdit && onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors cursor-pointer"
                        >
                            <Camera className="h-3 w-3" />
                            Edit Name / Instrument / Photo
                        </button>
                    )}
                    {canDelete && onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 transition-colors cursor-pointer"
                        >
                            <Trash2 className="h-3 w-3" />
                            Remove
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
}

export default function Welcome({
    contents,
    initialTab = 'landing',
    churchStats,
    donations = [],
}: WelcomeProps) {
    const { auth, flash } = usePage<SharedPageProps>().props;
    const user = auth?.user ?? null;
    const canEditContent = Boolean(
        user &&
            user.id &&
            user.status === 'Active' &&
            ['Primary Admin', 'Admin', 'Content Creator'].includes(user.role)
    );

    const [activeTab, setActiveTab] = React.useState<
        'landing' | 'about' | 'ministries' | 'sermons' | 'events' | 'gallery'
    >(() => {
        if (initialTab === 'about') return 'about';
        return 'landing';
    });

    const [darkMode, setDarkMode] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('klb_theme_dark') === 'true';
    });

    // Live Admin On-Page Image Edit Mode (enabled by default so Admins can immediately see they can edit any image!)
    const [adminEditOverlay, setAdminEditOverlay] = React.useState<boolean>(true);
    const [editingSlot, setEditingSlot] = React.useState<SiteContent | null>(null);
    const [slotTitle, setSlotTitle] = React.useState('');
    const [slotSubtitle, setSlotSubtitle] = React.useState('');
    const [slotBody, setSlotBody] = React.useState('');
    const [slotImageUrl, setSlotImageUrl] = React.useState('');
    const [slotFocalPoint, setSlotFocalPoint] = React.useState('center');
    const [slotFile, setSlotFile] = React.useState<File | null>(null);
    const [slotPreview, setSlotPreview] = React.useState<string | null>(null);
    const [slotGalleryImages, setSlotGalleryImages] = React.useState<string[]>([]);
    const [slotGalleryFiles, setSlotGalleryFiles] = React.useState<File[]>([]);
    const [slotGalleryPreviews, setSlotGalleryPreviews] = React.useState<string[]>([]);
    const [extraGalleryUrl, setExtraGalleryUrl] = React.useState('');
    const [savingSlot, setSavingSlot] = React.useState(false);

    // Dynamic Card Creation Modal State (Worship Team, Pastors, or Fellowship Gallery)
    const [creatingCategory, setCreatingCategory] = React.useState<
        'Worship Team' | 'Pastoral Leadership' | 'Fellowship Gallery' | null
    >(null);
    const [newTitle, setNewTitle] = React.useState('');
    const [newSubtitle, setNewSubtitle] = React.useState('');
    const [newBody, setNewBody] = React.useState('');
    const [newImageUrl, setNewImageUrl] = React.useState('');
    const [newFile, setNewFile] = React.useState<File | null>(null);
    const [newPreview, setNewPreview] = React.useState<string | null>(null);
    const [newGalleryFiles, setNewGalleryFiles] = React.useState<File[]>([]);
    const [newGalleryPreviews, setNewGalleryPreviews] = React.useState<string[]>([]);
    const [creatingCard, setCreatingCard] = React.useState(false);

    const [visitSubmitted, setVisitSubmitted] = React.useState(false);

    // Donation Form State
    const [donorName, setDonorName] = React.useState('');
    const [donorEmail, setDonorEmail] = React.useState('');
    const [donorPhone, setDonorPhone] = React.useState('');
    const [donationAmount, setDonationAmount] = React.useState('1000');
    const [donationFund, setDonationFund] = React.useState('Tithes & Offerings');
    const [paymentMethod, setPaymentMethod] = React.useState('GCash (0917-842-1001)');
    const [referenceNumber, setReferenceNumber] = React.useState('');
    const [donationMessage, setDonationMessage] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const [submittingDonation, setSubmittingDonation] = React.useState(false);

    const handleDonationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDonation(true);
        router.post(
            '/donations',
            {
                donor_name: donorName,
                donor_email: donorEmail,
                donor_phone: donorPhone,
                amount: Number(donationAmount),
                fund_category: donationFund,
                payment_method: paymentMethod,
                reference_number: referenceNumber,
                message: donationMessage,
                is_anonymous: isAnonymous,
            },
            {
                preserveScroll: true,
                onFinish: () => setSubmittingDonation(false),
                onSuccess: () => {
                    setDonorName('');
                    setDonorEmail('');
                    setDonorPhone('');
                    setReferenceNumber('');
                    setDonationMessage('');
                },
            }
        );
    };

    React.useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', darkMode);
            window.localStorage.setItem('klb_theme_dark', String(darkMode));
        }
    }, [darkMode]);

    // Helper to look up a CMS slot by key
    const getSlot = React.useCallback(
        (key: string): SiteContent | undefined =>
            contents.find((c) => c.key === key),
        [contents]
    );

    const openQuickImageEditor = (slot?: SiteContent) => {
        if (!canEditContent || !slot) return;
        setEditingSlot(slot);
        setSlotTitle(slot.title);
        setSlotSubtitle(slot.subtitle || '');
        setSlotBody(slot.body || '');
        setSlotImageUrl(slot.image_url || '');
        setSlotFocalPoint(
            slot.section === 'Pastoral Leadership' || slot.section === 'Worship Team'
                ? slot.focal_point === 'cover-top' || slot.focal_point === 'cover-center'
                    ? slot.focal_point
                    : 'contain'
                : slot.focal_point || 'center'
        );
        setSlotFile(null);
        setSlotPreview(null);
        setSlotGalleryImages(getSlotSlides(slot));
        setSlotGalleryFiles([]);
        setSlotGalleryPreviews([]);
        setExtraGalleryUrl('');
    };

    const handleQuickFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setSlotFile(f);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') setSlotPreview(reader.result);
        };
        reader.readAsDataURL(f);
    };

    const handleQuickGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        const files = Array.from(fileList);
        setSlotGalleryFiles((prev) => [...prev, ...files]);

        files.forEach((f) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setSlotGalleryPreviews((prev) => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(f);
        });
        e.target.value = '';
    };

    const addExtraUrlToGallery = () => {
        const trimmed = extraGalleryUrl.trim();
        if (!trimmed) return;
        if (!slotGalleryImages.includes(trimmed)) {
            setSlotGalleryImages((prev) => [...prev, trimmed]);
        }
        if (!slotImageUrl) {
            setSlotImageUrl(trimmed);
        }
        setExtraGalleryUrl('');
    };

    const removeGallerySlide = (urlToRemove: string) => {
        setSlotGalleryImages((prev) => {
            const next = prev.filter((u) => u !== urlToRemove);
            if (slotImageUrl === urlToRemove) {
                setSlotImageUrl(next[0] || '');
            }
            return next;
        });
    };

    const handleQuickSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlot) return;
        setSavingSlot(true);

        const payload: Record<string, any> = {
            page: editingSlot.page,
            section: editingSlot.section,
            label: editingSlot.label,
            title: slotTitle,
            subtitle: slotSubtitle,
            body: slotBody,
            cta_text: editingSlot.cta_text,
            cta_link: editingSlot.cta_link,
            image_url: slotImageUrl,
            gallery_images: slotGalleryImages,
            image_alt: editingSlot.image_alt || slotTitle,
            focal_point: slotFocalPoint || 'center',
            aspect_ratio: editingSlot.aspect_ratio || '16:9',
            is_published: 1,
        };

        if (slotFile) {
            payload.image_file = slotFile;
        }
        if (slotPreview) {
            payload.image_base64 = slotPreview;
        }
        if (slotGalleryFiles.length > 0) {
            payload.gallery_files = slotGalleryFiles;
        }
        if (slotGalleryPreviews.length > 0) {
            payload.gallery_base64 = slotGalleryPreviews;
        }

        router.post(`/admin/cms/${editingSlot.id}`, payload, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setSavingSlot(false),
            onSuccess: () => {
                setEditingSlot(null);
            },
        });
    };

    const handleDeleteSlot = (slot: SiteContent) => {
        if (!canEditContent) return;
        if (
            !window.confirm(
                `Remove "${slot.title}" (${slot.label}) from the ${slot.section} section?`
            )
        ) {
            return;
        }
        router.delete(`/admin/cms/${slot.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSlot(null);
            },
        });
    };

    const openCreateCardModal = (
        category: 'Worship Team' | 'Pastoral Leadership' | 'Fellowship Gallery'
    ) => {
        if (!canEditContent) return;
        setCreatingCategory(category);
        if (category === 'Worship Team') {
            setNewTitle('');
            setNewSubtitle('Worship Leader');
            setNewBody('');
            setNewImageUrl(
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80'
            );
        } else if (category === 'Pastoral Leadership') {
            setNewTitle('');
            setNewSubtitle('PASTORAL LEADERSHIP • KINGDOM LIFE BUTUAN');
            setNewBody('');
            setNewImageUrl(
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80'
            );
        } else {
            setNewTitle('');
            setNewSubtitle('SUNDAY CELEBRATION & FELLOWSHIP');
            setNewBody('');
            setNewImageUrl(
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80'
            );
        }
        setNewFile(null);
        setNewPreview(null);
        setNewGalleryFiles([]);
        setNewGalleryPreviews([]);
    };

    const handleCreateCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!creatingCategory) return;
        setCreatingCard(true);

        const slug = `${creatingCategory.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;
        const page =
            creatingCategory === 'Worship Team'
                ? 'Ministries'
                : creatingCategory === 'Pastoral Leadership'
                  ? 'About Us'
                  : 'Global / Branding';

        const payload: Record<string, any> = {
            key: slug,
            page,
            section: creatingCategory,
            label: `${creatingCategory} Card — ${newTitle}`,
            title: newTitle,
            subtitle: newSubtitle,
            body: newBody,
            cta_text: creatingCategory,
            cta_link: '#ministries',
            image_url: newImageUrl,
            image_alt: newTitle,
            focal_point:
                creatingCategory === 'Worship Team' ||
                creatingCategory === 'Pastoral Leadership'
                    ? 'contain'
                    : 'center',
            aspect_ratio:
                creatingCategory === 'Fellowship Gallery' ? '4:3' : '1:1',
            is_published: 1,
        };

        if (newFile) {
            payload.image_file = newFile;
        }
        if (newPreview) {
            payload.image_base64 = newPreview;
        }
        if (newGalleryFiles.length > 0) {
            payload.gallery_files = newGalleryFiles;
        }
        if (newGalleryPreviews.length > 0) {
            payload.gallery_base64 = newGalleryPreviews;
        }

        router.post('/admin/cms', payload, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setCreatingCard(false),
            onSuccess: () => {
                setCreatingCategory(null);
            },
        });
    };

    // Slots grouped by category
    const heroBanner = getSlot('hero_main_banner');
    const heroWelcome = getSlot('hero_pastor_welcome');
    const visionBanner = getSlot('vision_mission_banner');
    const donationsBanner = getSlot('landing_donations_banner');

    const aboutStory = getSlot('about_story_photo');
    const aboutSanctuary = getSlot('about_sanctuary_photo');
    const aboutImpact = getSlot('about_community_impact');

    const pastorSlots = contents.filter((c) => c.section === 'Pastoral Leadership');
    const worshipTeamSlots = contents.filter((c) => c.section === 'Worship Team');
    const ministrySlots = contents.filter(
        (c) => c.page === 'Ministries' && c.section !== 'Worship Team'
    );
    const sermonSlots = contents.filter((c) => c.page === 'Sermons & Media');
    const eventSlots = contents.filter((c) => c.page === 'Events & Gatherings');
    const gallerySlots = contents.filter((c) => c.section === 'Fellowship Gallery');

    const renderEditableImageOverlay = (slot?: SiteContent) => {
        if (!canEditContent || !adminEditOverlay || !slot) return null;
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    openQuickImageEditor(slot);
                }}
                className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/25 hover:bg-primary transition-all cursor-pointer"
                title={`${user?.role}: Replace "${slot.label}" Image & Text`}
            >
                <Camera className="h-3.5 w-3.5 text-sky-300" />
                <span>Edit Image</span>
            </button>
        );
    };

    return (
        <>
            <Head title="Kingdom Life Butuan (KLB) — We Live a Kingdom Life Wherever We Are" />

            <div className="min-h-screen flex flex-col bg-background text-foreground">
                {/* Top Admin Live CMS Bar — ONLY shown when logged in */}
                {user && (
                    <div className="bg-slate-950 text-slate-100 border-b border-white/10 py-2 text-xs">
                        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/30 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-300 ring-1 ring-sky-400/30">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {user.name} • {user.role}
                                </span>
                                <span className="hidden md:inline text-slate-300">
                                    {canEditContent
                                        ? 'Authorized (Primary Admin / Admin / Content Creator): You can edit all content & images live.'
                                        : 'Read-Only Access: Only Primary Admin, Admin & Content Creator roles can edit content & images.'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {canEditContent && (
                                    <button
                                        type="button"
                                        onClick={() => setAdminEditOverlay((v) => !v)}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                            adminEditOverlay
                                                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                                                : 'bg-white/10 text-slate-300 hover:bg-white/15'
                                        }`}
                                    >
                                        <Camera className="h-3 w-3" />
                                        {adminEditOverlay
                                            ? 'On-Page Image Edit Buttons: ON'
                                            : 'On-Page Image Edit Buttons: OFF'}
                                    </button>
                                )}

                                {canEditContent && (
                                    <Link
                                        href="/admin?section=cms-images"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:opacity-95 transition-opacity"
                                    >
                                        <ImageIcon className="h-3 w-3" />
                                        Visual Image Studio
                                    </Link>
                                )}

                                <Link
                                    href="/admin"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
                                >
                                    <LayoutDashboard className="h-3 w-3" />
                                    Admin &amp; RBAC Portal
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => router.post('/logout')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                                    title="Sign out of your account"
                                >
                                    <LogOut className="h-3 w-3" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Flash Toast Feedback */}
                {flash?.success && (
                    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 pt-3">
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {/* Sticky Visitor Navigation Header */}
                <header className="sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur-xl">
                    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between gap-4">
                        {/* Church Logo & Title */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('landing')}
                            className="flex items-center gap-3 text-left cursor-pointer"
                        >
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
                                    <span className="hidden sm:inline-block rounded-md bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-primary/25">
                                        KLB
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    J.C. Aquino Ave., Butuan City • Sundays 8:30 AM &amp; 10:30 AM
                                </p>
                            </div>
                        </button>

                        {/* Visitor Navigation Tabs */}
                        <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-border/80 bg-muted/60 p-1">
                            {[
                                { id: 'landing', label: 'Home' },
                                { id: 'about', label: 'About Us & Pastors' },
                                { id: 'ministries', label: 'Ministries & Life Groups' },
                                { id: 'sermons', label: 'Sermons' },
                                { id: 'events', label: 'Events' },
                                { id: 'gallery', label: 'Gallery' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Right Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDarkMode((d) => !d)}
                                title="Toggle Dark/Light Theme"
                            >
                                {darkMode ? (
                                    <Sun className="h-4 w-4 text-amber-400" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </Button>

                            <a
                                href="#make-donation"
                                onClick={() => setActiveTab('landing')}
                                className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                            >
                                <Heart className="h-3.5 w-3.5 text-emerald-500" />
                                Make a Donation
                            </a>

                            <a
                                href="#visit-form"
                                onClick={() => setActiveTab('landing')}
                                className="hidden sm:inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
                            >
                                Plan Your Visit
                                <ArrowRight className="h-3.5 w-3.5" />
                            </a>

                            {!user && (
                                <Link
                                    href="/login"
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-muted/70 px-3.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                                    title="Staff, Admin & Content Creator Sign In / Personal Info Registration"
                                >
                                    <LogIn className="h-3.5 w-3.5 text-primary" />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation Strip */}
                    <div className="flex lg:hidden overflow-x-auto border-t border-border/60 px-4 py-2 gap-1.5">
                        {[
                            { id: 'landing', label: 'Home' },
                            { id: 'about', label: 'About Us' },
                            { id: 'ministries', label: 'Ministries' },
                            { id: 'sermons', label: 'Sermons' },
                            { id: 'events', label: 'Events' },
                            { id: 'gallery', label: 'Gallery' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* ========================================================= */}
                {/* TAB 1: FULL VISITOR LANDING PAGE                          */}
                {/* ========================================================= */}
                {activeTab === 'landing' && (
                    <main className="flex-1 space-y-20 pb-20">
                        {/* HERO SECTION */}
                        <section className="relative min-h-[580px] flex items-center overflow-hidden bg-slate-950 text-white">
                            <img
                                src={
                                    heroBanner?.image_url ||
                                    'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1800&q=85'
                                }
                                alt={heroBanner?.image_alt || 'Kingdom Life Butuan Worship'}
                                style={{ objectPosition: heroBanner?.focal_point || 'center' }}
                                className="absolute inset-0 h-full w-full object-cover opacity-45 scale-102"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/40" />
                            {renderEditableImageOverlay(heroBanner)}

                            <div className="relative z-10 mx-auto w-full px-4 sm:px-8 lg:px-12 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-sky-300 ring-1 ring-white/20">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>
                                            {heroBanner?.subtitle ||
                                                'KINGDOM LIFE BUTUAN (KLB) • CARAGA REGION'}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                                        {heroBanner?.title ||
                                            'We seek to live a Kingdom Life wherever we are.'}
                                    </h1>

                                    <p className="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
                                        {heroBanner?.body}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <a
                                            href="#visit-form"
                                            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-all"
                                        >
                                            {heroBanner?.cta_text || 'Plan Your Sunday Visit'}
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="#make-donation"
                                            className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500/20 backdrop-blur-md px-5 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/40 hover:bg-emerald-500/30 transition-all"
                                        >
                                            <Heart className="h-4 w-4" />
                                            Make a Donation
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('about')}
                                            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/12 backdrop-blur-md px-6 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20 transition-all cursor-pointer"
                                        >
                                            Discover Our Story &amp; Pastors
                                        </button>
                                    </div>

                                    {/* Service Times Strip */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                                        <div className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 ring-1 ring-white/15">
                                            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                                                <Clock className="h-3.5 w-3.5" />
                                                SUNDAY SERVICES
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-white">
                                                8:30 AM &amp; 10:30 AM
                                            </div>
                                            <div className="text-[11px] text-slate-300">
                                                Kids Kingdom Concurrent
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 ring-1 ring-white/15">
                                            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                                                <Flame className="h-3.5 w-3.5" />
                                                MIDWEEK PRAYER
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-white">
                                                Wednesdays • 6:30 PM
                                            </div>
                                            <div className="text-[11px] text-slate-300">
                                                Fire &amp; Intercession Night
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 ring-1 ring-white/15">
                                            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                                                <MapPin className="h-3.5 w-3.5" />
                                                OUR CAMPUS
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-white">
                                                J.C. Aquino Avenue
                                            </div>
                                            <div className="text-[11px] text-slate-300">
                                                Butuan City, Agusan del Norte
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Feature Visual Card on Hero */}
                                <div className="lg:col-span-5">
                                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 shadow-2xl">
                                        <AutoSwipeImageFrame
                                            slot={heroWelcome}
                                            editOverlay={renderEditableImageOverlay(heroWelcome)}
                                            className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none z-10" />
                                        </AutoSwipeImageFrame>
                                        <div className="p-6 space-y-2.5">
                                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-400">
                                                {heroWelcome?.subtitle}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">
                                                {heroWelcome?.title}
                                            </h3>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {heroWelcome?.body}
                                            </p>
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('about')}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:underline cursor-pointer"
                                                >
                                                    {heroWelcome?.cta_text || 'Meet Our Pastors'}
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* IMPACT METRICS BAR */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 -mt-12 relative z-20">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        label: 'Worshiping Family in Butuan',
                                        val: `${churchStats.members_count}+`,
                                        sub: 'Across 2 Sunday Celebrations',
                                    },
                                    {
                                        label: 'Active Butuan Life Groups',
                                        val: String(churchStats.life_groups_count),
                                        sub: 'Libertad, Ampayon, Baan & Langihan',
                                    },
                                    {
                                        label: 'Years of Faithful Ministry',
                                        val: `${churchStats.years_in_butuan} Yrs`,
                                        sub: 'Planted in Butuan City (Est. 2012)',
                                    },
                                    {
                                        label: 'Barangays & Outreaches',
                                        val: String(churchStats.barangays_reached),
                                        sub: 'Caraga Hope Missions Network',
                                    },
                                ].map((stat) => (
                                    <Card key={stat.label} className="p-5 shadow-md">
                                        <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">
                                            {stat.val}
                                        </div>
                                        <div className="mt-1 text-xs font-bold text-foreground">
                                            {stat.label}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {stat.sub}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* VISION & MANDATE FEATURE */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
                                <div className="lg:col-span-6 space-y-4">
                                    <Badge variant="default">
                                        {visionBanner?.subtitle || 'OUR APOSTOLIC MANDATE'}
                                    </Badge>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        {visionBanner?.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {visionBanner?.body}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
                                            <div className="text-xs font-bold text-foreground">
                                                Christ-Centered Preaching
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Uncompromised biblical truth anchored in the grace and power of Jesus.
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
                                            <div className="text-xs font-bold text-foreground">
                                                Authentic Life Groups
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Growing together in homes across every barangay of Butuan City.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex flex-wrap gap-3">
                                        <Button onClick={() => setActiveTab('about')}>
                                            Explore About Us &amp; Our Pastors
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('ministries')}
                                        >
                                            View KLB Ministries
                                        </Button>
                                    </div>
                                </div>

                                <AutoSwipeImageFrame
                                    slot={visionBanner}
                                    editOverlay={renderEditableImageOverlay(visionBanner)}
                                    className="lg:col-span-6 relative overflow-hidden rounded-2xl border border-border h-80 sm:h-96 bg-slate-950"
                                />
                            </div>
                        </section>

                        {/* MEET OUR PASTORS SHOWCASE ON LANDING PAGE */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">Shepherds &amp; Elders</Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Meet Our Pastors &amp; Leadership Team
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Dedicated to serving Jesus and equipping families across Butuan City. Portraits are framed in full studio fit so uploaded photos are never over-zoomed or cropped.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {canEditContent && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                openCreateCardModal('Pastoral Leadership')
                                            }
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Pastor / Leader Card
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setActiveTab('about')}>
                                        Our Full Story &amp; Pastors →
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {pastorSlots.map((pastor) => (
                                    <PortraitLeaderCard
                                        key={pastor.id}
                                        member={pastor}
                                        editOverlay={renderEditableImageOverlay(pastor)}
                                        canEdit={canEditContent}
                                        onEdit={openQuickImageEditor}
                                        canDelete={canEditContent}
                                        onDelete={handleDeleteSlot}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* MEET OUR WORSHIP TEAM (DYNAMIC ADMIN-MANAGED CARDS) */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">
                                        <Music className="h-3 w-3" />
                                        Sound of Heaven Worship Collective
                                    </Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Meet Our Worship Team
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Worship Leaders, Guitarists, Bass, Keys, Tambourine Dancers, and Sound Team leading Kingdom Life Butuan into God&apos;s presence.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {canEditContent ? (
                                        <Button
                                            size="sm"
                                            onClick={() => openCreateCardModal('Worship Team')}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Worship Team Member
                                        </Button>
                                    ) : (
                                        <Link href="/login">
                                            <Button size="sm" variant="outline">
                                                <LogIn className="h-3.5 w-3.5" />
                                                Admin Login to Add Worship Team
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('ministries')}
                                    >
                                        Worship &amp; Ministries →
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {worshipTeamSlots.map((member) => (
                                    <PortraitLeaderCard
                                        key={member.id}
                                        member={member}
                                        editOverlay={renderEditableImageOverlay(member)}
                                        canEdit={canEditContent}
                                        onEdit={openQuickImageEditor}
                                        canDelete={canEditContent}
                                        onDelete={handleDeleteSlot}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* MINISTRIES SHOWCASE ON LANDING PAGE */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">KLB Ministry Pillars</Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        There Is a Place for Your Whole Family
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        From Kids Kingdom and Campus Youth to Caraga Hope Outreach — every image below is managed via the KLB Admin Studio.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => setActiveTab('ministries')}>
                                    Explore All Ministries →
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {ministrySlots.map((m) => (
                                    <MultiImageGalleryCard
                                        key={m.id}
                                        slot={m}
                                        editOverlay={renderEditableImageOverlay(m)}
                                        variant="standard-card"
                                        imageHeightClass="h-48"
                                        subtitleStyle="mono"
                                    />
                                ))}
                            </div>
                        </section>

                        {/* UPCOMING EVENTS & SERMONS PREVIEW */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">Butuan Gatherings &amp; Conferences</Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Upcoming KLB Events in Butuan City
                                    </h2>
                                </div>
                                <Button variant="outline" onClick={() => setActiveTab('events')}>
                                    Full Events Calendar →
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {eventSlots.map((ev) => (
                                    <MultiImageGalleryCard
                                        key={ev.id}
                                        slot={ev}
                                        editOverlay={renderEditableImageOverlay(ev)}
                                        variant="standard-card"
                                        imageHeightClass="h-52"
                                        subtitleStyle="badge"
                                    />
                                ))}
                            </div>
                        </section>

                        {/* FELLOWSHIP GALLERY STRIP (MULTI-IMAGE AUTO-SLIDESHOW + DRAG LEFT/RIGHT) */}
                        <section className="mx-auto w-full px-4 sm:px-8 lg:px-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">
                                        <Layers className="h-3 w-3" />
                                        Auto-Rotating Multi-Photo Cards
                                    </Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Life at Kingdom Life Butuan
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Each card automatically transitions through its photos every few seconds, or drag left/right on any photo to browse.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {canEditContent && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                openCreateCardModal('Fellowship Gallery')
                                            }
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Gallery Card
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setActiveTab('gallery')}>
                                        Open Full Gallery →
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {gallerySlots.map((g) => (
                                    <MultiImageGalleryCard
                                        key={g.id}
                                        slot={g}
                                        editOverlay={renderEditableImageOverlay(g)}
                                        variant="landing"
                                    />
                                ))}
                            </div>
                        </section>

                        {/* MAKE A DONATION / TITHES & OFFERINGS SECTION */}
                        <section id="make-donation" className="mx-auto w-full px-4 sm:px-8 lg:px-12">
                            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Left: CMS Image Banner, Giving Channels & Recent Generosity */}
                                    <div className="lg:col-span-6 space-y-5">
                                        <div className="space-y-2">
                                            <Badge variant="success">
                                                <Heart className="h-3 w-3" />
                                                {donationsBanner?.subtitle ||
                                                    'TITHES, OFFERINGS & KINGDOM BUILDERS FUND'}
                                            </Badge>
                                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                                {donationsBanner?.title ||
                                                    'Partner With Kingdom Life Butuan Through Generosity'}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                {donationsBanner?.body ||
                                                    'Every seed sown fuels the Gospel across Butuan City and the Caraga Region—supporting our Kids Kingdom classrooms, youth scholarships, barangay feeding missions, and sanctuary expansion.'}
                                            </p>
                                        </div>

                                        {/* Live Editable Donations Visual Banner */}
                                        <AutoSwipeImageFrame
                                            slot={donationsBanner}
                                            editOverlay={renderEditableImageOverlay(donationsBanner)}
                                            className="relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-xs"
                                            dotsBottomClass="bottom-14"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none z-10" />
                                            <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-center justify-between gap-2 z-10 pointer-events-none">
                                                <div>
                                                    <div className="font-mono text-[10px] font-bold uppercase text-emerald-300">
                                                        2 CORINTHIANS 9:7 • CHEERFUL GIVERS
                                                    </div>
                                                    <div className="text-sm font-bold">
                                                        Official KLB Butuan Stewardship Channels
                                                    </div>
                                                </div>
                                                <span className="rounded-lg bg-emerald-500/25 px-2.5 py-1 font-mono text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/40">
                                                    100% Transparent
                                                </span>
                                            </div>
                                        </AutoSwipeImageFrame>

                                        {/* Official Giving Account Channels */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-border/80 bg-muted/35 p-3.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground">
                                                        GCash / Maya Express
                                                    </span>
                                                    <Badge variant="default">Instant</Badge>
                                                </div>
                                                <div className="mt-1 font-mono text-sm font-extrabold text-primary">
                                                    0917-842-1001
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    Acct: Kingdom Life Butuan Inc.
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-border/80 bg-muted/35 p-3.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground">
                                                        BDO Unibank (Butuan)
                                                    </span>
                                                    <Badge variant="mono">Bank Transfer</Badge>
                                                </div>
                                                <div className="mt-1 font-mono text-sm font-extrabold text-primary">
                                                    0041-8802-9140
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    Acct: Kingdom Life Butuan Church
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Offerings & Kingdom Builders Feed */}
                                        {donations.length > 0 && (
                                            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        Recent Stewardship &amp; Offerings Recorded
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                        {donations.length} Recent Gifts
                                                    </span>
                                                </div>
                                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                    {donations.slice(0, 4).map((d) => (
                                                        <div
                                                            key={d.id}
                                                            className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-foreground truncate">
                                                                    {d.donor_name}{' '}
                                                                    <span className="font-normal text-muted-foreground">
                                                                        • {d.fund_category}
                                                                    </span>
                                                                </div>
                                                                {d.message && (
                                                                    <div className="text-[11px] text-muted-foreground truncate">
                                                                        &ldquo;{d.message}&rdquo;
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                                    ₱{Number(d.amount).toLocaleString()}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    {d.created_at_human}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Interactive Make a Donation Form */}
                                    <div className="lg:col-span-6">
                                        <Card className="p-6 border-primary/30 shadow-md">
                                            <div className="border-b border-border/70 pb-3.5 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-extrabold text-foreground">
                                                        Make a Donation / Submit Offering Details
                                                    </h3>
                                                    <Badge variant="default">PHP (₱)</Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Select a Kingdom fund and record your gift for official church stewardship &amp; thanksgiving prayer.
                                                </p>
                                            </div>

                                            <form onSubmit={handleDonationSubmit} className="space-y-4">
                                                {/* Preset Amounts */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-foreground">
                                                        Select or Enter Amount (PHP ₱) *
                                                    </label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['500', '1000', '2500', '5000'].map((amt) => (
                                                            <button
                                                                key={amt}
                                                                type="button"
                                                                onClick={() => setDonationAmount(amt)}
                                                                className={`rounded-xl border py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                                                                    donationAmount === amt
                                                                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                                                        : 'border-border bg-muted/50 text-foreground hover:bg-muted'
                                                                }`}
                                                            >
                                                                ₱{Number(amt).toLocaleString()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="pt-1">
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            step="any"
                                                            required
                                                            value={donationAmount}
                                                            onChange={(e) =>
                                                                setDonationAmount(e.target.value)
                                                            }
                                                            placeholder="Custom Amount in PHP (e.g. 1500)"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Fund Category & Payment Method */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Designated Ministry Fund *
                                                        </label>
                                                        <select
                                                            value={donationFund}
                                                            onChange={(e) =>
                                                                setDonationFund(e.target.value)
                                                            }
                                                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                                                        >
                                                            <option value="Tithes & Offerings">
                                                                Tithes &amp; Offerings
                                                            </option>
                                                            <option value="Kingdom Builders (Sanctuary Fund)">
                                                                Kingdom Builders (Sanctuary Fund)
                                                            </option>
                                                            <option value="Caraga Missions & Outreach">
                                                                Caraga Missions &amp; Outreach
                                                            </option>
                                                            <option value="Youth & Kids Scholarship">
                                                                Youth &amp; Kids Scholarship
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Giving Channel *
                                                        </label>
                                                        <select
                                                            value={paymentMethod}
                                                            onChange={(e) =>
                                                                setPaymentMethod(e.target.value)
                                                            }
                                                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                                                        >
                                                            <option value="GCash (0917-842-1001)">
                                                                GCash (0917-842-1001)
                                                            </option>
                                                            <option value="Maya (0917-842-1001)">
                                                                Maya (0917-842-1001)
                                                            </option>
                                                            <option value="BDO Bank Transfer">
                                                                BDO Bank Transfer
                                                            </option>
                                                            <option value="In-Person Offering Envelope">
                                                                In-Person Offering Envelope
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Donor Name & Reference Number */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Your Full Name *
                                                        </label>
                                                        <Input
                                                            required
                                                            value={donorName}
                                                            onChange={(e) =>
                                                                setDonorName(e.target.value)
                                                            }
                                                            placeholder="Juan Dela Cruz"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Ref. No. (Optional for GCash/Bank)
                                                        </label>
                                                        <Input
                                                            value={referenceNumber}
                                                            onChange={(e) =>
                                                                setReferenceNumber(e.target.value)
                                                            }
                                                            placeholder="e.g. GCASH-902418"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contact Email & Phone */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Email (For Receipt, Optional)
                                                        </label>
                                                        <Input
                                                            type="email"
                                                            value={donorEmail}
                                                            onChange={(e) =>
                                                                setDonorEmail(e.target.value)
                                                            }
                                                            placeholder="you@example.com"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-foreground">
                                                            Mobile Number (Optional)
                                                        </label>
                                                        <Input
                                                            value={donorPhone}
                                                            onChange={(e) =>
                                                                setDonorPhone(e.target.value)
                                                            }
                                                            placeholder="+63 917..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Thanksgiving / Prayer Note */}
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-foreground">
                                                        Thanksgiving Note or Prayer Intention (Optional)
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={donationMessage}
                                                        onChange={(e) =>
                                                            setDonationMessage(e.target.value)
                                                        }
                                                        placeholder="Share your thanksgiving testimony or prayer request with our Pastors..."
                                                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                                    />
                                                </div>

                                                {/* Anonymous Toggle */}
                                                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAnonymous}
                                                        onChange={(e) =>
                                                            setIsAnonymous(e.target.checked)
                                                        }
                                                        className="rounded border-border"
                                                    />
                                                    <span>
                                                        Display as &ldquo;Anonymous Kingdom Giver&rdquo; on public generosity feed
                                                    </span>
                                                </label>

                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={submittingDonation}
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    {submittingDonation
                                                        ? 'Recording Your Donation...'
                                                        : `Submit ₱${Number(donationAmount || 0).toLocaleString()} Donation`}
                                                </Button>
                                            </form>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PRAYER REQUEST & VISIT SECTION */}
                        <section id="visit-form" className="mx-auto w-full px-4 sm:px-8 lg:px-12">
                            <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/12 via-card to-accent/35 p-6 sm:p-10 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                    <div className="lg:col-span-7 space-y-3">
                                        <Badge variant="default">How Can We Pray For You?</Badge>
                                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                            Send a Prayer Request or Plan Your Sunday Visit
                                        </h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Whatever season you are walking through, you don’t have to walk alone. Share your prayer request with our Pastors and Intercession Team, or join us this Sunday at Kingdom Life Butuan as one family in Christ.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                                            <div className="flex items-center gap-2.5 text-foreground font-medium">
                                                <MapPin className="h-4 w-4 text-primary shrink-0" />
                                                J.C. Aquino Ave., Butuan City (Near Robinsons)
                                            </div>
                                            <div className="flex items-center gap-2.5 text-foreground font-medium">
                                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                                +63 (085) 815-4420 • +63 917 842 1001
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <Card className="p-5">
                                            {visitSubmitted ? (
                                                <div className="py-6 text-center space-y-2">
                                                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                                                    <h3 className="text-base font-bold text-foreground">
                                                        We Are Standing in Prayer With You!
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Our Pastors &amp; Prayer Intercession team have received your prayer request and will be lifting you up in prayer.
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setVisitSubmitted(false)}
                                                    >
                                                        Add Another Prayer Request
                                                    </Button>
                                                </div>
                                            ) : (
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        setVisitSubmitted(true);
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <h4 className="text-sm font-bold text-foreground">
                                                        Add a Prayer Request
                                                    </h4>
                                                    <Input
                                                        required
                                                        placeholder="Your Name"
                                                    />
                                                    <Input
                                                        placeholder="Mobile Number (Optional, +63 917...)"
                                                    />
                                                    <textarea
                                                        required
                                                        rows={3}
                                                        placeholder="Write your prayer request here... How can our church family pray for you?"
                                                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                                                    />
                                                    <Button type="submit" className="w-full">
                                                        Submit Prayer Request
                                                    </Button>
                                                </form>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                )}

                {/* ========================================================= */}
                {/* TAB 2: ABOUT US & PASTORAL LEADERSHIP VIEW                */}
                {/* ========================================================= */}
                {activeTab === 'about' && (
                    <main className="flex-1 mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 space-y-16">
                        {/* About Us Story Hero */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-6 space-y-4">
                                <Badge variant="default">
                                    {aboutStory?.subtitle || 'ESTABLISHED IN BUTUAN CITY (2012)'}
                                </Badge>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                    {aboutStory?.title ||
                                        'From a Living Room Prayer Circle to a Citywide Movement'}
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {aboutStory?.body}
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="rounded-xl border border-border p-4 bg-card">
                                        <div className="font-mono text-xl font-bold text-primary">
                                            2012
                                        </div>
                                        <div className="text-xs font-semibold text-foreground">
                                            Founded in Brgy. Libertad
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border p-4 bg-card">
                                        <div className="font-mono text-xl font-bold text-primary">
                                            32 Cells
                                        </div>
                                        <div className="text-xs font-semibold text-foreground">
                                            Citywide Butuan Life Groups
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <AutoSwipeImageFrame
                                slot={aboutStory}
                                editOverlay={renderEditableImageOverlay(aboutStory)}
                                className="lg:col-span-6 relative h-80 sm:h-96 overflow-hidden rounded-2xl border border-border shadow-md bg-slate-950"
                            />
                        </div>

                        {/* Sanctuary & Community Impact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[aboutSanctuary, aboutImpact].filter(Boolean).map((item) => (
                                <MultiImageGalleryCard
                                    key={item!.id}
                                    slot={item!}
                                    editOverlay={renderEditableImageOverlay(item)}
                                    variant="standard-card"
                                    imageHeightClass="h-64"
                                    subtitleStyle="badge"
                                />
                            ))}
                        </div>

                        {/* Pastoral Leadership Team */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">Shepherds &amp; Elders</Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Meet Our Pastoral Leadership Team
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Dedicated to serving Jesus and equipping families across Butuan City. Portraits are displayed uncropped with full studio framing.
                                    </p>
                                </div>
                                {canEditContent && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => openCreateCardModal('Pastoral Leadership')}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Pastor / Leader Card
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {pastorSlots.map((pastor) => (
                                    <PortraitLeaderCard
                                        key={pastor.id}
                                        slot={pastor}
                                        editOverlay={renderEditableImageOverlay(pastor)}
                                        canEdit={canEditContent}
                                        onEdit={openQuickImageEditor}
                                        canDelete={canEditContent}
                                        onDelete={handleDeleteSlot}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Worship Team Section on About Tab */}
                        <div className="space-y-6 pt-4 border-t border-border/70">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">
                                        <Music className="h-3 w-3" />
                                        Sound of Heaven • KLB Worship
                                    </Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Meet Our Worship Team
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Anointed worship leaders and musicians leading Butuan City into the presence of Jesus. Dynamically managed in Admin Access.
                                    </p>
                                </div>
                                {canEditContent ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => openCreateCardModal('Worship Team')}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Worship Team Member
                                    </Button>
                                ) : (
                                    <Link href="/login">
                                        <Button size="sm" variant="outline">
                                            <LogIn className="h-3.5 w-3.5" />
                                            Admin Login to Add Worship Team
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {worshipTeamSlots.map((member) => (
                                    <PortraitLeaderCard
                                        key={member.id}
                                        slot={member}
                                        editOverlay={renderEditableImageOverlay(member)}
                                        canEdit={canEditContent}
                                        onEdit={openQuickImageEditor}
                                        canDelete={canEditContent}
                                        onDelete={handleDeleteSlot}
                                    />
                                ))}
                            </div>
                        </div>
                    </main>
                )}

                {/* ========================================================= */}
                {/* TAB 3: MINISTRIES & LIFE GROUPS                           */}
                {/* ========================================================= */}
                {activeTab === 'ministries' && (
                    <main className="flex-1 mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 space-y-12">
                        <div className="space-y-6">
                            <div>
                                <Badge variant="default">KLB Butuan Ministries</Badge>
                                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                                    Ministries, Next-Gen &amp; Citywide Life Groups
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Every ministry card and photograph below is dynamically managed in the Admin Visual Image Studio.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ministrySlots.map((m) => (
                                    <MultiImageGalleryCard
                                        key={m.id}
                                        slot={m}
                                        editOverlay={renderEditableImageOverlay(m)}
                                        variant="standard-card"
                                        imageHeightClass="h-64"
                                        subtitleStyle="badge"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Our Worship Team Section in Ministries Tab */}
                        <div className="space-y-6 pt-6 border-t border-border/70">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <Badge variant="default">
                                        <Music className="h-3 w-3" />
                                        Sound of Heaven • KLB Worship Collective
                                    </Badge>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        Our Worship Team
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Add or update Worship Team members dynamically from here or inside the Admin Visual Image Studio.
                                    </p>
                                </div>
                                {canEditContent ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => openCreateCardModal('Worship Team')}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Worship Team Member
                                    </Button>
                                ) : (
                                    <Link href="/login">
                                        <Button size="sm" variant="outline">
                                            <LogIn className="h-3.5 w-3.5" />
                                            Admin Login to Add Worship Team
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {worshipTeamSlots.map((member) => (
                                    <PortraitLeaderCard
                                        key={member.id}
                                        slot={member}
                                        editOverlay={renderEditableImageOverlay(member)}
                                        canEdit={canEditContent}
                                        onEdit={openQuickImageEditor}
                                        canDelete={canEditContent}
                                        onDelete={handleDeleteSlot}
                                    />
                                ))}
                            </div>
                        </div>
                    </main>
                )}

                {/* ========================================================= */}
                {/* TAB 4: SERMONS & MEDIA                                    */}
                {/* ========================================================= */}
                {activeTab === 'sermons' && (
                    <main className="flex-1 mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 space-y-8">
                        <div>
                            <Badge variant="default">Pulpit &amp; Teaching</Badge>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                                Sermons &amp; Message Series Archive
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Watch or listen to recent Sunday messages from Kingdom Life Butuan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {sermonSlots.map((s) => (
                                <MultiImageGalleryCard
                                    key={s.id}
                                    slot={s}
                                    editOverlay={renderEditableImageOverlay(s)}
                                    variant="standard-card"
                                    imageHeightClass="h-56"
                                    subtitleStyle="mono"
                                />
                            ))}
                        </div>
                    </main>
                )}

                {/* ========================================================= */}
                {/* TAB 5: EVENTS & GATHERINGS                                */}
                {/* ========================================================= */}
                {activeTab === 'events' && (
                    <main className="flex-1 mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 space-y-8">
                        <div>
                            <Badge variant="default">KLB Calendar</Badge>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                                Upcoming Conferences, Baptisms &amp; Worship Nights
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {eventSlots.map((ev) => (
                                <MultiImageGalleryCard
                                    key={ev.id}
                                    slot={ev}
                                    editOverlay={renderEditableImageOverlay(ev)}
                                    variant="standard-card"
                                    imageHeightClass="h-56"
                                    subtitleStyle="badge"
                                />
                            ))}
                        </div>
                    </main>
                )}

                {/* ========================================================= */}
                {/* TAB 6: FELLOWSHIP GALLERY                                 */}
                {/* ========================================================= */}
                {activeTab === 'gallery' && (
                    <main className="flex-1 mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <Badge variant="default">Butuan Fellowship Gallery • Auto-Slideshow Cards</Badge>
                                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                                    Worship, Baptism &amp; Community Outreach Photos
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Each card below automatically cycles through its uploaded images every few seconds, or drag left/right on any photo to browse one by one.
                                </p>
                            </div>
                            {canEditContent && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => openCreateCardModal('Fellowship Gallery')}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Gallery Card
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {gallerySlots.map((g) => (
                                <MultiImageGalleryCard
                                    key={g.id}
                                    slot={g}
                                    editOverlay={renderEditableImageOverlay(g)}
                                    variant="gallery-tab"
                                />
                            ))}
                        </div>
                    </main>
                )}

                {/* Visitor Footer */}
                <footer className="border-t border-border/80 bg-card py-12">
                    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/klb_logo.png"
                                alt="Kingdom Life Butuan Logo"
                                className="h-9 w-9 shrink-0 rounded-full object-cover shadow-xs ring-1 ring-border/60"
                            />
                            <div>
                                <div className="font-bold text-foreground">
                                    Kingdom Life Butuan (KLB)
                                </div>
                                <div>
                                    J.C. Aquino Avenue, Butuan City, Agusan del Norte, Philippines 8600
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link
                                    href="/admin"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Admin CMS &amp; RBAC Portal →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="font-medium text-muted-foreground hover:text-foreground hover:underline"
                                    >
                                        Register Personal Info
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        Admin / Content Creator Login →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </footer>

                {/* On-Page Quick Image Replace & Multi-Photo Carousel Modal for Admins & Content Creators */}
                {canEditContent && editingSlot && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto"
                        onClick={() => setEditingSlot(null)}
                    >
                        <div
                            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">
                                            {editingSlot.page} • {editingSlot.section}
                                        </Badge>
                                        <Badge variant="mono">
                                            {slotGalleryImages.length + slotGalleryPreviews.length} Photo
                                            {slotGalleryImages.length + slotGalleryPreviews.length === 1 ? '' : 's'}
                                        </Badge>
                                    </div>
                                    <h3 className="mt-1 text-base font-bold text-foreground">
                                        Update Card &amp; Images: {editingSlot.label}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingSlot(null)}
                                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleQuickSave} className="mt-4 space-y-4">
                                {/* Primary Image Preview (Respects Portrait Uncropped Mode) */}
                                <div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-slate-950">
                                    <img
                                        src={slotPreview || slotImageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-45"
                                    />
                                    <img
                                        src={slotPreview || slotImageUrl}
                                        alt={slotTitle}
                                        className={`relative z-10 h-full w-full ${
                                            slotFocalPoint === 'contain'
                                                ? 'object-contain p-2'
                                                : slotFocalPoint === 'cover-top' || slotFocalPoint === 'top'
                                                  ? 'object-cover object-top'
                                                  : 'object-cover object-center'
                                        }`}
                                    />
                                    <span className="absolute bottom-2 right-2 z-20 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                                        {slotFocalPoint === 'contain'
                                            ? 'Full Portrait (No Zoom / No Crop)'
                                            : `Cover (${slotFocalPoint})`}
                                    </span>
                                </div>

                                {/* Framing / Zoom Selector (Especially for Pastors & Worship Team) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <Upload className="h-3.5 w-3.5 text-primary" />
                                            Upload Primary Cover Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleQuickFileChange}
                                            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground block">
                                            Image Fit &amp; Zoom Framing
                                        </label>
                                        <select
                                            value={slotFocalPoint}
                                            onChange={(e) => setSlotFocalPoint(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
                                        >
                                            <option value="contain">
                                                Full Uncropped Portrait — No Zoom (Recommended for Pastors &amp; Worship Team)
                                            </option>
                                            <option value="cover-top">
                                                Fill Card — Align Top
                                            </option>
                                            <option value="center">
                                                Fill Card — Center Balanced
                                            </option>
                                        </select>
                                        <p className="text-[10px] text-muted-foreground">
                                            Choose &ldquo;Full Uncropped Portrait&rdquo; so headshots are never over-zoomed.
                                        </p>
                                    </div>
                                </div>

                                {/* MULTI-IMAGE SLIDESHOW MANAGER (For Life at Kingdom Life Butuan & Any Card) */}
                                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Layers className="h-4 w-4 text-primary" />
                                                Multiple Card Images (Auto-Rotating Slideshow + Next/Prev)
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Add multiple photos to this card. On the Landing Page (&ldquo;Life at Kingdom Life Butuan&rdquo;), they will automatically change every 3.5 seconds and let visitors click Next / Previous.
                                            </p>
                                        </div>
                                        <label className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 cursor-pointer">
                                            <Plus className="h-3.5 w-3.5" />
                                            Upload Multiple Photos
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleQuickGalleryFilesChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Add Image URL to Multi-Image List */}
                                    <div className="flex gap-2">
                                        <Input
                                            value={extraGalleryUrl}
                                            onChange={(e) => setExtraGalleryUrl(e.target.value)}
                                            placeholder="Or paste an additional image URL to add to this card's slideshow..."
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addExtraUrlToGallery}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Slide URL
                                        </Button>
                                    </div>

                                    {/* Thumbnail Strip of All Slides in This Card */}
                                    {(slotGalleryImages.length > 0 || slotGalleryPreviews.length > 0) && (
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-semibold text-foreground">
                                                Active Slides in This Card ({slotGalleryImages.length + slotGalleryPreviews.length} total):
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                                {slotGalleryImages.map((imgUrl, idx) => (
                                                    <div
                                                        key={`${imgUrl}-${idx}`}
                                                        className="group relative h-16 overflow-hidden rounded-lg border border-border bg-slate-900"
                                                    >
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Slide ${idx + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white">
                                                            #{idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGallerySlide(imgUrl)}
                                                            title="Remove this photo from card slideshow"
                                                            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {slotGalleryPreviews.map((previewUrl, idx) => (
                                                    <div
                                                        key={`new-preview-${idx}`}
                                                        className="relative h-16 overflow-hidden rounded-lg border-2 border-emerald-500 bg-slate-900"
                                                    >
                                                        <img
                                                            src={previewUrl}
                                                            alt={`New Upload ${idx + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white">
                                                            NEW
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Primary Image URL</label>
                                    <Input
                                        value={slotImageUrl}
                                        onChange={(e) => {
                                            setSlotImageUrl(e.target.value);
                                            setSlotFile(null);
                                            setSlotPreview(null);
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold">
                                            {editingSlot.section === 'Worship Team'
                                                ? 'Worship Team Member Full Name *'
                                                : editingSlot.section === 'Pastoral Leadership'
                                                  ? 'Pastor / Leader Full Name *'
                                                  : 'Name / Headline / Title *'}
                                        </label>
                                        <Input
                                            value={slotTitle}
                                            onChange={(e) => setSlotTitle(e.target.value)}
                                            placeholder={
                                                editingSlot.section === 'Worship Team'
                                                    ? 'e.g. Bro. Nathan Rivera'
                                                    : 'Enter title or full name'
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold">
                                            {editingSlot.section === 'Worship Team'
                                                ? 'Instrument / Worship Role *'
                                                : 'Role / Subtitle'}
                                        </label>
                                        <Input
                                            value={slotSubtitle}
                                            onChange={(e) => setSlotSubtitle(e.target.value)}
                                            placeholder={
                                                editingSlot.section === 'Worship Team'
                                                    ? 'e.g. Guitarist, Worship Leader, Bass, Tambourine Dancer, Keys'
                                                    : 'Role or Subtitle'
                                            }
                                        />
                                    </div>
                                </div>

                                {editingSlot.section === 'Worship Team' && (
                                    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-2">
                                        <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                                            <Music className="h-3.5 w-3.5 text-primary" />
                                            Quick-Select Instrument / Role (Click to set or combine):
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {WORSHIP_INSTRUMENT_PRESETS.map((inst) => {
                                                const isSelected = slotSubtitle
                                                    .toLowerCase()
                                                    .includes(inst.toLowerCase());
                                                return (
                                                    <button
                                                        key={inst}
                                                        type="button"
                                                        onClick={() => setSlotSubtitle(inst)}
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

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">
                                        Bio / Description (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={slotBody}
                                        onChange={(e) => setSlotBody(e.target.value)}
                                        placeholder="Optional bio or ministry description..."
                                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                                    <div>
                                        {(editingSlot.section === 'Worship Team' ||
                                            editingSlot.section === 'Pastoral Leadership' ||
                                            editingSlot.section === 'Fellowship Gallery') && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteSlot(editingSlot)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete Card
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditingSlot(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={savingSlot}>
                                            <RefreshCw
                                                className={`h-3.5 w-3.5 ${savingSlot ? 'animate-spin' : ''}`}
                                            />
                                            {savingSlot ? 'Updating Live Page...' : 'Save & Publish Card'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Dynamic Card Creation Modal (Add Worship Team Member, Pastor, or Multi-Photo Gallery Card) */}
                {canEditContent && creatingCategory && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto"
                        onClick={() => setCreatingCategory(null)}
                    >
                        <div
                            className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <Badge variant="default">
                                        <Plus className="h-3 w-3" />
                                        Dynamic {creatingCategory} Card
                                    </Badge>
                                    <h3 className="mt-1 text-base font-bold text-foreground">
                                        {creatingCategory === 'Worship Team'
                                            ? 'Add New Worship Team Member Card'
                                            : creatingCategory === 'Pastoral Leadership'
                                              ? 'Add New Pastor / Leadership Card'
                                              : 'Add New Multi-Photo Gallery Card'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreatingCategory(null)}
                                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCardSubmit} className="mt-4 space-y-4">
                                <div className="relative h-52 w-full overflow-hidden rounded-xl border border-border bg-slate-950">
                                    <img
                                        src={newPreview || newImageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-45"
                                    />
                                    <img
                                        src={newPreview || newImageUrl}
                                        alt={newTitle || 'New Card Preview'}
                                        className={`relative z-10 h-full w-full ${
                                            creatingCategory === 'Fellowship Gallery'
                                                ? 'object-cover'
                                                : 'object-contain p-2'
                                        }`}
                                    />
                                </div>

                                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Upload className="h-3.5 w-3.5 text-primary" />
                                        Upload Portrait / Primary Photo from Computer
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            setNewFile(f);
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                if (typeof reader.result === 'string') {
                                                    setNewPreview(reader.result);
                                                }
                                            };
                                            reader.readAsDataURL(f);
                                        }}
                                        className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
                                    />
                                </div>

                                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5 text-primary" />
                                        Upload Additional Slideshow Photos for This Card (Optional — Swipe / Auto-Next)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = e.target.files
                                                ? Array.from(e.target.files)
                                                : [];
                                            if (!files.length) return;
                                            setNewGalleryFiles((prev) => [...prev, ...files]);
                                            files.forEach((f) => {
                                                const r = new FileReader();
                                                r.onload = () => {
                                                    if (typeof r.result === 'string') {
                                                        setNewGalleryPreviews((prev) => [
                                                            ...prev,
                                                            r.result as string,
                                                        ]);
                                                    }
                                                };
                                                r.readAsDataURL(f);
                                            });
                                        }}
                                        className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
                                    />
                                    {newGalleryPreviews.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2 pt-1">
                                            {newGalleryPreviews.map((p, i) => (
                                                <img
                                                    key={i}
                                                    src={p}
                                                    alt=""
                                                    className="h-12 w-full rounded-lg object-cover border border-emerald-500"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">
                                        {creatingCategory === 'Worship Team'
                                            ? '1. Worship Team Member Full Name * (Displayed as Card Name)'
                                            : creatingCategory === 'Pastoral Leadership'
                                              ? 'Pastor / Leader Name *'
                                              : 'Gallery Card Title *'}
                                    </label>
                                    <Input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder={
                                            creatingCategory === 'Worship Team'
                                                ? 'Enter Member Full Name (e.g. Bro. Nathan Rivera)'
                                                : creatingCategory === 'Pastoral Leadership'
                                                  ? 'e.g. Ptr. Samuel Villanueva'
                                                  : 'e.g. Sunday Morning Praise & Fellowship'
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">
                                        {creatingCategory === 'Worship Team'
                                            ? '2. Instrument / Worship Role * (Displayed as Badge on Card)'
                                            : creatingCategory === 'Pastoral Leadership'
                                              ? 'Pastoral Title & Ministry Role *'
                                              : 'Category Subtitle *'}
                                    </label>
                                    {creatingCategory === 'Worship Team' && (
                                        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-2">
                                            <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                                                <Music className="h-3.5 w-3.5 text-primary" />
                                                Click an Instrument / Role below (or type custom below):
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {WORSHIP_INSTRUMENT_PRESETS.map((inst) => {
                                                    const isSelected = newSubtitle
                                                        .toLowerCase()
                                                        .includes(inst.toLowerCase());
                                                    return (
                                                        <button
                                                            key={inst}
                                                            type="button"
                                                            onClick={() => setNewSubtitle(inst)}
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
                                        value={newSubtitle}
                                        onChange={(e) => setNewSubtitle(e.target.value)}
                                        placeholder={
                                            creatingCategory === 'Worship Team'
                                                ? 'e.g. Guitarist, Worship Leader, Bass, Tambourine Dancer, Keys'
                                                : 'e.g. ASSOCIATE PASTOR • KINGDOM LIFE BUTUAN'
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">
                                        {creatingCategory === 'Worship Team'
                                            ? '3. Short Bio / Note (Optional)'
                                            : 'Short Bio / Ministry Heart / Description (Optional)'}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={newBody}
                                        onChange={(e) => setNewBody(e.target.value)}
                                        placeholder={
                                            creatingCategory === 'Worship Team'
                                                ? 'Optional short note (or leave blank to only show Photo, Name, and Instrument)...'
                                                : 'Write a brief description that will appear on the generated card...'
                                        }
                                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 border-t border-border pt-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreatingCategory(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={creatingCard}>
                                        <Plus className="h-3.5 w-3.5" />
                                        {creatingCard ? 'Generating Card...' : 'Generate & Publish Card'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

