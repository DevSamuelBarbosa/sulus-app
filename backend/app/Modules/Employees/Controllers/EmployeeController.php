<?php

namespace App\Modules\Employees\Controllers;

use App\Enums\EmployeeStatus;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Modules\Employees\Requests\StoreEmployeeRequest;
use App\Modules\Employees\Requests\UpdateEmployeeRequest;
use App\Modules\Employees\Requests\UploadEmployeePhotoRequest;
use App\Modules\Employees\Resources\EmployeeResource;
use App\Modules\Employees\Services\EmployeeService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class EmployeeController extends Controller
{
    public function __construct(private readonly EmployeeService $employees) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:active,cancelled,removed'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $status = $validated['status'] ?? null;
        $query = $this->company($request)->employees();

        // "Removed" employees are soft-deleted — excluded from every other
        // status by Eloquent's default scope, only visible via this filter.
        if ($status === 'removed') {
            $query->onlyTrashed();
        }

        $employees = $query
            ->with(['user:id,email', 'city.state'])
            ->when($validated['search'] ?? null, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('cpf', 'like', "%{$search}%");
            }))
            ->when(
                $status && $status !== 'removed',
                fn ($q) => $q->where('benefit_status', $status),
            )
            ->when($validated['city_id'] ?? null, fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when(
                $validated['state_id'] ?? null,
                fn ($q, $stateId) => $q->whereHas('city', fn ($q) => $q->where('state_id', $stateId)),
            )
            ->orderBy('full_name')
            ->paginate($validated['per_page'] ?? 15);

        return EmployeeResource::collection($employees);
    }

    public function store(StoreEmployeeRequest $request): EmployeeResource
    {
        $employee = $this->employees->create($this->company($request), $request->validated());

        return new EmployeeResource($employee->load(['user:id,email', 'city.state']));
    }

    public function show(Request $request, int $employee): EmployeeResource
    {
        return new EmployeeResource($this->find($request, $employee)->load(['user:id,email', 'city.state']));
    }

    public function update(UpdateEmployeeRequest $request, int $employee): EmployeeResource
    {
        $model = $this->find($request, $employee);
        $this->employees->update($model, $request->validated());

        return new EmployeeResource($model->load(['user:id,email', 'city.state']));
    }

    public function destroy(Request $request, int $employee): Response
    {
        $this->employees->delete($this->find($request, $employee));

        return response()->noContent();
    }

    /**
     * Readmits a previously removed employee — restores the record and sends
     * a fresh activation invite (the old password is never reused, see
     * EmployeeService::restore).
     */
    public function restore(Request $request, int $employee): EmployeeResource
    {
        $model = $this->company($request)->employees()->onlyTrashed()->findOrFail($employee);
        $this->employees->restore($model);

        return new EmployeeResource($model->fresh()->load(['user:id,email', 'city.state']));
    }

    public function cancelBenefit(Request $request, int $employee): EmployeeResource
    {
        $model = $this->employees->setBenefitStatus(
            $this->find($request, $employee),
            EmployeeStatus::Cancelled,
        );

        return new EmployeeResource($model->load(['user:id,email', 'city.state']));
    }

    public function reactivateBenefit(Request $request, int $employee): EmployeeResource
    {
        $model = $this->employees->setBenefitStatus(
            $this->find($request, $employee),
            EmployeeStatus::Active,
        );

        return new EmployeeResource($model->load(['user:id,email', 'city.state']));
    }

    public function uploadPhoto(UploadEmployeePhotoRequest $request, int $employee): EmployeeResource
    {
        $model = $this->employees->storePhoto(
            $this->find($request, $employee),
            $request->file('photo'),
        );

        return new EmployeeResource($model->load(['user:id,email', 'city.state']));
    }

    /**
     * The company profile owned by the authenticated user.
     */
    private function company(Request $request): Company
    {
        return $request->user()->company;
    }

    /**
     * Resolve an employee scoped to the authenticated company (prevents IDOR).
     */
    private function find(Request $request, int $employee): Employee
    {
        return $this->company($request)->employees()->findOrFail($employee);
    }
}
