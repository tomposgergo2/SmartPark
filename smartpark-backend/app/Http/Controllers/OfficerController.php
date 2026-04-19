<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use Carbon\Carbon;

class OfficerController extends Controller
{
    public function lookup(Request $request)
    {
        $data = $request->validate([
            'plate' => 'required|string',
        ]);

        $plate = strtoupper($data['plate']);
        $vehicle = Vehicle::where('plate_number', $plate)->first();
        if (! $vehicle) {
            return response()->json(['status' => 'NO_VEHICLE', 'message' => 'No vehicle found for plate'], 200);
        }

    // find latest ticket for vehicle (load zone and vehicle relations so frontend has plate and owner)
    $ticket = $vehicle->tickets()->orderByDesc('start_time')->with(['zone','vehicle','vehicle.user'])->first();
        $now = Carbon::now();

        if (! $ticket) {
            return response()->json(['status' => 'NO_TICKET', 'vehicle' => $vehicle], 200);
        }

        if ($ticket->status === 'ACTIVE' && $now->between(Carbon::parse($ticket->start_time), Carbon::parse($ticket->end_time))) {
            return response()->json(['status' => 'VALID', 'ticket' => $ticket], 200);
        }

        if ($now->greaterThan(Carbon::parse($ticket->end_time))) {
            return response()->json(['status' => 'EXPIRED', 'ticket' => $ticket], 200);
        }

        return response()->json(['status' => 'UNKNOWN', 'ticket' => $ticket], 200);
    }
}
