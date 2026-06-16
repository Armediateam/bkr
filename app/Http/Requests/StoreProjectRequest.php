<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'namaProyek' => ['required', 'string', 'max:255', 'unique:projects,nama_proyek'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'client' => ['nullable', 'string', 'max:255'],
            'productManager' => ['nullable', 'string', 'max:255'],
            'targetSelesai' => ['nullable', 'date'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['required', 'in:Aktif,Perencanaan,Selesai,Tertunda'],
            'nilaiKontrak' => ['nullable', 'string', 'max:255'],
        ];
    }
}
