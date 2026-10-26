<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\Member;
use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Automatically seed initial KLB data if database is empty
        try {
            if (User::count() === 0 || SiteContent::count() === 0) {
                (new \Database\Seeders\DatabaseSeeder())->run();
            }
        } catch (\Throwable $e) {
            // Ignore if tables not migrated yet
        }

        // Only share authenticated user if they have actually logged in (no auto-login for visitors)
        if ($user && $user->status !== 'Active') {
            Auth::logout();
            $user = null;
        }

        $counts = [
            'cms_items' => 0,
            'cms_images' => 0,
            'members' => 0,
            'users' => 0,
            'pending_users' => 0,
            'donations' => 0,
            'audit_logs' => 0,
        ];

        try {
            $counts['cms_items'] = SiteContent::count();
            $counts['cms_images'] = SiteContent::whereNotNull('image_url')->where('image_url', '!=', '')->count();
            $counts['members'] = Member::count();
            $counts['users'] = User::count();
            $counts['pending_users'] = User::where('status', 'Pending')->count();
            $counts['donations'] = Donation::count();
            $counts['audit_logs'] = AuditLog::count();
        } catch (\Throwable $e) {
            // Tables might not be migrated yet during initial boot
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'Primary Admin',
                    'requested_role' => $user->requested_role,
                    'department' => $user->department ?? 'Executive Leadership',
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'birthdate' => $user->birthdate?->format('Y-m-d'),
                    'gender' => $user->gender,
                    'ministry' => $user->ministry,
                    'bio' => $user->bio,
                    'status' => $user->status ?? 'Active',
                    'avatar_url' => $user->avatar_url,
                    'can_edit_content' => $user->canEditContentAndImages(),
                    'permissions' => $user->resolvedPermissions(),
                ] : null,
            ],
            'counts' => $counts,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ];
    }
}
