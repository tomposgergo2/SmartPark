<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Ticket;
use App\Models\Payment;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        $this->authorize('viewAny', User::class); // admin only via policy before

        $users = User::count();
        $activeTickets = Ticket::where('status', 'ACTIVE')->count();

        // daily revenue (today)
        $today = Carbon::today();
        $dailyRevenue = Payment::whereDate('paid_at', $today)->sum('amount');

        // monthly revenue (this month)
        $monthStart = Carbon::now()->startOfMonth();
        $monthlyRevenue = Payment::where('paid_at', '>=', $monthStart)->sum('amount');

        return response()->json([
            'users' => $users,
            'active_tickets' => $activeTickets,
            'daily_revenue' => $dailyRevenue,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }
}
