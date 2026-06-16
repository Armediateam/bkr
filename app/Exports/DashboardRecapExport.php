<?php

namespace App\Exports;

use App\Models\DailyReportSubmission;
use App\Models\Project;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class DashboardRecapExport implements FromCollection, ShouldAutoSize, WithEvents, WithHeadings, WithTitle
{
    public function __construct(
        private readonly Collection $projects,
        private readonly Collection $reports,
    ) {}

    public function collection(): Collection
    {
        return $this->projects->map(function (Project $project) {
            /** @var Collection<int, DailyReportSubmission> $projectReports */
            $projectReports = $this->reports->get($project->nama_proyek, collect());
            $latestReport = $projectReports->first();

            return collect([
                'project_id' => $project->project_id,
                'nama_proyek' => $project->nama_proyek,
                'product_manager' => $project->product_manager ?? '-',
                'progress' => $project->progress.'%',
                'status_proyek' => $project->status,
                'target_selesai' => $project->target_selesai?->toDateString() ?? '-',
                'jumlah_laporan' => $projectReports->count(),
                'tanggal_laporan_terakhir' => $latestReport?->tanggal?->toDateString() ?? '-',
                'shift_terakhir' => $latestReport?->shift ?? '-',
                'status_laporan_terakhir' => $latestReport?->status ?? '-',
            ]);
        });
    }

    public function headings(): array
    {
        return [
            'ID Proyek',
            'Nama Proyek',
            'Product Manager',
            'Progress',
            'Status Proyek',
            'Target Selesai',
            'Jumlah Laporan',
            'Tanggal Laporan Terakhir',
            'Shift Terakhir',
            'Status Laporan Terakhir',
        ];
    }

    public function title(): string
    {
        return 'Rekap Dashboard';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();
                $tableRange = "A1:{$highestColumn}{$highestRow}";

                $sheet->freezePane('A2');
                $sheet->setAutoFilter("A1:{$highestColumn}1");
                $sheet->getDefaultRowDimension()->setRowHeight(-1);
                $sheet->getStyle($tableRange)->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
                $sheet->getStyle($tableRange)->getAlignment()->setWrapText(true);

                $sheet->getStyle("A1:{$highestColumn}1")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1F4E78'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle($tableRange)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'D9E2F3'],
                        ],
                    ],
                ]);

                $sheet->getStyle("D2:D{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("G2:G{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("H2:H{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("I2:I{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            },
        ];
    }
}
