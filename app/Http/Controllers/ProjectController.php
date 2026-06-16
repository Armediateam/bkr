<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('proyek', [
            'projects' => Project::query()
                ->select([
                    'project_id',
                    'nama_proyek',
                    'lokasi',
                    'client',
                    'product_manager',
                    'target_selesai',
                    'progress',
                    'status',
                    'nilai_kontrak',
                ])
                ->orderBy('nama_proyek')
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->project_id,
                    'namaProyek' => $project->nama_proyek,
                    'lokasi' => $project->lokasi ?? '-',
                    'client' => $project->client ?? '-',
                    'productManager' => $project->product_manager ?? '-',
                    'targetSelesai' => $project->target_selesai?->toDateString() ?? '-',
                    'progress' => $project->progress,
                    'status' => $project->status,
                    'nilaiKontrak' => $project->nilai_kontrak ?? '-',
                ]),
            'productManagers' => User::query()
                ->where('role', 'product_manager')
                ->orderBy('name')
                ->pluck('name')
                ->all(),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Project::create([
            'project_id' => $this->generateProjectId(),
            'nama_proyek' => $validated['namaProyek'],
            'lokasi' => $validated['lokasi'] ?? null,
            'client' => $validated['client'] ?? null,
            'product_manager' => $validated['productManager'] ?? null,
            'target_selesai' => $validated['targetSelesai'] ?? null,
            'progress' => $validated['progress'] ?? 0,
            'status' => $validated['status'],
            'nilai_kontrak' => $validated['nilaiKontrak'] ?? null,
        ]);

        return redirect()
            ->route('proyek')
            ->with('success', 'Proyek berhasil ditambahkan.');
    }

    private function generateProjectId(): string
    {
        do {
            $projectId = 'PRJ-'.now()->format('ymd').'-'.Str::upper(Str::random(3));
        } while (Project::query()->where('project_id', $projectId)->exists());

        return $projectId;
    }
}
