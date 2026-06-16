<?php

namespace App\Http\Controllers;

use App\Models\DailyReportSubmission;
use App\Support\DailyReportTransformer;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function index(DailyReportTransformer $transformer): Response
    {
        $reports = DailyReportSubmission::query()
            ->select([
                'report_id',
                'submitted_by',
                'tanggal',
                'nama_proyek',
                'shift',
                'status',
                'payload',
                'created_at',
            ])
            ->with('user:id,name')
            ->latest('tanggal')
            ->latest('created_at')
            ->get();

        return Inertia::render('laporan', [
            'reports' => $reports->map(
                fn (DailyReportSubmission $report) => $transformer->toTableRow($report)
            ),
            'reportDetails' => $reports
                ->mapWithKeys(fn (DailyReportSubmission $report) => [
                    $report->report_id => $transformer->toDetailContent($report),
                ]),
        ]);
    }
}
