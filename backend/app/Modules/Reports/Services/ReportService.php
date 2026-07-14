<?php

namespace App\Modules\Reports\Services;

use App\Models\BenefitUsage;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Establishment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ReportService
{
    public function forEmployee(Employee $employee): array
    {
        return $this->summarize(BenefitUsage::where('employee_id', $employee->id));
    }

    public function forCompany(Company $company): array
    {
        return [
            ...$this->summarize(BenefitUsage::where('company_id', $company->id)),
            'active_employees_count' => $company->employees()->where('benefit_status', 'active')->count(),
            'top_establishments' => $this->topEstablishments(
                BenefitUsage::where('company_id', $company->id),
            ),
        ];
    }

    public function forEstablishment(Establishment $establishment): array
    {
        return [
            ...$this->summarize(BenefitUsage::where('establishment_id', $establishment->id)),
            'unique_companies_count' => BenefitUsage::where('establishment_id', $establishment->id)
                ->distinct('company_id')->count('company_id'),
            'top_companies' => $this->topCompanies(
                BenefitUsage::where('establishment_id', $establishment->id),
            ),
        ];
    }

    public function global(): array
    {
        return [
            ...$this->summarize(BenefitUsage::query()),
            'top_companies' => $this->topCompanies(BenefitUsage::query()),
            'top_establishments' => $this->topEstablishments(BenefitUsage::query()),
        ];
    }

    private function summarize(Builder $query): array
    {
        return [
            'total_usages' => (clone $query)->count(),
            'usages_this_month' => (clone $query)->where('used_at', '>=', Carbon::now()->startOfMonth())->count(),
        ];
    }

    private function topEstablishments(Builder $query, int $limit = 5): array
    {
        $rows = (clone $query)
            ->selectRaw('establishment_id, COUNT(*) as count')
            ->groupBy('establishment_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->with('establishment:id,name')
            ->get();

        return $rows->map(fn ($row) => [
            'name' => $row->establishment?->name ?? '—',
            'count' => (int) $row->count,
        ])->all();
    }

    private function topCompanies(Builder $query, int $limit = 5): array
    {
        $rows = (clone $query)
            ->selectRaw('company_id, MAX(company_name_snapshot) as name, COUNT(*) as count')
            ->groupBy('company_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        return $rows->map(fn ($row) => [
            'name' => $row->name,
            'count' => (int) $row->count,
        ])->all();
    }
}
