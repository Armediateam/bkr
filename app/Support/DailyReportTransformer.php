<?php

namespace App\Support;

use App\Models\DailyReportSubmission;

class DailyReportTransformer
{
    public function toTableRow(DailyReportSubmission $report): array
    {
        $payload = $report->payload ?? [];

        return [
            'id' => $report->report_id,
            'tanggal' => $report->tanggal->toDateString(),
            'nota' => $report->report_id,
            'namaProyek' => $report->nama_proyek,
            'shift' => $report->shift,
            'progress' => $this->resolveProgress($payload, $report->shift),
            'jumlahTukangHariIni' => $this->formatWorkerCount($payload['jumlahTukangHariIni'] ?? null),
            'namaTukangIzinPagi' => $this->implodeList($payload['namaTukangIzinPagi'] ?? []),
            'teleponKepalaTukangPagi' => $payload['teleponKepalaTukangPagi'] ?? 'BELUM',
            'catatanKepalaTukangPagi' => $payload['catatanKepalaTukangPagi'] ?? '-',
            'prakiraanCuaca' => $payload['prakiraanCuaca'] ?? '-',
            'pekerjaanUtamaHariIni' => $payload['pekerjaanUtamaHariIni'] ?? '-',
            'rencanaPekerjaanHariIni' => $this->summarizeRows($payload['rencanaPekerjaanHariIni'] ?? [], 'itemPekerjaan'),
            'rencanaMaterialHariIni' => $payload['rencanaMaterialHariIni'] ?? '-',
            'materialDatangHariIni' => $this->summarizeIncomingMaterials($payload['materialDatangHariIni'] ?? []),
            'cctvJam8' => $this->formatUploadValue($payload['cctvJam8'] ?? null),
            'tukangSakitSetengahHari' => $this->nullableText($payload['tukangSakitSetengahHari'] ?? null),
            'namaTukangIzinSiang' => $this->implodeList($payload['namaTukangIzinSiang'] ?? []),
            'teleponKepalaTukangSiang' => $payload['teleponKepalaTukangSiang'] ?? 'BELUM',
            'catatanKepalaTukangSiang' => $payload['catatanKepalaTukangSiang'] ?? '-',
            'statusPekerjaanSiang' => $this->summarizeRows($payload['statusPekerjaanSiang'] ?? [], 'status'),
            'penyebabPekerjaanSiang' => $this->summarizeRows($payload['statusPekerjaanSiang'] ?? [], 'penyebab'),
            'statusMaterialDatangSiang' => $this->summarizeRows($payload['statusMaterialDatangSiang'] ?? [], 'status'),
            'uploadSuratJalan' => $this->countUploads($payload['statusMaterialDatangSiang'] ?? [], 'suratJalan'),
            'teleponMaterialLusa' => $payload['teleponMaterialLusa'] ?? 'BELUM',
            'kebutuhanMaterialLusa' => $this->summarizeRows($payload['kebutuhanMaterialLusa'] ?? [], 'material'),
            'cctvJam10' => $this->formatUploadValue($payload['cctvJam10'] ?? null),
            'cctvJam12' => $this->formatUploadValue($payload['cctvJam12'] ?? null),
            'teleponKepalaTukangSore' => $payload['teleponKepalaTukangSore'] ?? 'BELUM',
            'catatanKepalaTukangSore' => $payload['catatanKepalaTukangSore'] ?? '-',
            'statusPekerjaanSore' => $payload['statusPekerjaanSore'] ?? '-',
            'uploadFotoHasil' => $this->formatUploadValue($payload['uploadFotoHasil'] ?? null),
            'penyebabPekerjaanSore' => $payload['penyebabPekerjaanSore'] ?? '-',
            'orderMaterialSiang' => $payload['orderMaterialSiang'] ?? 'BELUM',
            'materialHarga' => $this->summarizeRows($payload['materialHarga'] ?? [], 'namaBahan'),
            'fotoNota' => $this->formatUploadValue($payload['fotoNota'] ?? null),
            'kendalaKerjaHariIni' => $payload['kendalaKerjaHariIni'] ?? '-',
            'targetUtamaBesok' => $payload['targetUtamaBesok'] ?? '-',
            'statusMaterialBesok' => $payload['statusMaterialBesok'] ?? '-',
            'cctvJam14' => $this->formatUploadValue($payload['cctvJam14'] ?? null),
            'cctvJam16' => $this->formatUploadValue($payload['cctvJam16'] ?? null),
            'rincianPengeluaranKas' => $this->summarizeRows($payload['rincianPengeluaranKas'] ?? [], 'namaBahan'),
            'kasbonTukang' => $this->summarizeRows($payload['kasbonTukang'] ?? [], 'namaTukang'),
            'status' => $report->status,
            'productManager' => $report->user?->name ?? '-',
        ];
    }

