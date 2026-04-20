<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Zone;
use App\Models\Vehicle;
use App\Models\Payment;
use Carbon\Carbon;
use App\Events\TicketPurchased;
use App\Services\PaymentSimulator;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        // If the requester is an admin or a parking officer, return all tickets with related vehicle/user and zone info
        if ($request->user() && in_array($request->user()->role, ['ADMIN', 'PARKING_OFFICER'])) {
            // return all tickets newest-first
            $all = Ticket::with('vehicle.user', 'zone')->orderByDesc('start_time')->get()->map(function ($t) {
                // normalize a few helpful display fields for the frontend
                $arr = $t->toArray();
                $arr['user'] = $t->vehicle ? ($t->vehicle->user ? $t->vehicle->user->toArray() : null) : null;
                $arr['plate'] = $t->vehicle ? $t->vehicle->plate_number : null;
                return $arr;
            });
            return $all;
        }

        // otherwise list the authenticated user's tickets (by their vehicles), newest-first
        $collection = $request->user()->vehicles()->with('tickets.zone')->get()->pluck('tickets')->flatten();
        return $collection->sortByDesc('start_time')->values()->all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'zone_id' => 'required|exists:zones,id',
            'minutes' => 'required|integer|min:1',
            // only card simulation supported
            'method' => 'nullable|in:CARD_SIM',
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        // ensure vehicle belongs to user
        if ($vehicle->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: vehicle does not belong to user'], 403);
        }

        // block ticket purchases for deactivated users
        if ($request->user() && isset($request->user()->status) && $request->user()->status !== 'ACTIVE') {
            return response()->json(['message' => 'Account deactivated: you cannot purchase tickets'], 403);
        }

        $zone = Zone::findOrFail($data['zone_id']);

        // validate min/max minutes
        if ($data['minutes'] < $zone->min_minutes || $data['minutes'] > $zone->max_minutes) {
            return response()->json(['message' => 'Minutes out of allowed range for zone'], 422);
        }

        // price calculation: rate_per_hour stored as cents per hour (int). Compute price in cents.
        $minutes = (int) $data['minutes'];
        $priceCents = (int) ceil($zone->rate_per_hour * ($minutes / 60));

        // create ticket
        $start = Carbon::now();
        $end = (clone $start)->addMinutes($minutes);

        $ticket = Ticket::create([
            'vehicle_id' => $vehicle->id,
            'zone_id' => $zone->id,
            'start_time' => $start,
            'end_time' => $end,
            'price' => $priceCents,
            'status' => 'ACTIVE',
        ]);

        // simulate payment (create Payment record) via simulator
        $sim = PaymentSimulator::simulate($data['method'] ?? 'CARD_SIM', $priceCents);

        $payment = Payment::create([
            'ticket_id' => $ticket->id,
            'amount' => $priceCents,
            'method' => $sim['method'],
            'status' => $sim['status'],
            'paid_at' => Carbon::now(),
            'transaction_ref' => $sim['transaction_ref'],
        ]);

        // Fire event for bookkeeping and include any simulator meta (e.g. card info)
        event(new TicketPurchased($ticket, $payment, $sim['card'] ?? null));

        // no email sending in this build (email features removed)

        return response()->json(['ticket' => $ticket, 'payment' => $payment], 201);
    }

    public function extend(Request $request, int $id)
    {
        $data = $request->validate([
            'minutes' => 'required|integer|min:1',
            // allow card simulation method for extension payments
            'method' => 'nullable|in:CARD_SIM',
        ]);

        $ticket = Ticket::with('vehicle', 'zone')->findOrFail($id);

        if (! $ticket->vehicle || (int) $ticket->vehicle->user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Forbidden: ticket does not belong to user'], 403);
        }

        if ($ticket->status !== 'ACTIVE') {
            return response()->json(['message' => 'Only active tickets can be extended'], 422);
        }

        $currentEnd = Carbon::parse($ticket->end_time);
        if ($currentEnd->isPast()) {
            return response()->json(['message' => 'Ticket already expired'], 422);
        }

        $minutesToAdd = (int) $data['minutes'];
        $totalMinutes = Carbon::parse($ticket->start_time)->diffInMinutes((clone $currentEnd)->addMinutes($minutesToAdd));

        if ($ticket->zone && $totalMinutes > (int) $ticket->zone->max_minutes) {
            return response()->json(['message' => 'Ticket extension exceeds zone maximum minutes'], 422);
        }

        $extraPriceCents = $ticket->zone
            ? (int) ceil($ticket->zone->rate_per_hour * ($minutesToAdd / 60))
            : 0;

        $ticket->end_time = (clone $currentEnd)->addMinutes($minutesToAdd);
        $ticket->price = (int) $ticket->price + $extraPriceCents;
        $ticket->save();

        // If there's an extra price, simulate a payment for the extension using the PaymentSimulator
        if ($extraPriceCents > 0) {
            $sim = PaymentSimulator::simulate($data['method'] ?? 'CARD_SIM', $extraPriceCents);

            $payment = Payment::create([
                'ticket_id' => $ticket->id,
                'amount' => $extraPriceCents,
                'method' => $sim['method'],
                'status' => $sim['status'],
                'paid_at' => Carbon::now(),
                'transaction_ref' => $sim['transaction_ref'],
            ]);
        }

        return response()->json([
            'message' => 'Ticket extended successfully',
            'ticket' => $ticket,
            'extended_minutes' => $minutesToAdd,
            'extra_price' => $extraPriceCents,
        ]);
    }
}
