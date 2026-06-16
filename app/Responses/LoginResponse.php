<?php

namespace App\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        if ($user?->role === 'product_manager') {
            return redirect()->route('product-manager.dashboard');
        }

        return redirect()->intended('/dashboard');
    }
}
