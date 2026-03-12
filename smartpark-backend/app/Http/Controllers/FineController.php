<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fine;
use App\Models\Zone;
use App\Models\Vehicle;
use App\Models\FinePayment;
use Carbon\Carbon;
use App\Services\PaymentSimulator;

class FineController extends Controller
{
    // List fines for the current user (admins see all)
    public function index(Request $request)
    {
        $query = Fine::with(['vehicle', 'zone', 'issuer'])->orderBy('id', 'desc');

        if ($request->user() && ($request->user()->role ?? '') === 'ADMIN') {
            $fines = $query->get();
        } else {
            $fines = $query->where('issued_by_user_id', $request->user()->id)->get();
        }

        return response()->json($fines);
    }

    // Issue a fine (parking officer)
    public function issue(Request $request)
    {
        $this->authorize('issue', \App\Models\Fine::class);

        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'zone_id' => 'nullable|exists:zones,id',
            'reason' => 'nullable|in:NO_VALID_TICKET,EXPIRED,OTHER',
            'amount' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:255',
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        $zone = null;
        if (! empty($data['zone_id'])) {
            $zone = Zone::find($data['zone_id']);
        }

        $amount = $data['amount'] ?? ($zone ? $zone->fine_amount : 0);

        $fine = Fine::create([
            'vehicle_id' => $vehicle->id,
            'issued_by_user_id' => $request->user()->id,
            'zone_id' => $zone?->id,
            'reason' => $data['reason'] ?? 'NO_VALID_TICKET',
            'amount' => $amount,
            'status' => 'UNPAID',
            'note' => $data['note'] ?? null,
            'issued_at' => Carbon::now(),
        ]);

        return response()->json($fine, 201);
    }

    // Pay a fine (simulate)
    public function pay(Request $request, $id)
    {
        $fine = Fine::findOrFail($id);

        $this->authorize('pay', $fine);

        $data = $request->validate([
            'method' => 'nullable|in:CARD_SIM',
            'amount' => 'nullable|integer|min:0',
        ]);

        $amount = $data['amount'] ?? $fine->amount;
        if ($amount < $fine->amount) {
            return response()->json(['message' => 'Paid amount is less than fine amount.'], 422);
        }

        $sim = PaymentSimulator::simulate($data['method'] ?? 'CARD_SIM', $amount);

        $payment = FinePayment::create([
            'fine_id' => $fine->id,
            'amount' => $amount,
            'method' => $sim['method'],
            'status' => $sim['status'],
            'paid_at' => Carbon::now(),
            'transaction_ref' => $sim['transaction_ref'],
        ]);

        $fine->status = 'PAID';
        $fine->paid_at = Carbon::now();
        $fine->save();

        return response()->json(['fine' => $fine, 'payment' => $payment]);
    }
}
