<?php

namespace App\Modules\Establishments\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Establishments\Requests\UpdateEstablishmentProfileRequest;
use App\Modules\Establishments\Resources\EstablishmentResource;
use App\Modules\Establishments\Services\EstablishmentService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly EstablishmentService $establishments) {}

    public function show(Request $request): EstablishmentResource
    {
        return new EstablishmentResource(
            $request->user()->establishment->load(['user:id,email', 'city.state', 'category']),
        );
    }

    public function update(UpdateEstablishmentProfileRequest $request): EstablishmentResource
    {
        $establishment = $request->user()->establishment;
        $this->establishments->update($establishment, $request->validated());

        return new EstablishmentResource($establishment->load(['user:id,email', 'city.state', 'category']));
    }
}
