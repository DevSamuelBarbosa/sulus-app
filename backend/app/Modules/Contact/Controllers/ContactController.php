<?php

namespace App\Modules\Contact\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ContactRequestMail;
use App\Modules\Contact\Requests\StoreContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Public lead form ("Cadastre-se" on the login screen) — companies and
     * establishments interested in the platform aren't self-registered;
     * this just emails the sales team, who follow up and create the
     * account manually (see Admin\Controllers\CompanyController).
     */
    public function __invoke(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();

        Mail::to(config('mail.sales_address'))->send(new ContactRequestMail(
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['company_name'] ?? null,
            $data['message'] ?? null,
        ));

        return response()->json([
            'message' => 'Recebemos seu contato! Nosso time vai falar com você em breve.',
        ]);
    }
}
