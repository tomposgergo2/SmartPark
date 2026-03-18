<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

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

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user], 201);
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

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
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

        return response()->json(['message' => 'Logged out']);
    }

    public function tokens(Request $request)
    {
        $tokens = $request->user()->tokens()
            ->get(['id', 'name', 'last_used_at', 'created_at']);

        return response()->json($tokens);
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

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices']);
    }
}
