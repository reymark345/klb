<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\SiteContent;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class KlbApplicationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        if (SiteContent::count() === 0 || User::count() === 0) {
            $this->seed(DatabaseSeeder::class);
        }
    }

    public function test_visitor_landing_page_loads_with_cms_visual_slots_and_is_unauthenticated(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $this->assertGuest();
        $this->assertGreaterThanOrEqual(20, SiteContent::count());
    }

    public function test_unauthenticated_visitors_are_redirected_to_login_when_accessing_admin_or_editing_images(): void
    {
        $this->get('/admin')->assertRedirect('/login');

        $slot = SiteContent::where('key', 'hero_main_banner')->firstOrFail();
        $originalUrl = $slot->image_url;

        $this->post("/admin/cms/{$slot->id}", [
            'page' => $slot->page,
            'section' => $slot->section,
            'label' => $slot->label,
            'title' => 'Guest Attempt',
            'image_url' => 'https://example.com/guest.jpg',
        ])->assertRedirect('/login');

        $this->assertEquals($originalUrl, $slot->fresh()->image_url);
    }

    public function test_admin_portal_loads_with_rbac_members_and_audit_trail_when_logged_in(): void
    {
        $admin = User::where('role', 'Primary Admin')->firstOrFail();
        $response = $this->actingAs($admin)->get('/admin');
        $response->assertStatus(200);
    }

    public function test_admin_and_content_creator_roles_can_update_visitor_images_and_log_audit(): void
    {
        $admin = User::where('role', 'Admin')->firstOrFail();
        $creator = User::where('role', 'Content Creator')->firstOrFail();
        $slot = SiteContent::where('key', 'about_story_photo')->firstOrFail();

        $newImageUrl = 'https://images.unsplash.com/photo-1548625361-16802b165212?auto=format&fit=crop&w=1400&q=85';

        $response = $this->actingAs($admin)->post("/admin/cms/{$slot->id}", [
            'page' => $slot->page,
            'section' => $slot->section,
            'label' => $slot->label,
            'title' => 'Updated About Us Heritage Headline',
            'subtitle' => $slot->subtitle,
            'body' => $slot->body,
            'image_url' => $newImageUrl,
            'focal_point' => 'center',
            'aspect_ratio' => '16:9',
            'is_published' => true,
        ]);

        $response->assertRedirect();
        $this->assertEquals($newImageUrl, $slot->fresh()->image_url);
        $this->assertEquals('Updated About Us Heritage Headline', $slot->fresh()->title);

        $creatorImageUrl = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85';
        $this->actingAs($creator)->post("/admin/cms/{$slot->id}", [
            'page' => $slot->page,
            'section' => $slot->section,
            'label' => $slot->label,
            'title' => 'Updated By Content Creator',
            'subtitle' => $slot->subtitle,
            'body' => $slot->body,
            'image_url' => $creatorImageUrl,
            'focal_point' => 'center',
            'aspect_ratio' => '16:9',
            'is_published' => true,
        ])->assertRedirect();

        $this->assertEquals($creatorImageUrl, $slot->fresh()->image_url);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'UPDATE',
            'module' => 'Visitor CMS & Image Studio',
        ]);
    }

    public function test_staff_analyst_role_is_blocked_from_updating_visitor_images_by_default(): void
    {
        $staff = User::where('role', 'Staff/Analyst')->firstOrFail();
        $slot = SiteContent::where('key', 'hero_main_banner')->firstOrFail();
        $originalUrl = $slot->image_url;

        $response = $this->actingAs($staff)->post("/admin/cms/{$slot->id}", [
            'page' => $slot->page,
            'section' => $slot->section,
            'label' => $slot->label,
            'title' => 'Unauthorized Edit',
            'image_url' => 'https://example.com/blocked.jpg',
        ]);

        $response->assertRedirect();
        $this->assertEquals($originalUrl, $slot->fresh()->image_url);
        $this->assertDatabaseHas('audit_logs', [
            'severity' => 'critical',
            'module' => 'Visitor CMS & Image Studio',
        ]);
    }

    public function test_member_inline_update_and_csv_import_work_and_record_audit(): void
    {
        $admin = User::where('role', 'Primary Admin')->firstOrFail();
        $member = Member::firstOrFail();

        $this->actingAs($admin)->put("/admin/members/{$member->id}", [
            'full_name' => 'Engr. Marco Villanueva Jr.',
            'email' => $member->email,
            'phone' => $member->phone,
            'ministry' => 'Worship & Creative',
            'life_group' => 'Libertad Grace Group',
            'baptism_status' => 'Water Baptized',
            'role_type' => 'Ministry Leader',
            'status' => 'Active',
        ])->assertRedirect();

        $this->assertEquals('Engr. Marco Villanueva Jr.', $member->fresh()->full_name);

        $beforeCount = Member::count();
        $this->actingAs($admin)->post('/admin/members/import', [
            'records' => [
                [
                    'full_name' => 'Ptr. Samuel Butuan',
                    'email' => 'samuel@klbbutuan.org',
                    'phone' => '+63 917 999 1111',
                    'ministry' => 'Intercessory Prayer',
                    'life_group' => 'Butuan North Cell',
                    'baptism_status' => 'Water Baptized',
                    'role_type' => 'Cell Leader',
                    'status' => 'Active',
                ],
            ],
        ])->assertRedirect();

        $this->assertEquals($beforeCount + 1, Member::count());
        $this->assertGreaterThan(0, AuditLog::where('action', 'IMPORT')->count());
    }

    public function test_admin_can_dynamically_create_worship_team_card_and_update_multi_image_gallery_card(): void
    {
        $admin = User::where('role', 'Primary Admin')->firstOrFail();

        // 1. Dynamically create a new Worship Team card
        $this->actingAs($admin)->post('/admin/cms', [
            'key' => 'worship_team_test_member',
            'page' => 'Ministries',
            'section' => 'Worship Team',
            'label' => 'Worship Team — Bro. Ethan Cruz',
            'title' => 'Bro. Ethan Cruz',
            'subtitle' => 'BASS GUITAR & VOCALS • SOUND OF HEAVEN',
            'body' => 'Serves faithfully on the Sound of Heaven worship team in Butuan City.',
            'image_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
            'focal_point' => 'contain',
            'aspect_ratio' => '1:1',
            'is_published' => 1,
        ])->assertRedirect();

        $created = SiteContent::where('key', 'worship_team_test_member')->first();
        $this->assertNotNull($created);
        $this->assertEquals('Worship Team', $created->section);
        $this->assertEquals('contain', $created->focal_point);

        // 2. Update a "Life at Kingdom Life Butuan" card with multiple images for auto-slideshow
        $galleryCard = SiteContent::where('key', 'gallery_butuan_1')->firstOrFail();
        $slides = [
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=900&q=80',
        ];

        $this->actingAs($admin)->post("/admin/cms/{$galleryCard->id}", [
            'page' => $galleryCard->page,
            'section' => $galleryCard->section,
            'label' => $galleryCard->label,
            'title' => $galleryCard->title,
            'subtitle' => $galleryCard->subtitle,
            'body' => $galleryCard->body,
            'image_url' => $slides[0],
            'gallery_images' => $slides,
            'focal_point' => 'center',
            'aspect_ratio' => '4:3',
            'is_published' => 1,
        ])->assertRedirect();

        $freshGallery = $galleryCard->fresh();
        $this->assertIsArray($freshGallery->gallery_images);
        $this->assertCount(3, $freshGallery->gallery_images);
        $this->assertEquals($slides, $freshGallery->gallery_images);
    }
}

