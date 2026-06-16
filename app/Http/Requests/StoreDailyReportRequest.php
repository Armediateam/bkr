<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDailyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date', 'after_or_equal:today'],
            'namaProyek' => ['required', 'string', 'max:255', Rule::exists('projects', 'nama_proyek')],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            'shift' => ['required', 'in:Pagi,Siang,Sore'],
            'jumlahTukangHariIni' => ['nullable', 'string', 'max:255'],
            'namaTukangIzinPagi' => ['array'],
            'namaTukangIzinPagi.*' => ['nullable', 'string', 'max:255'],
            'teleponKepalaTukangPagi' => ['nullable', 'in:YA,BELUM'],
            'catatanKepalaTukangPagi' => ['nullable', 'string'],
            'prakiraanCuaca' => ['nullable', 'string', 'max:255'],
            'pekerjaanUtamaHariIni' => ['nullable', 'string', 'max:255'],
            'rencanaPekerjaanHariIni' => ['array'],
            'rencanaPekerjaanHariIni.*.itemPekerjaan' => ['nullable', 'string', 'max:255'],
            'rencanaPekerjaanHariIni.*.volume' => ['nullable', 'string', 'max:255'],
            'rencanaPekerjaanHariIni.*.jumlahPekerja' => ['nullable', 'string', 'max:255'],
            'rencanaMaterialHariIni' => ['nullable', 'string'],
            'materialDatangHariIni' => ['array'],
            'materialDatangHariIni.*.material' => ['nullable', 'string', 'max:255'],
            'materialDatangHariIni.*.jumlah' => ['nullable', 'string', 'max:255'],
            'materialDatangHariIni.*.satuan' => ['nullable', 'string', 'max:255'],
            'materialDatangHariIni.*.eta' => ['nullable', 'string', 'max:255'],
            'cctvJam8' => ['nullable', 'image', 'max:4096'],
            'tukangSakitSetengahHari' => ['nullable', 'string', 'max:255'],
            'namaTukangIzinSiang' => ['array'],
            'namaTukangIzinSiang.*' => ['nullable', 'string', 'max:255'],
            'teleponKepalaTukangSiang' => ['nullable', 'in:YA,BELUM'],
            'catatanKepalaTukangSiang' => ['nullable', 'string'],
            'statusPekerjaanSiang' => ['array'],
            'statusPekerjaanSiang.*.itemPekerjaan' => ['nullable', 'string', 'max:255'],
            'statusPekerjaanSiang.*.status' => ['nullable', 'string', 'max:255'],
            'statusPekerjaanSiang.*.penyebab' => ['nullable', 'string'],
            'statusMaterialDatangSiang' => ['array'],
            'statusMaterialDatangSiang.*.material' => ['nullable', 'string', 'max:255'],
            'statusMaterialDatangSiang.*.status' => ['nullable', 'string', 'max:255'],
            'statusMaterialDatangSiang.*.suratJalan' => ['nullable', 'image', 'max:4096'],
            'teleponMaterialLusa' => ['nullable', 'in:YA,BELUM'],
            'kebutuhanMaterialLusa' => ['array'],
            'kebutuhanMaterialLusa.*.material' => ['nullable', 'string', 'max:255'],
            'kebutuhanMaterialLusa.*.jumlah' => ['nullable', 'string', 'max:255'],
            'kebutuhanMaterialLusa.*.satuan' => ['nullable', 'string', 'max:255'],
            'cctvJam10' => ['nullable', 'image', 'max:4096'],
            'cctvJam12' => ['nullable', 'image', 'max:4096'],
            'teleponKepalaTukangSore' => ['nullable', 'in:YA,BELUM'],
            'catatanKepalaTukangSore' => ['nullable', 'string'],
            'statusPekerjaanSore' => ['nullable', 'string', 'max:255'],
            'uploadFotoHasil' => ['nullable', 'image', 'max:4096'],
            'penyebabPekerjaanSore' => ['nullable', 'string'],
            'orderMaterialSiang' => ['nullable', 'in:YA,BELUM'],
            'materialHarga' => ['array'],
            'materialHarga.*.namaBahan' => ['nullable', 'string', 'max:255'],
            'materialHarga.*.jumlah' => ['nullable', 'string', 'max:255'],
            'materialHarga.*.hargaSatuan' => ['nullable', 'string', 'max:255'],
            'materialHarga.*.hargaJumlah' => ['nullable', 'string', 'max:255'],
            'fotoNota' => ['nullable', 'image', 'max:4096'],
            'kendalaKerjaHariIni' => ['nullable', 'string'],
            'targetUtamaBesok' => ['nullable', 'string', 'max:255'],
            'statusMaterialBesok' => ['nullable', 'string', 'max:255'],
            'cctvJam14' => ['nullable', 'image', 'max:4096'],
            'cctvJam16' => ['nullable', 'image', 'max:4096'],
            'rincianPengeluaranKas' => ['array'],
            'rincianPengeluaranKas.*.namaBahan' => ['nullable', 'string', 'max:255'],
            'rincianPengeluaranKas.*.jumlah' => ['nullable', 'string', 'max:255'],
            'rincianPengeluaranKas.*.hargaSatuan' => ['nullable', 'string', 'max:255'],
            'rincianPengeluaranKas.*.hargaJumlah' => ['nullable', 'string', 'max:255'],
            'financeFotoNota' => ['nullable', 'image', 'max:4096'],
            'kasbonTukang' => ['array'],
            'kasbonTukang.*.namaTukang' => ['nullable', 'string', 'max:255'],
            'kasbonTukang.*.jumlahKasbon' => ['nullable', 'string', 'max:255'],
        ];
    }
}
