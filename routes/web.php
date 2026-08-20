<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AccountingSetupController;
use App\Http\Controllers\AdvancedModuleController;
use App\Http\Controllers\DatabaseContactController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\ImportMarketplaceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PemasukanController;
use App\Http\Controllers\PembelianController;
use App\Http\Controllers\PendanaanController;
use App\Http\Controllers\PelunasanController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductManagerDashboardController;
use App\Http\Controllers\ProductManagerReportController;
use App\Http\Controllers\ProductManagerUserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReturPenjualanController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\TransferRekeningController;
use App\Http\Controllers\TrackerController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'role:owner'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/pemasukan', [PemasukanController::class, 'index'])->name('pemasukan.index');
    Route::post('dashboard/pemasukan', [PemasukanController::class, 'store'])->name('pemasukan.store');
    Route::get('dashboard/pembelian', [PembelianController::class, 'index'])->name('pembelian.index');
    Route::post('dashboard/pembelian', [PembelianController::class, 'store'])->name('pembelian.store');
    Route::get('dashboard/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
    Route::post('dashboard/pengeluaran', [PengeluaranController::class, 'store'])->name('pengeluaran.store');
    Route::get('dashboard/retur-penjualan', [ReturPenjualanController::class, 'index'])->name('retur-penjualan.index');
    Route::post('dashboard/retur-penjualan', [ReturPenjualanController::class, 'store'])->name('retur-penjualan.store');
    Route::get('dashboard/pelunasan', [PelunasanController::class, 'index'])->name('pelunasan.index');
    Route::post('dashboard/pelunasan', [PelunasanController::class, 'store'])->name('pelunasan.store');
    Route::get('dashboard/transfer-rekening', [TransferRekeningController::class, 'index'])->name('transfer-rekening.index');
    Route::post('dashboard/transfer-rekening', [TransferRekeningController::class, 'store'])->name('transfer-rekening.store');
    Route::get('dashboard/pendanaan', [PendanaanController::class, 'index'])->name('pendanaan.index');
    Route::post('dashboard/pendanaan', [PendanaanController::class, 'store'])->name('pendanaan.store');
    Route::get('dashboard/import-marketplace', [ImportMarketplaceController::class, 'index'])->name('import-marketplace.index');
    Route::post('dashboard/import-marketplace', [ImportMarketplaceController::class, 'store'])->name('import-marketplace.store');
    Route::get('dashboard/pos', [PosController::class, 'kasir'])->name('pos.kasir');
    Route::post('dashboard/pos', [PosController::class, 'store'])->name('pos.store');
    Route::get('dashboard/pos/master', [PosController::class, 'master'])->name('pos.master');
    Route::get('dashboard/invoice', [InvoiceController::class, 'index'])->name('invoice.index');
    Route::post('dashboard/invoice', [InvoiceController::class, 'store'])->name('invoice.store');
    Route::get('dashboard/po', [PurchaseOrderController::class, 'index'])->name('purchase-order.index');
    Route::post('dashboard/po', [PurchaseOrderController::class, 'store'])->name('purchase-order.store');
    Route::get('dashboard/database/customer', [DatabaseContactController::class, 'customer'])->name('database.customer');
    Route::post('dashboard/database/customer', [DatabaseContactController::class, 'storeCustomer'])->name('database.customer.store');
    Route::get('dashboard/database/vendor', [DatabaseContactController::class, 'vendor'])->name('database.vendor');
    Route::post('dashboard/database/vendor', [DatabaseContactController::class, 'storeVendor'])->name('database.vendor.store');
    Route::get('dashboard/stok', [InventoryController::class, 'stock'])->name('inventory.stock');
    Route::post('dashboard/stok', [InventoryController::class, 'storeStock'])->name('inventory.stock.store');
    Route::get('dashboard/produksi', [InventoryController::class, 'production'])->name('inventory.production');
    Route::post('dashboard/produksi', [InventoryController::class, 'storeProduction'])->name('inventory.production.store');
    Route::get('dashboard/kalkulator-hpp', [InventoryController::class, 'hppCalculator'])->name('inventory.hpp');
    Route::post('dashboard/kalkulator-hpp', [InventoryController::class, 'storeHpp'])->name('inventory.hpp.store');
    Route::get('dashboard/daftar-transaksi', [TrackerController::class, 'transactions'])->name('tracker.transactions');
    Route::get('dashboard/piutang', [TrackerController::class, 'receivables'])->name('tracker.receivables');
    Route::post('dashboard/piutang/bayar', [TrackerController::class, 'payReceivable'])->name('tracker.receivables.pay');
    Route::post('dashboard/piutang/write-off', [TrackerController::class, 'writeOffReceivable'])->name('tracker.receivables.write-off');
    Route::get('dashboard/hutang', [TrackerController::class, 'payables'])->name('tracker.payables');
    Route::post('dashboard/hutang/bayar', [TrackerController::class, 'payPayable'])->name('tracker.payables.pay');
    Route::get('dashboard/transaksi', [JournalController::class, 'transactions'])->name('journal.transactions');
    Route::post('dashboard/transaksi', [JournalController::class, 'storeTransaction'])->name('journal.transactions.store');
    Route::get('dashboard/log', [JournalController::class, 'activityLog'])->name('journal.log');
    Route::get('dashboard/laba-rugi', [FinancialReportController::class, 'profitLoss'])->name('reports.profit-loss');
    Route::get('dashboard/arus-kas', [FinancialReportController::class, 'cashFlow'])->name('reports.cash-flow');
    Route::get('dashboard/neraca', [FinancialReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('dashboard/perubahan-ekuitas', [FinancialReportController::class, 'equityChanges'])->name('reports.equity-changes');
    Route::get('dashboard/analisis-rasio', [FinancialReportController::class, 'ratioAnalysis'])->name('reports.ratio-analysis');
    Route::get('dashboard/buku-besar', [FinancialReportController::class, 'generalLedger'])->name('reports.general-ledger');
    Route::get('dashboard/performa-penjualan', [FinancialReportController::class, 'salesPerformance'])->name('reports.sales-performance');
    Route::get('dashboard/charts', [FinancialReportController::class, 'charts'])->name('reports.charts');
    Route::get('dashboard/aset-tetap', [FinancialReportController::class, 'fixedAssets'])->name('reports.fixed-assets');
    Route::get('dashboard/bagan-akun', [AccountingSetupController::class, 'chartOfAccounts'])->name('accounting.chart-of-accounts');
    Route::post('dashboard/bagan-akun', [AccountingSetupController::class, 'storeAccount'])->name('accounting.chart-of-accounts.store');
    Route::get('dashboard/setup/saldo-awal', [AccountingSetupController::class, 'openingBalance'])->name('accounting.opening-balance');
    Route::post('dashboard/setup/saldo-awal', [AccountingSetupController::class, 'storeOpeningBalance'])->name('accounting.opening-balance.store');
    Route::get('dashboard/pajak', [TaxController::class, 'hub'])->name('tax.hub');
    Route::get('dashboard/pajak/setor', [TaxController::class, 'payment'])->name('tax.payment');
    Route::post('dashboard/pajak/setor', [TaxController::class, 'storePayment'])->name('tax.payment.store');
    Route::get('dashboard/pajak/pembelian-pkp', [TaxController::class, 'pkpPurchase'])->name('tax.pkp-purchase');
    Route::post('dashboard/pajak/pembelian-pkp', [TaxController::class, 'storePkpPurchase'])->name('tax.pkp-purchase.store');
    Route::get('dashboard/pajak/spt-masa', [TaxController::class, 'sptVat'])->name('tax.spt-vat');
    Route::get('dashboard/pajak/pph22', [TaxController::class, 'pph22'])->name('tax.pph22');
    Route::get('dashboard/pajak/bukti-potong', [TaxController::class, 'withholdingIn'])->name('tax.withholding-in');
    Route::get('dashboard/pajak/bukti-potong-keluar', [TaxController::class, 'withholdingOut'])->name('tax.withholding-out');
    Route::get('dashboard/pajak/bukti-bayar', [TaxController::class, 'paymentProof'])->name('tax.payment-proof');
    Route::get('dashboard/gaji/karyawan', [AdvancedModuleController::class, 'employees'])->name('payroll.employees');
    Route::post('dashboard/gaji/karyawan', [AdvancedModuleController::class, 'storeEmployee'])->name('payroll.employees.store');
    Route::get('dashboard/gaji/proses', [AdvancedModuleController::class, 'payrollProcess'])->name('payroll.process');
    Route::post('dashboard/gaji/proses', [AdvancedModuleController::class, 'storePayrollProcess'])->name('payroll.process.store');
    Route::get('dashboard/gaji/riwayat', [AdvancedModuleController::class, 'payrollHistory'])->name('payroll.history');
    Route::get('dashboard/gaji/slip/{id}', [AdvancedModuleController::class, 'payrollSlip'])->name('payroll.slip');
    Route::get('dashboard/anggaran', [AdvancedModuleController::class, 'budget'])->name('budget.index');
    Route::post('dashboard/anggaran', [AdvancedModuleController::class, 'storeBudget'])->name('budget.store');
    Route::get('dashboard/pengaturan/modul', [AdvancedModuleController::class, 'moduleSettings'])->name('module-settings.index');
    Route::post('dashboard/pengaturan/modul', [AdvancedModuleController::class, 'storeModuleSettings'])->name('module-settings.store');
    Route::get('dashboard/export', [DashboardController::class, 'export'])->name('dashboard.export');
    Route::get('dashboard/laporan', [LaporanController::class, 'index'])->name('laporan');
    Route::get('dashboard/proyek', [ProjectController::class, 'index'])->name('proyek');
    Route::post('dashboard/proyek', [ProjectController::class, 'store'])->name('proyek.store');
    Route::get('dashboard/product-manager', [ProductManagerUserController::class, 'index'])->name('product-manager.users');
    Route::post('dashboard/product-manager', [ProductManagerUserController::class, 'store'])->name('product-manager.store');
    
    // User Account Management
    Route::get('dashboard/akun', [UserController::class, 'index'])->name('akun.index');
    Route::post('dashboard/akun', [UserController::class, 'store'])->name('akun.store');
    Route::delete('dashboard/akun/{user}', [UserController::class, 'destroy'])->name('akun.destroy');
});

Route::prefix('product-manager')
    ->middleware(['auth', 'verified', 'role:product_manager'])
    ->group(function () {
        Route::get('dashboard', [ProductManagerDashboardController::class, 'index'])->name('product-manager.dashboard');
        Route::get('laporan', [ProductManagerReportController::class, 'index'])->name('product-manager.laporan');
        Route::post('laporan', [ProductManagerReportController::class, 'store'])->name('product-manager.laporan.store');
    });

require __DIR__ . '/settings.php';
