<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use Illuminate\Http\Request;

// Ensure a named 'login' route exists so unauthenticated redirects from
// middleware do not throw a RouteNotFoundException. For API requests
// return a JSON 401; for browser requests redirect to the root login page.
Route::get('/login', function (Request $request) {
    $accept = strtolower($request->header('Accept', ''));
    // Treat requests that expect JSON or contain /api in the referer as API callers
    if ($request->expectsJson() || str_contains($accept, 'application/json') || str_contains($request->headers->get('referer', ''), '/api/')) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    return redirect('/');
})->name('login');
