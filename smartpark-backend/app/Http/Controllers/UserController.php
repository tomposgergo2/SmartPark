<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List users (optional q search)
     */
    public function index(Request $request)
    {
        // require admin role (policy sometimes wasn't registered in dev),
        // do an explicit check to avoid 403 caused by policy loading timing
        if (! $request->user() || $request->user()->role !== User::ROLE_ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $q = $request->query('q');
        $query = User::query()->select(['id','name','email','role','status']);
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%");
            });
        }
        $users = $query->orderBy('id', 'desc')->get();
        return response()->json($users);
    }

    /**
     * Create a user
     */
    public function store(Request $request)
    {
        if (! $request->user() || $request->user()->role !== User::ROLE_ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'role' => 'nullable|string|max:64',
        ]);

        $user = User::create(array_merge($data, ['password' => bcrypt(str()->random(12)), 'status' => 'ACTIVE']));

        return response()->json($user, 201);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        if (! $request->user() || $request->user()->role !== User::ROLE_ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'role' => 'sometimes|string|max:64',
            'status' => 'sometimes|string|max:32',
        ]);

        $user->update($data);

        // ensure we return the latest values from DB
        $user->refresh();

        return response()->json($user);
    }
}
