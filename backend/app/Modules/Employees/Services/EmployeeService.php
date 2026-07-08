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

class EmployeeService
{
    /**
     * Create the login user and the employee profile in a single transaction.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(Company $company, array $data): Employee
    {
        return DB::transaction(function () use ($company, $data) {
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Employee,
                'is_active' => true,
            ]);

            return $company->employees()->create([
                'user_id' => $user->id,
                'full_name' => $data['full_name'],
                'cpf' => $data['cpf'],
                'phone' => $data['phone'] ?? null,
                'hired_at' => $data['hired_at'] ?? null,
                'benefit_status' => EmployeeStatus::Active,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Employee $employee, array $data): Employee
    {
        $employee->update(collect($data)
            ->only(['full_name', 'cpf', 'phone', 'hired_at'])
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

        $path = $photo->store('employees/photos', config('media.disk'));

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
}