    public function toDetailContent(DailyReportSubmission $report): array
    {
        $payload = $report->payload ?? [];

        return [
            'pagi' => [
                'namaTukangIzin' => $this->normalizeStringList($payload['namaTukangIzinPagi'] ?? []),
                'rencanaPekerjaan' => $this->normalizeRows(
                    $payload['rencanaPekerjaanHariIni'] ?? [],
                    ['itemPekerjaan', 'volume', 'jumlahPekerja'],
                ),
                'materialDatang' => $this->normalizeRows(
                    $payload['materialDatangHariIni'] ?? [],
                    ['material', 'jumlah', 'satuan', 'eta'],
                ),
            ],
            'siang' => [
                'namaTukangIzin' => $this->normalizeStringList($payload['namaTukangIzinSiang'] ?? []),
                'statusPekerjaan' => $this->normalizeRows(
                    $payload['statusPekerjaanSiang'] ?? [],
                    ['itemPekerjaan', 'status', 'penyebab'],
                ),
                'statusMaterial' => $this->normalizeRows(
                    $payload['statusMaterialDatangSiang'] ?? [],
                    ['material', 'status', 'suratJalan'],
                    ['suratJalan'],
                ),
                'kebutuhanMaterial' => $this->normalizeRows(
                    $payload['kebutuhanMaterialLusa'] ?? [],
                    ['material', 'jumlah', 'satuan'],
                ),
            ],
            'sore' => [
                'materialDibeli' => $this->normalizeRows(
                    $payload['materialHarga'] ?? [],
                    ['namaBahan', 'jumlah', 'hargaSatuan', 'hargaJumlah'],
                ),
            ],
            'finance' => [
                'rincianKas' => $this->normalizeRows(
                    $payload['rincianPengeluaranKas'] ?? [],
                    ['namaBahan', 'jumlah', 'hargaSatuan', 'hargaJumlah'],
                ),
                'fotoNota' => $this->formatUploadValue($payload['financeFotoNota'] ?? null),
                'kasbon' => $this->normalizeRows(
                    $payload['kasbonTukang'] ?? [],
                    ['namaTukang', 'jumlahKasbon'],
                ),
            ],
        ];
    }

    private function progressForShift(string $shift): int
    {
        return match ($shift) {
            'Pagi' => 33,
            'Siang' => 66,
            'Sore' => 100,
            default => 0,
        };
    }

    private function resolveProgress(array $payload, string $shift): int
    {
        $progress = $payload['progress'] ?? null;

        if (is_numeric($progress)) {
            return max(0, min(100, (int) $progress));
        }

        return $this->progressForShift($shift);
    }

    private function formatWorkerCount(?string $value): string
    {
        return filled($value) ? "{$value} orang" : '-';
    }

    private function implodeList(array $values): string
    {
        $items = collect($values)
            ->filter(fn ($value) => filled($value))
            ->values();

        return $items->isEmpty() ? '-' : $items->join(', ');
    }

    private function summarizeRows(array $rows, string $key): string
    {
        $items = collect($rows)
            ->map(fn ($row) => is_array($row) ? ($row[$key] ?? null) : null)
            ->filter(fn ($value) => filled($value))
            ->values();

        return $items->isEmpty() ? '-' : $items->join(' | ');
    }

    private function summarizeIncomingMaterials(array $rows): string
    {
        $items = collect($rows)
            ->map(function ($row) {
                if (! is_array($row) || blank($row['material'] ?? null)) {
                    return null;
                }

                $summary = $row['material'];

                if (filled($row['jumlah'] ?? null)) {
                    $summary .= ' '.$row['jumlah'];
                }

                if (filled($row['satuan'] ?? null)) {
                    $summary .= ' '.$row['satuan'];
                }

                if (filled($row['eta'] ?? null)) {
                    $summary .= ' | ETA '.$row['eta'];
                }

                return $summary;
            })
            ->filter()
            ->values();

        return $items->isEmpty() ? '-' : $items->join(' | ');
    }

    private function countUploads(array $rows, string $key): string
    {
        $count = collect($rows)
            ->filter(fn ($row) => is_array($row) && filled($row[$key] ?? null))
            ->count();

        return $count > 0 ? "{$count} foto" : '-';
    }

    private function formatUploadValue(mixed $value): string
    {
        return filled($value) ? '1 foto' : '-';
    }

    private function nullableText(mixed $value): string
    {
        return filled($value) ? (string) $value : '-';
    }

    private function normalizeStringList(array $values): array
    {
        $items = collect($values)
            ->map(fn ($value) => filled($value) ? (string) $value : '-')
            ->values();

        return $items->isEmpty()
            ? ['-', '-', '-']
            : $items->pad(3, '-')->take(3)->all();
    }

    private function normalizeRows(array $rows, array $keys, array $uploadKeys = []): array
    {
        $items = collect($rows)
            ->filter(fn ($row) => is_array($row))
            ->map(function ($row) use ($keys, $uploadKeys) {
                $normalized = [];

                foreach ($keys as $key) {
                    $value = $row[$key] ?? null;
                    $normalized[$key] = in_array($key, $uploadKeys, true)
                        ? $this->formatUploadValue($value)
                        : (filled($value) ? (string) $value : '-');
                }

                return $normalized;
            })
            ->filter(fn (array $row) => collect($row)->contains(fn ($value) => $value !== '-'))
            ->values();

        if ($items->isNotEmpty()) {
            return $items->all();
        }

        return [collect($keys)->mapWithKeys(fn ($key) => [$key => '-'])->all()];
    }
}
