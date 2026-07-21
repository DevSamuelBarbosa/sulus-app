<?php

namespace App\Modules\Establishments\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Establishments\Requests\UpdateEstablishmentProfileRequest;
use App\Modules\Establishments\Requests\UpdateEstablishmentSettingsRequest;
use App\Modules\Establishments\Resources\EstablishmentResource;
use App\Modules\Establishments\Services\EstablishmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly EstablishmentService $establishments) {}

    public function show(Request $request): EstablishmentResource
    {
        return new EstablishmentResource(
            $request->user()->establishment->load(['masterUser', 'city.state', 'category']),
        );
    }

    public function update(UpdateEstablishmentProfileRequest $request): EstablishmentResource
    {
        $establishment = $request->user()->establishment;
        $this->establishments->update($establishment, $request->validated());

        return new EstablishmentResource($establishment->load(['masterUser', 'city.state', 'category']));
    }

    /**
     * Master-only, password-confirmed edit of CNPJ/active status — see
     * UpdateEstablishmentSettingsRequest.
     */
    public function updateSettings(UpdateEstablishmentSettingsRequest $request): EstablishmentResource
    {
        $establishment = $request->user()->establishment;
        $this->establishments->update(
            $establishment,
            collect($request->validated())->only(['cnpj', 'is_active'])->all(),
        );

        return new EstablishmentResource($establishment->load(['masterUser', 'city.state', 'category']));
    }

    /**
     * Self-service account deletion — Master-only, password-confirmed (see
     * UpdateEstablishmentSettingsRequest reused here for its password rule).
     */
    public function destroy(UpdateEstablishmentSettingsRequest $request): Response
    {
        $establishment = $request->user()->establishment;
        $establishment->users()->update(['is_active' => false]);
        $this->establishments->delete($establishment);

        return response()->noContent();
    }
}
