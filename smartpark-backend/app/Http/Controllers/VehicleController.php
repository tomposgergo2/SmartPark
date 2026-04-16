<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->vehicles()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plate_number' => 'required|string|max:15|unique:vehicles,plate_number',
            'make' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
        ]);

        $vehicle = $request->user()->vehicles()->create($data);

        return response()->json($vehicle, 201);
    }

    public function show(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        return $vehicle;
    }

    public function update(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        $data = $request->validate([
            'plate_number' => 'required|string|max:15|unique:vehicles,plate_number,' . $vehicle->id,
            'make' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
        ]);
        $vehicle->update($data);
        return $vehicle;
    }

    public function destroy(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);
        $vehicle->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
