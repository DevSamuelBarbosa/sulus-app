<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\AuthUserResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): AuthUserResource
    {
        return new AuthUserResource($request->user());
    }
}
