<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDailyReportRequest;
use App\Models\DailyReportSubmission;
use App\Models\Project;
use App\Support\DailyReportPayloadStorage;
use App\Support\DailyReportTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductManagerReportController extends Controller
{
    public function index(Request $request, DailyReportTransformer $transformer): Response
    {
        $projects = Project::query()
            ->select(['nama_proyek', 'progress'])
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
                'payload',
                'created_at',
            ])
            ->where('submitted_by', $request->user()->id)
            ->with('user:id,name')
            ->latest('tanggal')
            ->latest('created_at')
            ->get();

        return Inertia::render('product-manager/laporan', [
            'reports' => $reports->map(
                fn (DailyReportSubmission $report) => $transformer->toTableRow($report)
            ),
            'reportDetails' => $reports->mapWithKeys(
                fn (DailyReportSubmission $report) => [
                    $report->report_id => $transformer->toDetailContent($report),
                ]
            ),
            'projectOptions' => $projects
                ->pluck('nama_proyek')
                ->all(),
            'projectProgressMap' => $projects
                ->pluck('progress', 'nama_proyek')
                ->all(),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(StoreDailyReportRequest $request, DailyReportPayloadStorage $payloadStorage): RedirectResponse
    {
        $validated = $request->validated();
        $payload = $payloadStorage->build($request, $validated);

        $project = Project::query()
            ->where('nama_proyek', $validated['namaProyek'])
            ->firstOrFail();

        $project->progress = (int) $validated['progress'];

        if ($request->user()?->role === 'product_manager') {
            $project->product_manager = $request->user()->name;
        }

        $project->save();

        DailyReportSubmission::create([
            'submitted_by' => $request->user()->id,
            'report_id' => 'LHR-'.now()->format('ymd').'-'.Str::upper(Str::random(4)),
            'tanggal' => $validated['tanggal'],
            'nama_proyek' => $validated['namaProyek'],
            'shift' => $validated['shift'],
            'status' => 'Submitted',
            'payload' => $payload,
        ]);

        return redirect()
            ->route('product-manager.laporan')
            ->with('success', 'Laporan harian berhasil dikirim.');
    }
}
