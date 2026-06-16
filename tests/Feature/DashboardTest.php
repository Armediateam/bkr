<?php

use App\Models\Project;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create([
        'role' => 'owner',
    ]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('owners can export the dashboard recap', function () {
    $owner = User::factory()->create([
        'role' => 'owner',
    ]);

    Project::query()->create([
        'project_id' => 'PRJ-EXPORT-001',
        'nama_proyek' => 'Proyek Export Owner',
        'progress' => 72,
        'status' => 'Aktif',
    ]);

    $response = $this->actingAs($owner)->get(route('dashboard.export'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
});

test('product managers can not visit the owner dashboard', function () {
    $user = User::factory()->create([
        'role' => 'product_manager',
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertForbidden();
});

test('product managers can visit their dashboard', function () {
    $user = User::factory()->create([
        'role' => 'product_manager',
    ]);

    $response = $this->actingAs($user)->get(route('product-manager.dashboard'));

    $response->assertOk();
});
