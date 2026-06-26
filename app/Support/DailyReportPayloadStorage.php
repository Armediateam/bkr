<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class DailyReportPayloadStorage
{
    private const DIRECT_UPLOAD_FIELDS = [
        'cctvJam8',
        'cctvJam10',
        'cctvJam12',
        'uploadFotoHasil',
        'fotoNota',
        'cctvJam14',
        'cctvJam16',
        'financeFotoNota',
    ];

    public function build(Request $request, array $validated): array
    {
        $payload = $validated;

        foreach (self::DIRECT_UPLOAD_FIELDS as $field) {
            if ($request->hasFile($field)) {
                $payload[$field] = $this->storeImage($request->file($field), $field);
            }
        }

        $payload['statusMaterialDatangSiang'] = $this->storeStatusMaterialUploads(
            $payload['statusMaterialDatangSiang'] ?? [],
            $request->file('statusMaterialDatangSiang', []),
        );

        return $payload;
    }

    private function storeStatusMaterialUploads(array $rows, array $uploadedRows): array
    {
        foreach ($rows as $index => $row) {
            if (isset($uploadedRows[$index]['suratJalan'])) {
                $rows[$index]['suratJalan'] = $this->storeImage(
                    $uploadedRows[$index]['suratJalan'],
                    'surat-jalan',
                );
            }
        }

        return $rows;
    }

    private function storeImage(UploadedFile $file, string $folder): string
    {
        try {
            return $file->store("daily-reports/{$folder}", 'public');
        } catch (\Exception $e) {
            logger()->error("Failed to store daily report image in {$folder}: " . $e->getMessage());

            throw ValidationException::withMessages([
                'upload_error' => 'Gagal mengunggah gambar. Pastikan folder storage di hosting/server Anda memiliki izin menulis (writable).',
            ]);
        }
    }
}
