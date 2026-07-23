<?php

namespace App\Modules\Companies\Services;

use App\Models\Company;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CompanyService
{
    /**
     * Creates only the company profile — logins are created separately via
     * App\Modules\Auth\Services\TenantUserService (the first one created
     * becomes the tenant's Master automatically). The logo is optional and,
     * once set, can only be changed by an admin (see updateLogo()) — the
     * tenant's own self-service profile never exposes this field.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Company
    {
        $company = Company::create([
            'legal_name' => $data['legal_name'],
            'trade_name' => $data['trade_name'] ?? null,
            'cnpj' => $data['cnpj'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['contact_email'] ?? null,
            'cep' => $data['cep'] ?? null,
            'logradouro' => $data['logradouro'] ?? null,
            'numero' => $data['numero'] ?? null,
            'complemento' => $data['complemento'] ?? null,
            'bairro' => $data['bairro'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        if (isset($data['logo'])) {
            $this->updateLogo($company, $data['logo']);
        }

        return $company;
    }

    /**
     * Replaces the company's logo, deleting the previous file if present.
     * Admin-only (see routes/api/admin.php) — mirrors EmployeeService::storePhoto().
     */
    public function updateLogo(Company $company, UploadedFile $logo): Company
    {
        $disk = Storage::disk(config('media.disk'));

        $path = $logo->store("companies/{$company->id}/logos", config('media.disk'));

        if ($company->logo_path) {
            $disk->delete($company->logo_path);
        }

        $company->update(['logo_path' => $path]);

        return $company;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Company $company, array $data): Company
    {
        if (array_key_exists('contact_email', $data)) {
            $data['email'] = $data['contact_email'];
        }

        $company->update(collect($data)
            ->only([
                'legal_name', 'trade_name', 'cnpj', 'phone', 'email',
                'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'city_id', 'is_active',
            ])
            ->all());

        return $company;
    }

    /**
     * Deactivates every login of the tenant before soft-deleting the company
     * — a deleted company can't be left with working logins (EnsureRole
     * rejects requests from an inactive user, and AuthService::login()
     * blocks new sessions the same way).
     */
    public function delete(Company $company): void
    {
        DB::transaction(function () use ($company) {
            $company->users()->update(['is_active' => false]);
            $company->delete();
        });
    }
}
