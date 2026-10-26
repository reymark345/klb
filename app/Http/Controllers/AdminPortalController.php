<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\Member;
use App\Models\RolePermission;
use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminPortalController extends Controller
{
    /**
     * Retrieve the currently authenticated user, or null if not logged in.
     * Never auto-log in unauthenticated visitors.
     */
    protected function getAuthenticatedUser(Request $request): ?User
    {
        if (User::count() === 0 || SiteContent::count() === 0) {
            (new \Database\Seeders\DatabaseSeeder())->run();
        }

        return $request->user();
    }

    protected function checkModulePermission(User $user, string $moduleKey, string $permissionKey): bool
    {
        if ($user->status !== 'Active') {
            return false;
        }

        if ($user->role === 'Primary Admin') {
            return true;
        }

        // Only Primary Admin, Admin, and Content Creator can edit content and images
        if (
            in_array($moduleKey, ['cms_visual_media', 'cms_text_blocks', 'events_sermons'], true) &&
            in_array($permissionKey, ['can_create', 'can_update', 'can_delete'], true)
        ) {
            if (! in_array($user->role, ['Primary Admin', 'Admin', 'Content Creator'], true)) {
                return false;
            }
        }

        $perms = $user->resolvedPermissions();
        if (isset($perms[$moduleKey][$permissionKey])) {
            return (bool) $perms[$moduleKey][$permissionKey];
        }

        // Fallback if Content Creator row is checked before seeding
        if (
            $user->role === 'Content Creator' &&
            in_array($moduleKey, ['cms_visual_media', 'cms_text_blocks', 'events_sermons'], true) &&
            in_array($permissionKey, ['can_view', 'can_create', 'can_update'], true)
        ) {
            return true;
        }

        return false;
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (! $user) {
            return redirect()->route('login')->with(
                'warning',
                'Please sign in first (or register your Personal Info for Admin approval) to access the Admin Portal and edit content.'
            );
        }

        if ($user->status !== 'Active') {
            Auth::logout();
            $request->session()->put('logged_out', true);

            return redirect()->route('login')->with(
                'warning',
                'Your account is currently Pending Admin Approval. Wait for the Primary Admin to approve your registration and assign your role.'
            );
        }

        $donations = [];
        try {
            $donations = Donation::orderBy('id', 'desc')->limit(100)->get()->map(fn (Donation $d) => [
                'id' => $d->id,
                'donor_name' => $d->is_anonymous ? 'Anonymous Kingdom Giver' : $d->donor_name,
                'email' => $d->email,
                'phone' => $d->phone,
                'amount' => $d->amount,
                'fund_category' => $d->fund_category,
                'payment_method' => $d->payment_method,
                'reference_number' => $d->reference_number,
                'message' => $d->message,
                'is_anonymous' => $d->is_anonymous,
                'status' => $d->status,
                'created_at' => $d->created_at?->format('Y-m-d H:i'),
                'time_ago' => $d->created_at?->diffForHumans() ?? 'Just now',
            ]);
        } catch (\Throwable $e) {
            // Ignore if table not migrated yet
        }

        return Inertia::render('Admin/Portal', [
            'initialSection' => $request->query('section', 'overview'),
            'siteContents' => SiteContent::orderBy('sort_order')->orderBy('id')->get(),
            'members' => Member::orderBy('id', 'desc')->get(),
            'donations' => $donations,
            'users' => User::orderByRaw("CASE WHEN status = 'Pending' THEN 0 ELSE 1 END")
                ->orderBy('id')
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'requested_role' => $u->requested_role,
                    'department' => $u->department,
                    'phone' => $u->phone,
                    'address' => $u->address,
                    'birthdate' => $u->birthdate?->format('Y-m-d'),
                    'gender' => $u->gender,
                    'ministry' => $u->ministry,
                    'bio' => $u->bio,
                    'status' => $u->status,
                    'approved_by' => $u->approved_by,
                    'approved_at' => $u->approved_at?->diffForHumans(),
                    'avatar_url' => $u->avatar_url,
                    'created_at' => $u->created_at?->format('M d, Y h:i A'),
                    'last_login_at' => $u->last_login_at?->diffForHumans() ?? ($u->status === 'Pending' ? 'Awaiting Approval' : 'Active now'),
                ]),
            'rolePermissions' => RolePermission::orderBy('id')->get(),
            'auditLogs' => AuditLog::orderBy('id', 'desc')->limit(150)->get()->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'user_name' => $log->user_name,
                'user_role' => $log->user_role,
                'action' => $log->action,
                'module' => $log->module,
                'target_label' => $log->target_label,
                'details' => $log->details,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'severity' => $log->severity,
                'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
                'time_ago' => $log->created_at?->diffForHumans(),
            ]),
        ]);
    }

    /**
     * Switch active user or role for testing Primary Admin, Admin, Content Creator, and Staff/Analyst permissions.
     */
    public function switchUser(Request $request): RedirectResponse
    {
        $actor = $this->getAuthenticatedUser($request);
        if (! $actor) {
            return redirect()->route('login')->with('error', 'Please log in first before switching role sessions.');
        }

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'role' => 'nullable|string',
        ]);

        $targetUser = null;
        if (! empty($validated['user_id'])) {
            $targetUser = User::find($validated['user_id']);
        } elseif (! empty($validated['role'])) {
            $targetUser = User::where('role', $validated['role'])->where('status', 'Active')->first();
        }

        if ($targetUser) {
            if ($targetUser->status !== 'Active') {
                return back()->with(
                    'error',
                    "Cannot switch session to {$targetUser->name}: Account is still [{$targetUser->status}]. Approve their Personal Info registration and assign a role first!"
                );
            }

            $targetUser->update(['last_login_at' => now()]);
            $request->session()->forget('logged_out');
            Auth::login($targetUser);

            AuditLog::record(
                $request,
                'UPDATE',
                'RBAC & Session',
                "Switched Active Session -> {$targetUser->name} ({$targetUser->role})",
                "Active operator session switched to {$targetUser->name} with role [{$targetUser->role}].",
                null,
                ['user' => $targetUser->email, 'role' => $targetUser->role],
                'info'
            );

            return back()->with('success', "Switched active role session to {$targetUser->name} ({$targetUser->role}).");
        }

        return back()->with('error', 'Unable to switch user session.');
    }

    /**
     * Update a Visitor Website Image / Content Slot (Landing Page, About Us, Ministries, Sermons, Events, Gallery).
     */
    public function updateSiteContent(Request $request, SiteContent $siteContent): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first. Only authenticated Admin or Content Creator accounts can edit images and content.');
        }

        if (! $this->checkModulePermission($user, 'cms_visual_media', 'can_update')) {
            AuditLog::record(
                $request,
                'UPDATE',
                'Visitor CMS & Image Studio',
                "Blocked Image Edit: {$siteContent->label}",
                "Role [{$user->role}] attempted to modify visitor image/content without cms_visual_media.can_update permission.",
                null,
                null,
                'critical'
            );

            return back()->with('error', "Access Denied: Your role ({$user->role}) does not have permission to modify visitor website content or images. Only Primary Admin, Admin, or Content Creator roles can edit content and images.");
        }

        $validated = $request->validate([
            'page' => 'required|string|max:100',
            'section' => 'required|string|max:120',
            'label' => 'required|string|max:180',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'cta_text' => 'nullable|string|max:120',
            'cta_link' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable|string',
            'gallery_base64' => 'nullable|array',
            'gallery_base64.*' => 'nullable|string',
            'image_alt' => 'nullable|string|max:255',
            'focal_point' => 'nullable|string|max:40',
            'aspect_ratio' => 'nullable|string|max:40',
            'is_published' => 'nullable|boolean',
            'image_base64' => 'nullable|string',
        ]);

        $oldValues = [
            'title' => $siteContent->title,
            'image_url' => $siteContent->image_url,
            'gallery_images' => $siteContent->gallery_images,
            'page' => $siteContent->page,
        ];

        $imageUrl = $validated['image_url'] ?? $siteContent->image_url;

        $uploadedUrl = $this->resolveUploadedCmsImage($request);
        if ($uploadedUrl !== null) {
            $imageUrl = $uploadedUrl;
        }

        $baseGallery = $request->has('gallery_images')
            ? ($validated['gallery_images'] ?? [])
            : ($siteContent->gallery_images ?? []);

        $galleryImages = $this->resolveUploadedGalleryImages(
            $request,
            $baseGallery,
            $uploadedUrl ?? (! $request->has('gallery_images') ? $imageUrl : null)
        );
        if (! empty($galleryImages) && (empty($imageUrl) || ($request->has('gallery_images') && $uploadedUrl === null && ! in_array($imageUrl, $galleryImages, true)))) {
            $imageUrl = $galleryImages[0];
        } elseif (empty($galleryImages) && ! empty($imageUrl)) {
            $galleryImages = [$imageUrl];
        }

        $siteContent->update([
            'page' => $validated['page'],
            'section' => $validated['section'],
            'label' => $validated['label'],
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'body' => $validated['body'] ?? null,
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_link' => $validated['cta_link'] ?? null,
            'image_url' => $imageUrl,
            'gallery_images' => $galleryImages,
            'image_alt' => $validated['image_alt'] ?? $validated['title'],
            'focal_point' => $validated['focal_point'] ?? 'center',
            'aspect_ratio' => $validated['aspect_ratio'] ?? '16:9',
            'is_published' => $validated['is_published'] ?? true,
            'updated_by' => $user->name,
        ]);

        $imageChanged = $oldValues['image_url'] !== $imageUrl || $oldValues['gallery_images'] !== $galleryImages;

        AuditLog::record(
            $request,
            'UPDATE',
            'Visitor CMS & Image Studio',
            "{$siteContent->page} • {$siteContent->label} ({$siteContent->key})",
            $imageChanged
                ? "Updated visual image & gallery (" . count($galleryImages) . " photos) for [{$siteContent->label}] on {$siteContent->page}."
                : "Updated text & display settings for [{$siteContent->label}] on {$siteContent->page}.",
            $oldValues,
            [
                'title' => $siteContent->title,
                'image_url' => $siteContent->image_url,
                'gallery_count' => count($galleryImages),
                'page' => $siteContent->page,
            ],
            'info'
        );

        return back()->with('success', "Updated \"{$siteContent->label}\" on {$siteContent->page}. Live visitor view refreshed!");
    }

    /**
     * Create a new Visitor Website Image / Content Slot.
     */
    public function storeSiteContent(Request $request): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first to create visitor CMS slots.');
        }

        if (! $this->checkModulePermission($user, 'cms_visual_media', 'can_create')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) cannot create new visitor CMS slots.");
        }

        $validated = $request->validate([
            'key' => 'required|string|max:120|unique:site_contents,key',
            'page' => 'required|string|max:100',
            'section' => 'required|string|max:120',
            'label' => 'required|string|max:180',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'cta_text' => 'nullable|string|max:120',
            'cta_link' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable|string',
            'gallery_base64' => 'nullable|array',
            'gallery_base64.*' => 'nullable|string',
            'image_alt' => 'nullable|string|max:255',
            'focal_point' => 'nullable|string|max:40',
            'aspect_ratio' => 'nullable|string|max:40',
            'is_published' => 'nullable|boolean',
            'image_base64' => 'nullable|string',
        ]);

        $imageUrl = $validated['image_url'] ?? null;
        $uploadedUrl = $this->resolveUploadedCmsImage($request);
        if ($uploadedUrl !== null) {
            $imageUrl = $uploadedUrl;
        }

        $galleryImages = $this->resolveUploadedGalleryImages(
            $request,
            $validated['gallery_images'] ?? [],
            $imageUrl
        );

        if (empty($imageUrl)) {
            $imageUrl = ! empty($galleryImages)
                ? $galleryImages[0]
                : 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=1200&q=80';
        }

        if (empty($galleryImages) && ! empty($imageUrl)) {
            $galleryImages = [$imageUrl];
        }

        $content = SiteContent::create([
            'key' => $validated['key'],
            'page' => $validated['page'],
            'section' => $validated['section'],
            'label' => $validated['label'],
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'body' => $validated['body'] ?? null,
            'cta_text' => $validated['cta_text'] ?? 'Learn More',
            'cta_link' => $validated['cta_link'] ?? '#visit',
            'image_url' => $imageUrl,
            'gallery_images' => $galleryImages,
            'image_alt' => $validated['image_alt'] ?? $validated['title'],
            'focal_point' => $validated['focal_point'] ?? 'center',
            'aspect_ratio' => $validated['aspect_ratio'] ?? '16:9',
            'is_published' => $validated['is_published'] ?? true,
            'sort_order' => SiteContent::max('sort_order') + 1,
            'updated_by' => $user->name,
        ]);

        AuditLog::record(
            $request,
            'CREATE',
            'Visitor CMS & Image Studio',
            "{$content->page} • {$content->label} ({$content->key})",
            "Created new visual content block [{$content->label}] on {$content->page}.",
            null,
            ['key' => $content->key, 'image_url' => $content->image_url],
            'info'
        );

        return back()->with('success', "Created new visual content slot \"{$content->label}\" on {$content->page}!");
    }

    /**
     * Delete a Visitor Website Content Slot.
     */
    public function deleteSiteContent(Request $request, SiteContent $siteContent): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first to delete visitor CMS slots.');
        }

        if (! $this->checkModulePermission($user, 'cms_visual_media', 'can_delete')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) cannot delete visitor CMS slots.");
        }

        $label = "{$siteContent->page} • {$siteContent->label}";
        $old = $siteContent->toArray();
        $siteContent->delete();

        AuditLog::record(
            $request,
            'DELETE',
            'Visitor CMS & Image Studio',
            $label,
            "Deleted visual content slot [{$label}].",
            $old,
            null,
            'warning'
        );

        return back()->with('success', "Deleted content slot \"{$label}\".");
    }

    /**
     * Store a new Church Member record.
     */
    public function storeMember(Request $request): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first to manage members.');
        }

        if (! $this->checkModulePermission($user, 'members_directory', 'can_create')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) cannot create member records.");
        }

        $validated = $request->validate([
            'member_code' => 'nullable|string|max:50',
            'full_name' => 'required|string|max:180',
            'email' => 'nullable|email|max:180',
            'phone' => 'nullable|string|max:60',
            'ministry' => 'required|string|max:120',
            'life_group' => 'required|string|max:120',
            'baptism_status' => 'required|string|max:80',
            'role_type' => 'required|string|max:80',
            'status' => 'required|string|max:40',
            'joined_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $nextNum = Member::count() + 1;
        $code = ! empty($validated['member_code'])
            ? $validated['member_code']
            : sprintf('KLB-2026-%03d', $nextNum + 10);

        $member = Member::create([
            'member_code' => $code,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'ministry' => $validated['ministry'],
            'life_group' => $validated['life_group'],
            'baptism_status' => $validated['baptism_status'],
            'role_type' => $validated['role_type'],
            'status' => $validated['status'],
            'joined_date' => $validated['joined_date'] ?? now()->toDateString(),
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::record(
            $request,
            'CREATE',
            'Members & Life Group Registry',
            "{$member->full_name} ({$member->member_code})",
            "Added member {$member->full_name} to {$member->ministry} / {$member->life_group}.",
            null,
            $member->toArray(),
            'info'
        );

        return back()->with('success', "Added {$member->full_name} ({$member->member_code}) to KLB Registry.");
    }

    /**
     * Update a Church Member record (including inline Data Table editing).
     */
    public function updateMember(Request $request, Member $member): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first to update members.');
        }

        if (! $this->checkModulePermission($user, 'members_directory', 'can_update')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) cannot update member records.");
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:180',
            'email' => 'nullable|email|max:180',
            'phone' => 'nullable|string|max:60',
            'ministry' => 'required|string|max:120',
            'life_group' => 'required|string|max:120',
            'baptism_status' => 'required|string|max:80',
            'role_type' => 'required|string|max:80',
            'status' => 'required|string|max:40',
            'joined_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $member->only(['full_name', 'ministry', 'life_group', 'baptism_status', 'role_type', 'status']);
        $member->update($validated);

        AuditLog::record(
            $request,
            'UPDATE',
            'Members & Life Group Registry',
            "{$member->full_name} ({$member->member_code})",
            "Updated member record for {$member->full_name}.",
            $oldValues,
            $member->only(['full_name', 'ministry', 'life_group', 'baptism_status', 'role_type', 'status']),
            'info'
        );

        return back()->with('success', "Saved changes for {$member->full_name} ({$member->member_code}).");
    }

    /**
     * Batch delete or batch update selected Church Members.
     */
    public function batchMembers(Request $request): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:members,id',
            'action' => 'required|string|in:delete,status_active,status_visiting,baptized',
        ]);

        $count = count($validated['ids']);

        if ($validated['action'] === 'delete') {
            if (! $this->checkModulePermission($user, 'members_directory', 'can_delete')) {
                return back()->with('error', "Access Denied: Your role ({$user->role}) does not have batch delete privileges.");
            }

            Member::whereIn('id', $validated['ids'])->delete();

            AuditLog::record(
                $request,
                'DELETE',
                'Members & Life Group Registry',
                "Batch Delete ({$count} members)",
                "Deleted {$count} selected member records from the directory.",
                ['ids' => $validated['ids']],
                null,
                'warning'
            );

            return back()->with('success', "Deleted {$count} selected member records.");
        }

        if (! $this->checkModulePermission($user, 'members_directory', 'can_update')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) cannot batch update members.");
        }

        if ($validated['action'] === 'status_active') {
            Member::whereIn('id', $validated['ids'])->update(['status' => 'Active']);
            $desc = 'Set status to Active';
        } elseif ($validated['action'] === 'status_visiting') {
            Member::whereIn('id', $validated['ids'])->update(['status' => 'Visiting']);
            $desc = 'Set status to Visiting';
        } else {
            Member::whereIn('id', $validated['ids'])->update(['baptism_status' => 'Water Baptized']);
            $desc = 'Marked as Water Baptized';
        }

        AuditLog::record(
            $request,
            'UPDATE',
            'Members & Life Group Registry',
            "Batch Update ({$count} members)",
            "{$desc} for {$count} selected members.",
            null,
            ['ids' => $validated['ids'], 'action' => $validated['action']],
            'info'
        );

        return back()->with('success', "Batch updated {$count} members ({$desc}).");
    }

    /**
     * CSV / Batch Import for Members Directory.
     */
    public function importMembers(Request $request): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        if (! $this->checkModulePermission($user, 'data_import_export', 'can_import')) {
            return back()->with('error', "Access Denied: Your role ({$user->role}) does not have CSV import permission.");
        }

        $validated = $request->validate([
            'records' => 'required|array|min:1',
            'records.*.full_name' => 'required|string|max:180',
            'records.*.email' => 'nullable|string|max:180',
            'records.*.phone' => 'nullable|string|max:60',
            'records.*.ministry' => 'nullable|string|max:120',
            'records.*.life_group' => 'nullable|string|max:120',
            'records.*.baptism_status' => 'nullable|string|max:80',
            'records.*.role_type' => 'nullable|string|max:80',
            'status' => 'nullable|string|max:40',
            'records.*.status' => 'nullable|string|max:40',
        ]);

        $imported = 0;
        $baseCount = Member::count();

        foreach ($validated['records'] as $idx => $row) {
            $imported++;
            $code = ! empty($row['member_code'])
                ? $row['member_code']
                : sprintf('KLB-IMP-%03d', $baseCount + $idx + 1);

            Member::updateOrCreate(
                ['member_code' => $code],
                [
                    'full_name' => $row['full_name'],
                    'email' => $row['email'] ?? null,
                    'phone' => $row['phone'] ?? '+63 917 000 0000',
                    'ministry' => $row['ministry'] ?? 'Worship & Creative',
                    'life_group' => $row['life_group'] ?? 'Libertad Grace Group',
                    'baptism_status' => $row['baptism_status'] ?? 'Water Baptized',
                    'role_type' => $row['role_type'] ?? 'Active Member',
                    'status' => $row['status'] ?? 'Active',
                    'joined_date' => now()->toDateString(),
                    'notes' => 'Imported via CSV/Excel Batch Importer',
                ]
            );
        }

        AuditLog::record(
            $request,
            'IMPORT',
            'Members & Life Group Registry',
            "CSV Batch Import ({$imported} rows)",
            "Imported {$imported} church member records via CSV/Excel batch utility.",
            null,
            ['imported_count' => $imported],
            'info'
        );

        return back()->with('success', "Successfully imported {$imported} member records into KLB Directory!");
    }

    /**
     * Log CSV/Excel Export or Print event into the Enterprise Audit Trail.
     */
    public function logExportAction(Request $request): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        $validated = $request->validate([
            'module' => 'required|string|max:120',
            'format' => 'required|string|max:40',
            'record_count' => 'required|integer|min:0',
        ]);

        AuditLog::record(
            $request,
            'EXPORT',
            $validated['module'],
            "{$validated['format']} Export ({$validated['record_count']} records)",
            "Generated {$validated['format']} data export containing {$validated['record_count']} records from {$validated['module']}.",
            null,
            $validated,
            'info'
        );

        return back()->with('success', "Exported {$validated['record_count']} records ({$validated['format']}) and logged to Audit Trail.");
    }

    /**
     * Update Granular RBAC Role Permission Matrix (`RolesPermissionsView`).
     */
    public function updateRolePermission(Request $request, RolePermission $rolePermission): RedirectResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (! $user) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        if (! $this->checkModulePermission($user, 'rbac_users', 'can_update')) {
            return back()->with('error', "Access Denied: Only Primary Admin or authorized Admin roles can modify the RBAC matrix.");
        }

        $validated = $request->validate([
            'can_view' => 'required|boolean',
            'can_create' => 'required|boolean',
            'can_update' => 'required|boolean',
            'can_delete' => 'required|boolean',
            'can_import' => 'required|boolean',
            'can_export' => 'required|boolean',
        ]);

        $old = $rolePermission->only(['can_view', 'can_create', 'can_update', 'can_delete', 'can_import', 'can_export']);
        $rolePermission->update($validated);

        AuditLog::record(
            $request,
            'UPDATE',
            'RBAC & User Administration',
            "{$rolePermission->role_name} -> {$rolePermission->module_label}",
            "Updated granular module permissions for role [{$rolePermission->role_name}] on [{$rolePermission->module_label}].",
            $old,
            $validated,
            'warning'
        );

        return back()->with('success', "Updated permissions for {$rolePermission->role_name} • {$rolePermission->module_label}.");
    }

    /**
     * Store or Update User Account in RBAC User Management.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $actor = $this->getAuthenticatedUser($request);
        if (! $actor) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        if (! $this->checkModulePermission($actor, 'rbac_users', 'can_create') && $actor->role !== 'Admin') {
            return back()->with('error', "Access Denied: Your role ({$actor->role}) cannot create user accounts.");
        }

        $validated = $request->validate([
            'name' => 'required|string|max:180',
            'email' => 'required|email|max:180|unique:users,email',
            'role' => 'required|string|in:Primary Admin,Admin,Content Creator,Staff/Analyst',
            'department' => 'required|string|max:120',
            'phone' => 'nullable|string|max:60',
            'address' => 'nullable|string|max:255',
            'ministry' => 'nullable|string|max:120',
            'status' => 'required|string|in:Active,Suspended,Pending',
        ]);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'role' => $validated['role'],
            'department' => $validated['department'],
            'phone' => $validated['phone'] ?? '+63 917 842 1099',
            'address' => $validated['address'] ?? 'J.C. Aquino Ave., Butuan City',
            'ministry' => $validated['ministry'] ?? $validated['department'],
            'status' => $validated['status'],
            'approved_by' => $validated['status'] === 'Active' ? $actor->name : null,
            'approved_at' => $validated['status'] === 'Active' ? now() : null,
            'last_login_at' => $validated['status'] === 'Active' ? now() : null,
        ]);

        AuditLog::record(
            $request,
            'CREATE',
            'RBAC & User Administration',
            "{$newUser->name} ({$newUser->role})",
            "Created staff/admin account {$newUser->email} assigned to role [{$newUser->role}].",
            null,
            ['email' => $newUser->email, 'role' => $newUser->role, 'department' => $newUser->department],
            'warning'
        );

        return back()->with('success', "Created user account for {$newUser->name} ({$newUser->role}).");
    }

    public function updateUser(Request $request, User $managedUser): RedirectResponse
    {
        $actor = $this->getAuthenticatedUser($request);
        if (! $actor) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        if (! $this->checkModulePermission($actor, 'rbac_users', 'can_update') && $actor->role !== 'Admin') {
            return back()->with('error', "Access Denied: Your role ({$actor->role}) cannot modify user roles.");
        }

        $validated = $request->validate([
            'name' => 'required|string|max:180',
            'role' => 'required|string|in:Primary Admin,Admin,Content Creator,Staff/Analyst,Pending Approval',
            'department' => 'required|string|max:120',
            'phone' => 'nullable|string|max:60',
            'status' => 'required|string|in:Active,Suspended,Pending,Rejected',
        ]);

        $old = $managedUser->only(['name', 'role', 'department', 'status']);
        $updates = $validated;
        if ($validated['status'] === 'Active' && $managedUser->status !== 'Active') {
            $updates['approved_by'] = $actor->name;
            $updates['approved_at'] = now();
        }
        $managedUser->update($updates);

        AuditLog::record(
            $request,
            'UPDATE',
            'RBAC & User Administration',
            "{$managedUser->name} ({$managedUser->role})",
            "Updated role/profile for {$managedUser->name} to [{$managedUser->role} • {$managedUser->status}].",
            $old,
            $validated,
            'warning'
        );

        return back()->with('success', "Updated account & role for {$managedUser->name} ({$managedUser->role} • {$managedUser->status}).");
    }

    /**
     * Approve a Pending Registration and assign role (Admin or Content Creator).
     */
    public function approveUser(Request $request, User $managedUser): RedirectResponse
    {
        $actor = $this->getAuthenticatedUser($request);
        if (! $actor) {
            return redirect()->route('login')->with('error', 'Please log in first.');
        }

        if (! in_array($actor->role, ['Primary Admin', 'Admin'], true)) {
            return back()->with('error', 'Access Denied: Only Primary Admin or Admin can approve user registrations.');
        }

        $validated = $request->validate([
            'role' => 'required|string|in:Primary Admin,Admin,Content Creator,Staff/Analyst',
            'status' => 'required|string|in:Active,Rejected,Suspended,Pending',
        ]);

        $old = $managedUser->only(['role', 'status']);

        $managedUser->update([
            'role' => $validated['role'],
            'status' => $validated['status'],
            'approved_by' => $actor->name,
            'approved_at' => $validated['status'] === 'Active' ? now() : null,
        ]);

        $actionVerb = $validated['status'] === 'Active' ? 'Approved' : $validated['status'];

        AuditLog::record(
            $request,
            'UPDATE',
            'Registration & Approval Queue',
            "{$actionVerb} User: {$managedUser->name} -> {$managedUser->role}",
            "{$actor->name} ({$actor->role}) {$actionVerb} registration for {$managedUser->name} ({$managedUser->email}) and assigned role [{$managedUser->role}].",
            $old,
            ['role' => $managedUser->role, 'status' => $managedUser->status, 'approved_by' => $actor->name],
            'warning'
        );

        if ($validated['status'] === 'Active') {
            return back()->with(
                'success',
                "Approved {$managedUser->name}! They can now log in with the [{$managedUser->role}] role and edit website content & images."
            );
        }

        return back()->with('warning', "Updated registration status for {$managedUser->name} to {$validated['status']}.");
    }

    /**
     * Safely store an uploaded CMS image directly into public/uploads/cms without relying on
     * $file->getRealPath() (which returns false on Windows + Apache when upload_tmp_dir is C:\Windows\Temp).
     */
    private function resolveUploadedCmsImage(Request $request): ?string
    {
        $destDir = public_path('uploads/cms');
        if (! is_dir($destDir)) {
            @mkdir($destDir, 0775, true);
        }

        if ($request->hasFile('image_file')) {
            try {
                $file = $request->file('image_file');
                if ($file) {
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
                    if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'], true)) {
                        $ext = 'jpg';
                    }

                    $filename = 'klb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
                    $pathname = $file->getPathname();

                    if (! empty($pathname) && is_file($pathname)) {
                        $file->move($destDir, $filename);

                        return '/uploads/cms/' . $filename;
                    }
                }
            } catch (\Throwable $e) {
                // Fall through to base64 image fallback if Windows temp directory blocks file move
            }
        }

        $base64 = $request->input('image_base64');
        if (is_string($base64) && preg_match('/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/', $base64, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') {
                $ext = 'jpg';
            } elseif ($ext === 'svg+xml') {
                $ext = 'svg';
            }
            $binary = base64_decode($matches[2], true);
            if ($binary !== false) {
                $filename = 'klb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
                file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $binary);

                return '/uploads/cms/' . $filename;
            }
        }

        return null;
    }

    /**
     * Resolve multiple gallery images for a card (existing URLs + newly uploaded files or base64 data URLs).
     *
     * @param  array<int, string|null>  $existingGallery
     * @return array<int, string>
     */
    private function resolveUploadedGalleryImages(Request $request, array $existingGallery = [], ?string $primaryImageUrl = null): array
    {
        $destDir = public_path('uploads/cms');
        if (! is_dir($destDir)) {
            @mkdir($destDir, 0775, true);
        }

        $gallery = [];
        foreach ($existingGallery as $item) {
            if (is_string($item) && trim($item) !== '') {
                $gallery[] = trim($item);
            }
        }

        if ($request->hasFile('gallery_files')) {
            $files = $request->file('gallery_files');
            if (! is_array($files)) {
                $files = [$files];
            }

            foreach ($files as $file) {
                if (! $file) {
                    continue;
                }
                try {
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
                    if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'], true)) {
                        $ext = 'jpg';
                    }
                    $filename = 'klb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
                    $pathname = $file->getPathname();
                    if (! empty($pathname) && is_file($pathname)) {
                        $file->move($destDir, $filename);
                        $gallery[] = '/uploads/cms/' . $filename;
                    }
                } catch (\Throwable $e) {
                    // Continue to base64 fallback
                }
            }
        }

        $base64List = $request->input('gallery_base64', []);
        if (is_array($base64List)) {
            foreach ($base64List as $base64) {
                if (is_string($base64) && preg_match('/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/', $base64, $matches)) {
                    $ext = strtolower($matches[1]);
                    if ($ext === 'jpeg') {
                        $ext = 'jpg';
                    } elseif ($ext === 'svg+xml') {
                        $ext = 'svg';
                    }
                    $binary = base64_decode($matches[2], true);
                    if ($binary !== false) {
                        $filename = 'klb_' . date('Ymd_His') . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
                        file_put_contents($destDir . DIRECTORY_SEPARATOR . $filename, $binary);
                        $gallery[] = '/uploads/cms/' . $filename;
                    }
                }
            }
        }

        if (is_string($primaryImageUrl) && trim($primaryImageUrl) !== '') {
            $primaryTrimmed = trim($primaryImageUrl);
            if (! in_array($primaryTrimmed, $gallery, true)) {
                array_unshift($gallery, $primaryTrimmed);
            }
        }

        return array_values(array_unique($gallery));
    }
}

