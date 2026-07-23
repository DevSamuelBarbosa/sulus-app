<?php

namespace App\Modules\Establishments\Services;

use App\Models\Establishment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EstablishmentService
{
    /**
     * Creates only the establishment profile — logins are created separately
     * via App\Modules\Auth\Services\TenantUserService (the first one created
     * becomes the tenant's Master automatically). The logo is optional and,
     * once set, can only be changed by an admin (see updateLogo()) — the
     * tenant's own self-service profile never exposes this field.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Establishment
    {
        return Establishment::create([
            'name' => $data['name'],
            'cnpj' => $data['cnpj'],
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'] ?? null,
            'phone' => $data['phone'] ?? null,
            'cep' => $data['cep'] ?? null,
            'logradouro' => $data['logradouro'] ?? null,
            'numero' => $data['numero'] ?? null,
            'complemento' => $data['complemento'] ?? null,
            'bairro' => $data['bairro'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'logo_path' => isset($data['logo']) ? $data['logo']->store('establishments/logos', config('media.disk')) : null,
        ]);
    }

    /**
     * Replaces the establishment's logo, deleting the previous file if present.
     * Admin-only (see routes/api/admin.php) — mirrors EmployeeService::storePhoto().
     */
    public function updateLogo(Establishment $establishment, UploadedFile $logo): Establishment
    {
        $disk = Storage::disk(config('media.disk'));

        $path = $logo->store('establishments/logos', config('media.disk'));

        if ($establishment->logo_path) {
            $disk->delete($establishment->logo_path);
        }

        $establishment->update(['logo_path' => $path]);

        return $establishment;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Establishment $establishment, array $data): Establishment
    {
        $establishment->update(collect($data)
            ->only([
                'name', 'cnpj', 'category_id', 'description', 'phone',
                'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'city_id', 'is_active',
            ])
            ->all());

        return $establishment;
    }

    /**
     * Deactivates every login of the tenant before soft-deleting the
     * establishment — a deleted establishment can't be left with working
     * logins (EnsureRole rejects requests from an inactive user, and
     * AuthService::login() blocks new sessions the same way).
     */
    public function delete(Establishment $establishment): void
    {
        DB::transaction(function () use ($establishment) {
            $establishment->users()->update(['is_active' => false]);
            $establishment->delete();
        });
    }
}
