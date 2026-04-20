<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Str;

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

    // Send a password reset link to the user's email (standard Laravel flow)
    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(['email' => $data['email']]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent.']);
        }

        return response()->json(['message' => 'Unable to send reset link.'], 422);
    }

    // Reset password using token from email
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            ['email' => $data['email'], 'password' => $data['password'], 'password_confirmation' => $data['password_confirmation'], 'token' => $data['token']],
            function ($user, $password) {
                $user->password = $password;
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password has been reset.']);
        }

        return response()->json(['message' => 'Password reset failed.'], 422);
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

    // Send email verification notification to authenticated user
    public function sendEmailVerification(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email sent.']);
    }

    // Verify email via link (simple hash check)
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        $user->email_verified_at = now();
        $user->save();

        event(new Verified($user));

        return response()->json(['message' => 'Email verified.']);
    }
}
