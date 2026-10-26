<?php

use App\Http\Controllers\AdminPortalController;
use App\Http\Controllers\PublicSiteController;
use Illuminate\Support\Facades\Route;

// Public Visitor Website (Landing Page, About Us, Ministries, Sermons, Events, Gallery, Make Donations)
Route::get('/', [PublicSiteController::class, 'index'])->name('home');
Route::get('/about', function () {
    return redirect('/?view=about');
})->name('about');
Route::post('/donations', [PublicSiteController::class, 'storeDonation'])->name('donations.store');

// Personal Info Registration & Admin Approval Login Portal
Route::get('/login', [PublicSiteController::class, 'showAuth'])->name('login');
Route::post('/login', [PublicSiteController::class, 'login'])->name('login.submit');
Route::get('/register', [PublicSiteController::class, 'showAuth'])->name('register');
Route::post('/register', [PublicSiteController::class, 'register'])->name('register.submit');
Route::post('/logout', [PublicSiteController::class, 'logout'])->name('logout');

// Unified Enterprise Admin Shell & CMS Portal
Route::prefix('admin')->group(function () {
    Route::get('/', [AdminPortalController::class, 'index'])->name('admin.portal');

    // RBAC Session / Role Switcher
    Route::post('/switch-user', [AdminPortalController::class, 'switchUser'])->name('admin.switch-user');

    // Visitor Website CMS & Visual Image Studio
    Route::post('/cms', [AdminPortalController::class, 'storeSiteContent'])->name('admin.cms.store');
    Route::post('/cms/{siteContent}', [AdminPortalController::class, 'updateSiteContent'])->name('admin.cms.update');
    Route::delete('/cms/{siteContent}', [AdminPortalController::class, 'deleteSiteContent'])->name('admin.cms.delete');

    // Church Members & Ministry Registry (Inline Edit, Batch Actions, CSV Import)
    Route::post('/members', [AdminPortalController::class, 'storeMember'])->name('admin.members.store');
    Route::put('/members/{member}', [AdminPortalController::class, 'updateMember'])->name('admin.members.update');
    Route::post('/members/batch', [AdminPortalController::class, 'batchMembers'])->name('admin.members.batch');
    Route::post('/members/import', [AdminPortalController::class, 'importMembers'])->name('admin.members.import');

    // Export Audit Logger
    Route::post('/export-log', [AdminPortalController::class, 'logExportAction'])->name('admin.export.log');

    // RBAC Role Permissions Matrix, User Registration Approval & Users
    Route::put('/role-permissions/{rolePermission}', [AdminPortalController::class, 'updateRolePermission'])->name('admin.rbac.permission.update');
    Route::post('/users', [AdminPortalController::class, 'storeUser'])->name('admin.users.store');
    Route::put('/users/{managedUser}', [AdminPortalController::class, 'updateUser'])->name('admin.users.update');
    Route::post('/users/{managedUser}/approve', [AdminPortalController::class, 'approveUser'])->name('admin.users.approve');
});
