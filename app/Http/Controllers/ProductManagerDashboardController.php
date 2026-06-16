<?php

namespace App\Http\Controllers;

use App\Models\DailyReportSubmission;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductManagerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('product-manager/dashboard', [
            'stats' => [
                'totalReports' => DailyReportSubmission::query()
                    ->where('submitted_by', $user->id)
                    ->count(),
                'reportsThisMonth' => DailyReportSubmission::query()
                    ->where('submitted_by', $user->id)
                    ->whereBetween('tanggal', [
                        now()->startOfMonth()->toDateString(),
                        now()->endOfMonth()->toDateString(),
                    ])
                    ->count(),
                'assignedProjects' => Project::query()
                    ->where('product_manager', $user->name)
                    ->count(),
                'latestReportDate' => DailyReportSubmission::query()
                    ->where('submitted_by', $user->id)
                    ->latest('tanggal')
                    ->value('tanggal'),
            ],
        ]);
    }
}
