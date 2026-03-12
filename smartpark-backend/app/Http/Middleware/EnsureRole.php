<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request and ensure the authenticated user has one of the allowed roles.
     * Usage in routes: ->middleware([\App\Http\Middleware\EnsureRole::class . ':PARKING_OFFICER'])
     * or pass multiple comma separated roles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ?string $roles = null)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        if (! $roles) {
            return $next($request);
        }

        $allowed = array_map('trim', explode(',', $roles));

        if (! in_array($user->role, $allowed, true)) {
            return response()->json(['message' => 'Forbidden. Insufficient role.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
