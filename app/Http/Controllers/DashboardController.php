<?php

namespace App\Http\Controllers;

use App\Exports\DashboardRecapExport;
use App\Models\DailyReportSubmission;
use App\Models\Project;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $projects = Project::query()
            ->select([
                'project_id',
                'nama_proyek',
                'product_manager',
                'target_selesai',
                'progress',
                'status',
            ])
            ->orderBy('nama_proyek')
            ->get();

        $reports = DailyReportSubmission::query()
            ->select([
                'report_id',
                'submitted_by',
                'tanggal',
                'nama_proyek',
                'shift',
                'status',
                'created_at',
            ])
            ->with('user:id,name')
            ->latest('tanggal')
            ->latest('created_at')
            ->get();

        $reportsByProject = $reports->groupBy('nama_proyek');
        $reportsTodayCount = $reports->where('tanggal', now()->toDateString())->count();
        $averageProgress = $projects->isEmpty()
            ? 0
            : (int) round($projects->avg('progress'));

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProjects' => $projects->count(),
                'activeProjects' => $projects->where('status', 'Aktif')->count(),
                'delayedProjects' => $projects->where('status', 'Tertunda')->count(),
                'completedProjects' => $projects->where('status', 'Selesai')->count(),
                'totalReports' => $reports->count(),
                'reportsToday' => $reportsTodayCount,
                'averageProgress' => $averageProgress,
            ],
            'statusBreakdown' => [
                ['label' => 'Aktif', 'value' => $projects->where('status', 'Aktif')->count()],
                ['label' => 'Perencanaan', 'value' => $projects->where('status', 'Perencanaan')->count()],
                ['label' => 'Selesai', 'value' => $projects->where('status', 'Selesai')->count()],
                ['label' => 'Tertunda', 'value' => $projects->where('status', 'Tertunda')->count()],
            ],
            'recentReports' => $reports
                ->take(8)
                ->map(fn (DailyReportSubmission $report) => [
                    'id' => $report->report_id,
                    'tanggal' => $report->tanggal->toDateString(),
                    'namaProyek' => $report->nama_proyek,
                    'shift' => $report->shift,
                    'status' => $report->status,
                    'productManager' => $report->user?->name ?? '-',
                ])
                ->values(),
            'projectRecap' => $projects
                ->map(function (Project $project) use ($reportsByProject) {
                    /** @var Collection<int, DailyReportSubmission> $projectReports */
                    $projectReports = $reportsByProject->get($project->nama_proyek, collect());
                    $latestReport = $projectReports->first();

                    return [
                        'id' => $project->project_id,
                        'namaProyek' => $project->nama_proyek,
                        'productManager' => $project->product_manager ?? '-',
                        'progress' => $project->progress,
                        'status' => $project->status,
                        'targetSelesai' => $project->target_selesai?->toDateString() ?? '-',
                        'reportCount' => $projectReports->count(),
                        'lastReportDate' => $latestReport?->tanggal?->toDateString() ?? '-',
                        'lastShift' => $latestReport?->shift ?? '-',
                    ];
                })
                ->sortByDesc('progress')
                ->values(),
        ]);
    }

    public function export(): BinaryFileResponse
    {
        $projects = Project::query()
            ->select([
                'project_id',
                'nama_proyek',
                'product_manager',
                'target_selesai',
                'progress',
                'status',
            ])
            ->orderBy('nama_proyek')
            ->get();

        $reports = DailyReportSubmission::query()
            ->select([
                'tanggal',
                'nama_proyek',
                'shift',
                'status',
            ])
            ->latest('tanggal')
            ->latest('created_at')
            ->get()
            ->groupBy('nama_proyek');

        return Excel::download(
            new DashboardRecapExport($projects, $reports),
            'rekap-dashboard-owner-'.now()->format('Ymd-His').'.xlsx'
        );
    }
}
