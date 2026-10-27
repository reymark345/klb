<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\Member;
use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function index(Request $request): Response
    {
        if (SiteContent::count() === 0 || User::count() === 0) {
            (new \Database\Seeders\DatabaseSeeder())->run();
        }

        $contents = SiteContent::orderBy('sort_order')->orderBy('id')->get();

        $recentDonations = [];
        try {
            $recentDonations = Donation::orderBy('id', 'desc')->limit(6)->get()->map(fn (Donation $d) => [
                'id' => $d->id,
                'donor_name' => $d->is_anonymous ? 'Anonymous Kingdom Giver' : $d->donor_name,
                'amount' => $d->amount,
                'fund_category' => $d->fund_category,
                'payment_method' => $d->payment_method,
                'message' => $d->message,
                'time_ago' => $d->created_at?->diffForHumans() ?? 'Just now',
                'created_at_human' => $d->created_at?->diffForHumans() ?? 'Just now',
            ]);
        } catch (\Throwable $e) {
            // Table may not be migrated yet
        }

        return Inertia::render('Welcome', [
            'contents' => $contents,
            'initialTab' => $request->query('view', 'landing'),
            'donations' => $recentDonations,
            'recentDonations' => $recentDonations,
            'churchStats' => [
                'members_count' => Member::count() + 620,
                'life_groups_count' => 32,
                'years_in_butuan' => (int) date('Y') - 2012,
                'barangays_reached' => 27,
            ],
        ]);
    }

    /**
     * Store a Visitor Donation from the Landing Page.
     */
    public function storeDonation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'donor_name' => 'required|string|max:180',
            'email' => 'nullable|email|max:180',
            'donor_email' => 'nullable|email|max:180',
            'phone' => 'nullable|string|max:60',
            'donor_phone' => 'nullable|string|max:60',
            'amount' => 'required|numeric|min:1',
            'fund_category' => 'required|string|max:120',
            'payment_method' => 'required|string|max:80',
            'reference_number' => 'nullable|string|max:100',
            'message' => 'nullable|string|max:600',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $donation = Donation::create([
            'donor_name' => $validated['donor_name'],
            'email' => $validated['email'] ?? $validated['donor_email'] ?? null,
            'phone' => $validated['phone'] ?? $validated['donor_phone'] ?? null,
            'amount' => $validated['amount'],
            'fund_category' => $validated['fund_category'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? ('KLB-GIVE-' . strtoupper(bin2hex(random_bytes(3)))),
            'message' => $validated['message'] ?? null,
            'is_anonymous' => (bool) ($validated['is_anonymous'] ?? false),
            'status' => 'Verified',
        ]);

        $displayDonor = $donation->is_anonymous ? 'Anonymous Donor' : $donation->donor_name;
        $formattedAmount = number_format($donation->amount, 2);

        AuditLog::record(
            $request,
            'CREATE',
            'Donations & Giving',
            "Donation: ₱{$formattedAmount} ({$donation->fund_category})",
            "Recorded landing page donation of ₱{$formattedAmount} from {$displayDonor} via {$donation->payment_method}.",
            null,
            [
                'donor' => $displayDonor,
                'amount' => $donation->amount,
                'fund' => $donation->fund_category,
                'method' => $donation->payment_method,
                'reference' => $donation->reference_number,
            ],
            'info'
        );

        return back()->with(
            'success',
            "Thank you, {$displayDonor}! Your donation of ₱{$formattedAmount} for {$donation->fund_category} has been recorded. God bless your generosity!"
        );
    }

    /**
     * Render Login & Personal Info Registration Portal.
     */
    public function showAuth(Request $request): Response
    {
        $mode = $request->routeIs('register') || $request->query('mode') === 'register'
            ? 'register'
            : 'login';

        $primaryAdmin = User::where('role', 'Primary Admin')->first();

        return Inertia::render('Auth/AuthPortal', [
            'initialMode' => $mode,
            'primaryAdminEmail' => $primaryAdmin?->email ?? 'rnvaldehueza@klbbutuan.org',
            'primaryAdminName' => $primaryAdmin?->name ?? 'RN Valdehueza (Primary Admin)',
        ]);
    }

    /**
     * Register Personal Info first — Account is created as Pending until Admin approves and assigns role.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:180',
            'email' => 'required|email|max:180|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:60',
            'address' => 'required|string|max:255',
            'birthdate' => 'required|date',
            'gender' => 'required|string|max:40',
            'ministry' => 'required|string|max:120',
            'department' => 'required|string|max:120',
            'requested_role' => 'required|string|in:Admin,Content Creator',
            'bio' => 'nullable|string|max:600',
        ]);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'Pending Approval',
            'requested_role' => $validated['requested_role'],
            'department' => $validated['department'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'birthdate' => $validated['birthdate'],
            'gender' => $validated['gender'],
            'ministry' => $validated['ministry'],
            'bio' => $validated['bio'] ?? null,
            'status' => 'Pending',
        ]);

        AuditLog::record(
            $request,
            'CREATE',
            'Registration & Approval Queue',
            "Pending Registration: {$newUser->name} ({$newUser->email})",
            "New operator registered personal info requesting role [{$newUser->requested_role}]. Waiting for Primary Admin approval before login is allowed.",
            null,
            [
                'name' => $newUser->name,
                'email' => $newUser->email,
                'phone' => $newUser->phone,
                'address' => $newUser->address,
                'ministry' => $newUser->ministry,
                'requested_role' => $newUser->requested_role,
                'status' => 'Pending',
            ],
            'warning'
        );

        return redirect()->route('login')->with(
            'success',
            "Personal Info Registered! Your account ({$newUser->email}) is now PENDING Admin Approval. Once the Primary Admin approves your registration and assigns your role (Admin or Content Creator), you will be able to log in."
        );
    }

    /**
     * Authenticate User — Blocks login if user is still Pending approval.
     */
    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginIdentifier = trim($validated['email']);
        $user = User::where('email', $loginIdentifier)->first();

        if (! $user && strtolower($loginIdentifier) === 'rnvaldehueza') {
            $user = User::where('role', 'Primary Admin')->first();
        }

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return back()->with('error', 'Invalid username/email or password. If you have not registered your Personal Info yet, please register first.');
        }

        if ($user->status === 'Pending') {
            return back()->with(
                'warning',
                "Account Pending Approval: Hello {$user->name}, your Personal Info registration has been received, but an Admin has not approved your account yet. Please wait for the Primary Admin to approve you and assign your role (Admin or Content Creator)."
            );
        }

        if ($user->status !== 'Active') {
            return back()->with(
                'error',
                "Access Restricted: Your account status is currently [{$user->status}]. Please contact the Primary Admin."
            );
        }

        $user->update(['last_login_at' => now()]);
        $request->session()->forget('logged_out');
        Auth::login($user);

        AuditLog::record(
            $request,
            'UPDATE',
            'Authentication & Session',
            "Operator Login -> {$user->name} ({$user->role})",
            "Approved user {$user->email} signed in with role [{$user->role}].",
            null,
            ['email' => $user->email, 'role' => $user->role],
            'info'
        );

        return redirect()->route('admin.portal')->with(
            'success',
            "Welcome back, {$user->name}! You are signed in as {$user->role}."
        );
    }

    /**
     * Log out the current session and redirect to the Login / Register page.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->put('logged_out', true);

        return redirect()->route('login')->with(
            'success',
            'You have signed out. Register Personal Info as a new user or sign in below.'
        );
    }
}
