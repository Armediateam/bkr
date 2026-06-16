<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows an owner to create a project', function () {
    $owner = User::factory()->create([
        'role' => 'owner',
    ]);

    $response = $this->actingAs($owner)->post(route('proyek.store'), [
        'namaProyek' => 'Proyek Baru Samudra',
        'lokasi' => 'Badung, Bali',
        'client' => 'PT Samudra Indah',
        'productManager' => 'Nadia Putri',
        'targetSelesai' => now()->addDays(30)->toDateString(),
        'progress' => 0,
        'status' => 'Perencanaan',
        'nilaiKontrak' => 'Rp 1.100.000.000',
    ]);

    $response
        ->assertRedirect(route('proyek'))
        ->assertSessionHas('success');

    $project = Project::query()->where('nama_proyek', 'Proyek Baru Samudra')->first();

    expect($project)->not->toBeNull()
        ->and($project?->lokasi)->toBe('Badung, Bali')
        ->and($project?->client)->toBe('PT Samudra Indah')
        ->and($project?->product_manager)->toBe('Nadia Putri')
        ->and($project?->status)->toBe('Perencanaan');
});
