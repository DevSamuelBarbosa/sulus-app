<?php

namespace App\Modules\Localization\Controllers;

use App\Http\Controllers\Controller;
use App\Models\State;
use App\Modules\Localization\Resources\StateResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StateController extends Controller
{
    /**
     * List all Brazilian states (UFs), ordered by name.
     */
    public function index(): AnonymousResourceCollection
    {
        return StateResource::collection(
            State::orderBy('name')->get()
        );
    }
}
