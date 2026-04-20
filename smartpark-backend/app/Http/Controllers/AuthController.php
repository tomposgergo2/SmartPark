<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\RefreshToken;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Config;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => User::ROLE_USER,
            'status' => 'ACTIVE',
        ]);

        // create an access token with expiry and a refresh token
        $accessTtl = Config::get('tokens.access_token_minutes', 60);
        $refreshDays = Config::get('tokens.refresh_token_days', 30);

        $accessToken = $user->createToken('api-token', ['*'], Carbon::now()->addMinutes($accessTtl))->plainTextToken;

        // create refresh token (plain returned, hash stored)
        $plainRefresh = Str::random(Config::get('tokens.refresh_token_length', 64));
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $plainRefresh),
            'expires_at' => Carbon::now()->addDays($refreshDays),
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
        ]);

        return response()->json(['access_token' => $accessToken, 'refresh_token' => $plainRefresh, 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $accessTtl = Config::get('tokens.access_token_minutes', 60);
        $refreshDays = Config::get('tokens.refresh_token_days', 30);

        $accessToken = $user->createToken('api-token', ['*'], Carbon::now()->addMinutes($accessTtl))->plainTextToken;

        $plainRefresh = Str::random(Config::get('tokens.refresh_token_length', 64));
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $plainRefresh),
            'expires_at' => Carbon::now()->addDays($refreshDays),
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
        ]);

        return response()->json(['access_token' => $accessToken, 'refresh_token' => $plainRefresh, 'user' => $user]);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        // optionally, remove a refresh token if client supplied one
        $refresh = $request->input('refresh_token');
        if ($refresh) {
            try {
                RefreshToken::where('token_hash', hash('sha256', $refresh))->where('user_id', $request->user()->id)->delete();
            } catch (\Exception $e) {}
        }

        return response()->json(['message' => 'Logged out']);
    }

    public function tokens(Request $request)
    {
        $tokens = $request->user()->tokens()
            ->get(['id', 'name', 'last_used_at', 'created_at']);

        // also return refresh tokens for convenience
        $refreshes = RefreshToken::where('user_id', $request->user()->id)->get(['id', 'created_at', 'last_used_at', 'expires_at', 'ip_address']);

        return response()->json(['access_tokens' => $tokens, 'refresh_tokens' => $refreshes]);
    }

    public function revokeToken(Request $request, int $id)
    {
        $token = PersonalAccessToken::find($id);

        if (! $token || (int) $token->tokenable_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Token not found.'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Token revoked']);
    }

    /**
     * Exchange a refresh token for a new access token.
     * Accepts: { refresh_token }
     */
    public function refresh(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $hash = hash('sha256', $data['refresh_token']);
        $rt = RefreshToken::where('token_hash', $hash)->first();
        if (! $rt || ($rt->expires_at && $rt->expires_at->isPast())) {
            return response()->json(['message' => 'Invalid or expired refresh token.'], 401);
        }

        $user = $rt->user;
        if (! $user) {
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }

        // rotate refresh token: delete old, create new
        $rt->delete();

        $accessTtl = Config::get('tokens.access_token_minutes', 60);
        $refreshDays = Config::get('tokens.refresh_token_days', 30);

        $accessToken = $user->createToken('api-token', ['*'], Carbon::now()->addMinutes($accessTtl))->plainTextToken;

        $plainRefresh = Str::random(Config::get('tokens.refresh_token_length', 64));
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $plainRefresh),
            'expires_at' => Carbon::now()->addDays($refreshDays),
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
        ]);

        return response()->json(['access_token' => $accessToken, 'refresh_token' => $plainRefresh, 'user' => $user]);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices']);
    }
    // Change password for authenticated users (requires current password)
    public function changePassword(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = $data['password'];
        $user->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
