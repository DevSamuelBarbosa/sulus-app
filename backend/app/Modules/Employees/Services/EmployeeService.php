<?php

namespace App\Modules\Employees\Services;

use App\Enums\EmployeeStatus;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeService
{
    public function __construct(private readonly EmployeeActivationService $activation) {}

    /**
     * Create the login user (inactive until the employee sets their own
     * password) and the employee profile in a single transaction, then send
     * the activation email once it's committed.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(Company $company, array $data): Employee
    {
        $employee = DB::transaction(function () use ($company, $data) {
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Str::random(40),
                'role' => UserRole::Employee,
                'is_active' => false,
            ]);

            return $company->employees()->create([
                'user_id' => $user->id,
                'full_name' => $data['full_name'],
                'cpf' => $data['cpf'],
                'phone' => $data['phone'] ?? null,
                'hired_at' => $data['hired_at'] ?? null,
                'city_id' => $data['city_id'] ?? null,
                'benefit_status' => EmployeeStatus::Active,
            ]);
        });

        $this->activation->sendInvite($employee->user, $company->trade_name);

        return $employee;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Employee $employee, array $data): Employee
    {
        $employee->update(collect($data)
            ->only(['full_name', 'cpf', 'phone', 'hired_at', 'city_id'])
            ->all());

        // Keep the login user's display name in sync with the profile.
        if (array_key_exists('full_name', $data)) {
            $employee->user()->update(['name' => $data['full_name']]);
        }

        return $employee;
    }

    public function setBenefitStatus(Employee $employee, EmployeeStatus $status): Employee
    {
        $employee->update(['benefit_status' => $status]);

        return $employee;
    }

    /**
     * Store a new photo, replacing any previous one, and persist its path.
     */
    public function storePhoto(Employee $employee, UploadedFile $photo): Employee
    {
        $disk = Storage::disk(config('media.disk'));

        $path = $photo->store(
            "employees/{$employee->company_id}/{$employee->id}/photos",
            config('media.disk'),
        );

        if ($employee->photo_path) {
            $disk->delete($employee->photo_path);
        }

        $employee->update(['photo_path' => $path]);

        return $employee;
    }

    public function delete(Employee $employee): void
    {
        // Soft delete keeps benefit_usages history intact; the login user is
        // deactivated so the account can no longer authenticate.
        DB::transaction(function () use ($employee) {
            $employee->user()->update(['is_active' => false]);
            $employee->delete();
        });
    }

    /**
     * Readmits a previously removed employee. The old password is never
     * reused — it may have leaked or been forgotten during the time off —
     * so this restores the record but sends a fresh activation invite, same
     * as a brand new hire.
     */
    public function restore(Employee $employee): Employee
    {
        DB::transaction(function () use ($employee) {
            $employee->restore();
            $employee->update(['benefit_status' => EmployeeStatus::Active]);
            $employee->user()->update(['is_active' => false]);
        });

        $this->activation->sendInvite($employee->user, $employee->company->trade_name);

        return $employee;
    }
}
