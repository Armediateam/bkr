<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductManagerRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProductManagerUserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('product-manager', [
            'users' => User::query()
                ->where('role', 'product_manager')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at']),
        ]);
    }

    public function store(StoreProductManagerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'product_manager',
        ]);

        return back()->with('success', 'Akun Product Manager berhasil dibuat.');
    }
}
