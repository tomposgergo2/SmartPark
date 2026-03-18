<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\FineController;
use App\Http\Controllers\OfficerController;
use App\Http\Controllers\AdminController;

Route::get('/health', fn () => response()->json(['ok' => true]));
Route::get('/zones', [ZoneController::class, 'index']);
// Admin-only zone management (policies enforce admin role)
Route::middleware('auth:sanctum')->group(function () {
	Route::post('/zones', [ZoneController::class, 'store']);
	Route::put('/zones/{id}', [ZoneController::class, 'update']);
	Route::delete('/zones/{id}', [ZoneController::class, 'destroy']);
});

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/auth/tokens', [AuthController::class, 'tokens']);
	Route::delete('/auth/tokens/{id}', [AuthController::class, 'revokeToken']);
	Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);

	// Vehicles
	Route::get('/vehicles', [VehicleController::class, 'index']);
	Route::post('/vehicles', [VehicleController::class, 'store']);
	Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
	Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
	Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

	// Tickets
	Route::get('/tickets', [TicketController::class, 'index']);
	Route::post('/tickets', [TicketController::class, 'store']);
	Route::post('/tickets/{id}/extend', [TicketController::class, 'extend']);

	// Fines (also expose at /fines for user-facing listing)
	Route::get('/fines', [FineController::class, 'index']);

	// Fines: issuing is authorized via policies (PARKING_OFFICER)
	Route::get('/officer/fines', [FineController::class, 'index']);
	Route::post('/officer/fines', [FineController::class, 'issue']);

	// Officer lookup by plate
	Route::get('/officer/lookup', [OfficerController::class, 'lookup']);

	// Admin stats
	Route::get('/admin/stats', [AdminController::class, 'stats']);

	// Pay a fine
	Route::post('/fines/{id}/pay', [FineController::class, 'pay']);

	// Admin users management
	Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
	Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
	Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
});

// Note: previously we registered unprotected /users routes in local mode which
// caused the unauthenticated route to override the authenticated one and
// produced confusing 403s in the UI. Keep only the auth-protected routes
// above to ensure proper authorization checks.
