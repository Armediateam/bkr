<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30)->index();
            $table->string('number')->unique();
            $table->date('transaction_date');
            $table->string('cash_account_code', 20)->nullable();
            $table->string('main_account_code', 20)->nullable();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('party_name')->nullable();
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
            $table->text('description')->nullable();
            $table->string('supplier_invoice_number')->nullable();
            $table->string('tax_invoice_number')->nullable();
            $table->date('due_date')->nullable();
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('shipping')->default(0);
            $table->unsignedBigInteger('other_fee')->default(0);
            $table->unsignedBigInteger('marketplace_fee')->default(0);
            $table->unsignedBigInteger('ppn')->default(0);
            $table->unsignedBigInteger('pph22')->default(0);
            $table->unsignedBigInteger('pph23')->default(0);
            $table->unsignedBigInteger('total')->default(0);
            $table->unsignedBigInteger('paid_amount')->default(0);
            $table->unsignedBigInteger('outstanding_amount')->default(0);
            $table->unsignedBigInteger('hpp_total')->default(0);
            $table->unsignedBigInteger('gross_profit')->default(0);
            $table->boolean('create_invoice')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('financial_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('quantity', 14, 2)->default(1);
            $table->unsignedBigInteger('unit_price')->default(0);
            $table->unsignedBigInteger('unit_cost')->default(0);
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->string('unit')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transaction_items');
        Schema::dropIfExists('financial_transactions');
    }
};
