<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
    public function index()
    {
        return Zone::where('active', 1)->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Zone::class);

        $data = $request->validate([
            'name' => 'required|string|unique:zones,name',
            'rate_per_hour' => 'required|integer|min:0',
            'min_minutes' => 'required|integer|min:1',
            'max_minutes' => 'required|integer|min:1',
            'fine_amount' => 'required|integer|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $zone = Zone::create($data);

        return response()->json($zone, 201);
    }

    public function update(Request $request, $id)
    {
        $zone = Zone::findOrFail($id);
        $this->authorize('update', $zone);

        $data = $request->validate([
            'name' => 'sometimes|string|unique:zones,name,' . $zone->id,
            'rate_per_hour' => 'sometimes|integer|min:0',
            'min_minutes' => 'sometimes|integer|min:1',
            'max_minutes' => 'sometimes|integer|min:1',
            'fine_amount' => 'sometimes|integer|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $zone->update($data);

        return $zone;
    }

    public function destroy(Request $request, $id)
    {
        $zone = Zone::findOrFail($id);
        $this->authorize('delete', $zone);
        $zone->delete();

        return response()->json(['message' => 'Deleted']);
    }

}
