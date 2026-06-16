<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ProductManagerDashboardController;
use App\Http\Controllers\ProductManagerReportController;
use App\Http\Controllers\ProductManagerUserController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'role:owner'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/export', [DashboardController::class, 'export'])->name('dashboard.export');
    Route::get('dashboard/laporan', [LaporanController::class, 'index'])->name('laporan');
    Route::get('dashboard/proyek', [ProjectController::class, 'index'])->name('proyek');
    Route::post('dashboard/proyek', [ProjectController::class, 'store'])->name('proyek.store');
    Route::get('dashboard/product-manager', [ProductManagerUserController::class, 'index'])->name('product-manager.users');
    Route::post('dashboard/product-manager', [ProductManagerUserController::class, 'store'])->name('product-manager.store');
});

Route::prefix('product-manager')
    ->middleware(['auth', 'verified', 'role:product_manager'])
    ->group(function () {
        Route::get('dashboard', [ProductManagerDashboardController::class, 'index'])->name('product-manager.dashboard');
        Route::get('laporan', [ProductManagerReportController::class, 'index'])->name('product-manager.laporan');
        Route::post('laporan', [ProductManagerReportController::class, 'store'])->name('product-manager.laporan.store');
    });

require __DIR__ . '/settings.php';
