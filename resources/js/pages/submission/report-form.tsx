import { Head, useForm, usePage } from '@inertiajs/react';
import { format, parseISO, startOfDay } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { CalendarIcon, Plus, Send, Trash2, Upload, X, FileImage } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ProjectOptionProps = {
    projectOptions: string[];
    projectProgressMap: Record<string, number>;
    today: string;
    flash: {
        success?: string | null;
    };
};

type TripleRow = {
    itemPekerjaan?: string;
    volume?: string;
    jumlahPekerja?: string;
};

type MaterialArrivalRow = {
    material?: string;
    jumlah?: string;
    satuan?: string;
    eta?: string;
};

type MiddayWorkRow = {
    itemPekerjaan?: string;
    status?: string;
    penyebab?: string;
};

type MiddayMaterialRow = {
    material?: string;
    status?: string;
    suratJalan?: File | null;
};

type MaterialOrderRow = {
    material?: string;
    jumlah?: string;
    satuan?: string;
};

type PriceRow = {
    namaBahan?: string;
    jumlah?: string;
    hargaSatuan?: string;
    hargaJumlah?: string;
};

type KasbonRow = {
    namaTukang?: string;
    jumlahKasbon?: string;
};

function ImageUploadField({
    id,
    label,
    file,
    onChange,
}: {
    id: string;
    label: string;
    file: File | string | null;
    onChange: (file: File | null) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        
        // Handle files from DB (which may be strings representing the URL)
        if (typeof file === 'string') {
            setPreviewUrl(file);
            return;
        }

        // Handle File instances
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="text-sm font-medium text-foreground/80">{label}</Label>
            <input
                ref={fileInputRef}
                id={id}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            />
            {file ? (
                <div className="relative flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 pr-10">
                    {previewUrl ? (
                        <img 
                            src={previewUrl.startsWith('daily-reports') ? `/storage/${previewUrl}` : previewUrl} 
                            className="size-10 rounded-lg object-cover border border-emerald-500/10" 
                            alt="Preview" 
                        />
                    ) : (
                        <FileImage className="size-8 text-emerald-500 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : 'Gambar Upload')}
                        </p>
                        {file instanceof File && (
                            <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={handleContainerClick}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 py-4 px-3 text-center transition-all hover:bg-muted/15 hover:border-primary/50 group"
                >
                    <div className="rounded-full bg-muted p-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Upload className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                            Pilih gambar atau foto
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Format JPG, PNG, atau WEBP
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniImageUploadField({
    file,
    onChange,
}: {
    file: File | string | null;
    onChange: (file: File | null) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        
        if (typeof file === 'string') {
            setPreviewUrl(file);
            return;
        }

        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div className="flex items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            />
            {file ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 pr-1 text-xs text-emerald-700 dark:text-emerald-300">
                    {previewUrl ? (
                        <img 
                            src={previewUrl.startsWith('daily-reports') ? `/storage/${previewUrl}` : previewUrl} 
                            className="size-5 rounded object-cover border border-emerald-500/10" 
                            alt="Preview" 
                        />
                    ) : (
                        <FileImage className="size-3.5" />
                    )}
                    <span className="max-w-[70px] truncate font-medium">
                        {file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : 'Gambar')}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-4 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                    >
                        <X className="size-3" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start hover:border-primary/40"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="size-3.5" />
                    Foto
                </Button>
            )}
        </div>
    );
}

const shiftOptions = ['Pagi', 'Siang', 'Sore'] as const;
const yesNoOptions = ['YA', 'BELUM'] as const;
const statusPekerjaanSoreOptions = [
    'Mencapai 100% (On-Track)',
    'Mangkrak/Berhenti/Belum selesai',
] as const;
const statusMaterialBesokOptions = [
    'Aman 100% (On-Track)',
    'Kurang/Belum datang',
] as const;
const jumlahTukangOptions = Array.from({ length: 20 }, (_, index) => `${index + 1}`);
const tukangOptions = [
    'Dedi',
    'Hendra',
    'Arif',
    'Wawan',
    'Yudi',
    'Fajar',
    'Bambang',
    'Rudi',
    'Nihil',
] as const;

function DynamicRowsHeader({
    title,
    onAdd,
}: {
    title: string;
    onAdd: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-b pb-3">
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                <Plus className="size-4" />
                Tambah Baris
            </Button>
        </div>
    );
}

export default function ReportForm({
    projectOptions,
    projectProgressMap,
    today,
    embedded = false,
    submitUrl = '/product-manager/laporan',
    onSuccess,
}: {
    projectOptions: string[];
    projectProgressMap: Record<string, number>;
    today: string;
    embedded?: boolean;
    submitUrl?: string;
    onSuccess?: () => void;
}) {
    const { flash } = usePage<ProjectOptionProps>().props;
    const todayDate = parseISO(today);
    const form = useForm({
        tanggal: today,
        namaProyek: '',
        progress: '',
        shift: 'Pagi',
        jumlahTukangHariIni: '',
        namaTukangIzinPagi: ['', '', ''],
        teleponKepalaTukangPagi: 'BELUM',
        catatanKepalaTukangPagi: '',
        prakiraanCuaca: '',
        pekerjaanUtamaHariIni: '',
        rencanaPekerjaanHariIni: [{ itemPekerjaan: '', volume: '', jumlahPekerja: '' }] as TripleRow[],
        rencanaMaterialHariIni: '',
        materialDatangHariIni: [{ material: '', jumlah: '', satuan: '', eta: '' }] as MaterialArrivalRow[],
        cctvJam8: null as File | null,
        tukangSakitSetengahHari: '',
        namaTukangIzinSiang: ['', '', ''],
        teleponKepalaTukangSiang: 'BELUM',
        catatanKepalaTukangSiang: '',
        statusPekerjaanSiang: [{ itemPekerjaan: '', status: '', penyebab: '' }] as MiddayWorkRow[],
        statusMaterialDatangSiang: [{ material: '', status: '', suratJalan: null }] as MiddayMaterialRow[],
        teleponMaterialLusa: 'BELUM',
        kebutuhanMaterialLusa: [{ material: '', jumlah: '', satuan: '' }] as MaterialOrderRow[],
        cctvJam10: null as File | null,
        cctvJam12: null as File | null,
        teleponKepalaTukangSore: 'BELUM',
        catatanKepalaTukangSore: '',
        statusPekerjaanSore: '',
        uploadFotoHasil: null as File | null,
        penyebabPekerjaanSore: '',
        orderMaterialSiang: 'BELUM',
        materialHarga: [{ namaBahan: '', jumlah: '', hargaSatuan: '', hargaJumlah: '' }] as PriceRow[],
        fotoNota: null as File | null,
        kendalaKerjaHariIni: '',
        targetUtamaBesok: '',
        statusMaterialBesok: '',
        cctvJam14: null as File | null,
        cctvJam16: null as File | null,
        rincianPengeluaranKas: [{ namaBahan: '', jumlah: '', hargaSatuan: '', hargaJumlah: '' }] as PriceRow[],
        financeFotoNota: null as File | null,
        kasbonTukang: [{ namaTukang: '', jumlahKasbon: '' }] as KasbonRow[],
    });
    const selectedShift = form.data.shift;
    const selectedTanggal = form.data.tanggal ? parseISO(form.data.tanggal) : undefined;

    const updateListItem = <T extends Record<string, string | File | null | undefined>>(
        field: keyof typeof form.data,
        index: number,
        key: keyof T,
        value: string | File | null,
    ) => {
        const current = [...(form.data[field] as T[])];
        current[index] = { ...current[index], [key]: value };
        form.setData(field, current as (typeof form.data)[typeof field]);
    };

    const addRow = <T extends object>(field: keyof typeof form.data, row: T) => {
        const current = [...(form.data[field] as T[])];
        current.push(row);
        form.setData(field, current as (typeof form.data)[typeof field]);
    };

    const removeRow = <T extends object>(field: keyof typeof form.data, index: number) => {
        const current = [...(form.data[field] as T[])];

        if (current.length === 1) {
            return;
        }

        current.splice(index, 1);
        form.setData(field, current as (typeof form.data)[typeof field]);
    };

    const updateStringArray = (field: 'namaTukangIzinPagi' | 'namaTukangIzinSiang', index: number, value: string) => {
        const current = [...form.data[field]];
        current[index] = value;
        form.setData(field, current);
    };

    const handleProjectChange = (value: string) => {
        form.setData('namaProyek', value);
        form.setData('progress', String(projectProgressMap[value] ?? ''));
    };

    return (
        <>
            {!embedded ? <Head title="Submit Laporan" /> : null}

            <div className="grid gap-6">
                {flash.success ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        {flash.success}
                    </div>
                ) : null}

                {!embedded ? (
                    <div className="grid gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">Submit Laporan Harian</h1>
                        <p className="text-muted-foreground max-w-3xl text-sm">
                            Isi laporan proyek per shift dengan format yang rapi, konsisten, dan sesuai kebutuhan operasional lapangan.
                        </p>
                    </div>
                ) : null}

                <form
                    className="grid gap-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(submitUrl, {
                            onSuccess: () => {
                                form.reset();
                                form.setData('tanggal', today);
                                form.setData('shift', 'Pagi');
                                form.setData('progress', '');
                                form.setData('namaProyek', '');
                                onSuccess?.();
                            },
                        });
                    }}
                >
                    <Card className="bg-card border-border/70 shadow-sm">
                        <CardHeader className="border-b pb-5">
                            <CardTitle>Identitas Laporan</CardTitle>
                            <CardDescription>
                                Pilih shift laporan terlebih dahulu. Setelah itu, form yang tampil hanya mengikuti shift yang dipilih.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal">Tanggal</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="tanggal"
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !selectedTanggal && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="size-4" />
                                                    {selectedTanggal
                                                        ? format(selectedTanggal, 'dd MMMM yyyy', {
                                                              locale: indonesiaLocale,
                                                          })
                                                        : 'Pilih tanggal'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-[--radix-popover-trigger-width] p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedTanggal}
                                                    onSelect={(date) => {
                                                        if (!date) {
                                                            return;
                                                        }

                                                        form.setData(
                                                            'tanggal',
                                                            format(date, 'yyyy-MM-dd'),
                                                        );
                                                    }}
                                                    disabled={(date) =>
                                                        startOfDay(date) < startOfDay(todayDate)
                                                    }
                                                    className="w-full rounded-lg border"
                                                    defaultMonth={selectedTanggal ?? todayDate}
                                                    toYear={todayDate.getFullYear() + 2}
                                                    classNames={{
                                                        day_button:
                                                            'size-8 disabled:text-muted-foreground disabled:opacity-35',
                                                        day_disabled:
                                                            'text-muted-foreground opacity-35',
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                            <div className="grid gap-2">
                                <Label>Nama Proyek</Label>
                                <Select value={form.data.namaProyek} onValueChange={handleProjectChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectOptions.map((project) => (
                                            <SelectItem key={project} value={project}>
                                                {project}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="progress">Progress Proyek (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.data.progress}
                                    onChange={(event) => form.setData('progress', event.target.value)}
                                    placeholder="0 - 100"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Shift Laporan</Label>
                                <Select value={form.data.shift} onValueChange={(value) => form.setData('shift', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shiftOptions.map((shift) => (
                                            <SelectItem key={shift} value={shift}>
                                                {shift}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedShift === 'Pagi' ? (
                    <Card className="bg-card border-border/70 shadow-sm">
                        <CardHeader className="border-b pb-5">
                            <CardTitle>Laporan Pagi</CardTitle>
                            <CardDescription>
                                Isian pagi difokuskan pada identitas proyek, sumberdaya manusia, dan rencana operasional harian.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">


                            <div className="border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:border-muted-foreground/15 grid gap-4">
                                <div className="space-y-1 border-b pb-3">
                                    <p className="text-sm font-semibold tracking-tight">Sumberdaya Manusia</p>
                                    <p className="text-muted-foreground text-sm">
                                        Jumlah tukang hari ini dan nama tukang izin diisi dari pilihan yang sudah tersedia.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Jumlah Tukang Hari Ini</Label>
                                        <Select
                                            value={form.data.jumlahTukangHariIni}
                                            onValueChange={(value) => form.setData('jumlahTukangHariIni', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jumlah tukang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jumlahTukangOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option} orang
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {form.data.namaTukangIzinPagi.map((item, index) => (
                                        <div key={`izin-pagi-${index}`} className="grid gap-2">
                                            <Label>Nama Tukang Izin {index + 1}</Label>
                                            <Select
                                                value={item}
                                                onValueChange={(value) => updateStringArray('namaTukangIzinPagi', index, value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih nama tukang" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tukangOptions.map((option) => (
                                                        <SelectItem key={`${option}-${index}`} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:border-muted-foreground/15 grid gap-4">
                                <div className="space-y-1 border-b pb-3">
                                    <p className="text-sm font-semibold tracking-tight">Operasional</p>
                                    <p className="text-muted-foreground text-sm">
                                        Bagian ini memuat telepon kepala tukang, cuaca, pekerjaan utama, rencana pekerjaan, material, dan capture CCTV jam 8 pagi.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Sudah Telepon Kepala Tukang</Label>
                                        <Select value={form.data.teleponKepalaTukangPagi} onValueChange={(value) => form.setData('teleponKepalaTukangPagi', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {yesNoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Prakiraan Cuaca Hari Ini</Label>
                                        <Input value={form.data.prakiraanCuaca} onChange={(event) => form.setData('prakiraanCuaca', event.target.value)} placeholder="Contoh: Cerah berawan" />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Catatan dari Kepala Tukang</Label>
                                        <Textarea value={form.data.catatanKepalaTukangPagi} onChange={(event) => form.setData('catatanKepalaTukangPagi', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>1 Pekerjaan Utama Hari Ini</Label>
                                        <Input value={form.data.pekerjaanUtamaHariIni} onChange={(event) => form.setData('pekerjaanUtamaHariIni', event.target.value)} placeholder="Contoh: Plester dinding luar sisi barat" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Rencana Pekerjaan Hari Ini (Pendukung Pekerjaan Utama & Penyelesaian Proyek)"
                                    onAdd={() => addRow('rencanaPekerjaanHariIni', { itemPekerjaan: '', volume: '', jumlahPekerja: '' })}
                                />
                                {form.data.rencanaPekerjaanHariIni.map((row, index) => (
                                    <div key={`rencana-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center">
                                        <Input value={row.itemPekerjaan ?? ''} onChange={(event) => updateListItem<TripleRow>('rencanaPekerjaanHariIni', index, 'itemPekerjaan', event.target.value)} placeholder="Item pekerjaan" />
                                        <Input value={row.volume ?? ''} onChange={(event) => updateListItem<TripleRow>('rencanaPekerjaanHariIni', index, 'volume', event.target.value)} placeholder="Volume + satuan" />
                                        <Select
                                            value={row.jumlahPekerja ?? ''}
                                            onValueChange={(value) => updateListItem<TripleRow>('rencanaPekerjaanHariIni', index, 'jumlahPekerja', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Jumlah pekerja" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jumlahTukangOptions.map((option) => (
                                                    <SelectItem key={`pekerja-${index}-${option}`} value={`${option} orang`}>
                                                        {option} orang
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('rencanaPekerjaanHariIni', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <Label>Rencana Material yang Digunakan Hari Ini</Label>
                                <Textarea value={form.data.rencanaMaterialHariIni} onChange={(event) => form.setData('rencanaMaterialHariIni', event.target.value)} />
                            </div>

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Material yang Akan Datang Hari Ini"
                                    onAdd={() => addRow('materialDatangHariIni', { material: '', jumlah: '', satuan: '', eta: '' })}
                                />
                                {form.data.materialDatangHariIni.map((row, index) => (
                                    <div key={`material-datang-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] items-center">
                                        <Input value={row.material ?? ''} onChange={(event) => updateListItem<MaterialArrivalRow>('materialDatangHariIni', index, 'material', event.target.value)} placeholder="Material" />
                                        <Input value={row.jumlah ?? ''} onChange={(event) => updateListItem<MaterialArrivalRow>('materialDatangHariIni', index, 'jumlah', event.target.value)} placeholder="Jumlah" />
                                        <Input value={row.satuan ?? ''} onChange={(event) => updateListItem<MaterialArrivalRow>('materialDatangHariIni', index, 'satuan', event.target.value)} placeholder="Satuan" />
                                        <Input value={row.eta ?? ''} onChange={(event) => updateListItem<MaterialArrivalRow>('materialDatangHariIni', index, 'eta', event.target.value)} placeholder="ETA" />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('materialDatangHariIni', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <ImageUploadField
                                id="cctv-jam-8"
                                label="Upload Capture CCTV Jam 8 Pagi"
                                file={form.data.cctvJam8}
                                onChange={(file) => form.setData('cctvJam8', file)}
                            />
                        </CardContent>
                    </Card>
                    ) : null}

                    {selectedShift === 'Siang' ? (
                    <Card className="bg-card border-border/70 shadow-sm">
                        <CardHeader className="border-b pb-5">
                            <CardTitle>Laporan Siang</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:border-muted-foreground/15 grid gap-4">
                                <div className="space-y-1 border-b pb-3">
                                    <p className="text-sm font-semibold tracking-tight">Sumberdaya Manusia</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Tukang Sakit / Pulang Setengah Hari</Label>
                                        <Input value={form.data.tukangSakitSetengahHari} onChange={(event) => form.setData('tukangSakitSetengahHari', event.target.value)} placeholder="Contoh: Ada / Nihil / 1 orang" />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {form.data.namaTukangIzinSiang.map((item, index) => (
                                        <div key={`izin-siang-${index}`} className="grid gap-2">
                                            <Label>Nama Tukang Izin {index + 1}</Label>
                                            <Input value={item} onChange={(event) => updateStringArray('namaTukangIzinSiang', index, event.target.value)} placeholder="Nama tukang" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:border-muted-foreground/15 grid gap-4">
                                <div className="space-y-1 border-b pb-3">
                                    <p className="text-sm font-semibold tracking-tight">Operasional</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Sudah Telepon Kepala Tukang Menanyakan Status Pekerjaan</Label>
                                        <Select value={form.data.teleponKepalaTukangSiang} onValueChange={(value) => form.setData('teleponKepalaTukangSiang', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {yesNoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sudah Telepon Kebutuhan Material untuk Lusa</Label>
                                        <Select value={form.data.teleponMaterialLusa} onValueChange={(value) => form.setData('teleponMaterialLusa', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {yesNoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Catatan dari Kepala Tukang</Label>
                                    <Textarea value={form.data.catatanKepalaTukangSiang} onChange={(event) => form.setData('catatanKepalaTukangSiang', event.target.value)} />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <ImageUploadField
                                        id="cctv-jam-10"
                                        label="Upload Capture CCTV Jam 10 Pagi"
                                        file={form.data.cctvJam10}
                                        onChange={(file) => form.setData('cctvJam10', file)}
                                    />
                                    <ImageUploadField
                                        id="cctv-jam-12"
                                        label="Upload Capture CCTV Jam 12 Siang"
                                        file={form.data.cctvJam12}
                                        onChange={(file) => form.setData('cctvJam12', file)}
                                    />
                                </div>
                            </div>

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Status Item Pekerjaan Pendukung"
                                    onAdd={() => addRow('statusPekerjaanSiang', { itemPekerjaan: '', status: '', penyebab: '' })}
                                />
                                {form.data.statusPekerjaanSiang.map((row, index) => (
                                    <div key={`status-siang-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center">
                                        <Input value={row.itemPekerjaan ?? ''} onChange={(event) => updateListItem<MiddayWorkRow>('statusPekerjaanSiang', index, 'itemPekerjaan', event.target.value)} placeholder="Item pekerjaan" />
                                        <Input value={row.status ?? ''} onChange={(event) => updateListItem<MiddayWorkRow>('statusPekerjaanSiang', index, 'status', event.target.value)} placeholder="Status pekerjaan" />
                                        <Input value={row.penyebab ?? ''} onChange={(event) => updateListItem<MiddayWorkRow>('statusPekerjaanSiang', index, 'penyebab', event.target.value)} placeholder="Penyebab jika < 50% / mangkrak" />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('statusPekerjaanSiang', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Status Item Material yang Datang Hari Ini"
                                    onAdd={() => addRow('statusMaterialDatangSiang', { material: '', status: '', suratJalan: '' })}
                                />
                                {form.data.statusMaterialDatangSiang.map((row, index) => (
                                    <div key={`material-siang-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_auto] items-center">
                                        <Input value={row.material ?? ''} onChange={(event) => updateListItem<MiddayMaterialRow>('statusMaterialDatangSiang', index, 'material', event.target.value)} placeholder="Material" />
                                        <Input value={row.status ?? ''} onChange={(event) => updateListItem<MiddayMaterialRow>('statusMaterialDatangSiang', index, 'status', event.target.value)} placeholder="Status material" />
                                        <MiniImageUploadField
                                            file={row.suratJalan as File | null}
                                            onChange={(file) =>
                                                updateListItem<MiddayMaterialRow>(
                                                    'statusMaterialDatangSiang',
                                                    index,
                                                    'suratJalan',
                                                    file,
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeRow('statusMaterialDatangSiang', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Kebutuhan Material yang Dipesan Siang Ini"
                                    onAdd={() => addRow('kebutuhanMaterialLusa', { material: '', jumlah: '', satuan: '' })}
                                />
                                {form.data.kebutuhanMaterialLusa.map((row, index) => (
                                    <div key={`material-lusa-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] items-center">
                                        <Input value={row.material ?? ''} onChange={(event) => updateListItem<MaterialOrderRow>('kebutuhanMaterialLusa', index, 'material', event.target.value)} placeholder="Material" />
                                        <Input value={row.jumlah ?? ''} onChange={(event) => updateListItem<MaterialOrderRow>('kebutuhanMaterialLusa', index, 'jumlah', event.target.value)} placeholder="Jumlah" />
                                        <Input value={row.satuan ?? ''} onChange={(event) => updateListItem<MaterialOrderRow>('kebutuhanMaterialLusa', index, 'satuan', event.target.value)} placeholder="Satuan" />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('kebutuhanMaterialLusa', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <ImageUploadField
                                id="cctv-jam-12"
                                label="Upload Capture CCTV Jam 12 Siang"
                                file={form.data.cctvJam12}
                                onChange={(file) => form.setData('cctvJam12', file)}
                            />
                        </CardContent>
                    </Card>
                    ) : null}

                    {selectedShift === 'Sore' ? (
                    <>
                    <Card className="bg-card border-border/70 shadow-sm">
                        <CardHeader className="border-b pb-5">
                            <CardTitle>Laporan Sore</CardTitle>
                            <CardDescription>
                                Laporan sore berisi penutupan progres pekerjaan, status material besok, dan dokumentasi akhir hari.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">


                            <div className="border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:border-muted-foreground/15 grid gap-4">
                                <div className="space-y-1 border-b pb-3">
                                    <p className="text-sm font-semibold tracking-tight">Operasional</p>
                                    <p className="text-muted-foreground text-sm">
                                        Isi status pekerjaan akhir hari, order material, dokumentasi, dan target pekerjaan besok.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Sudah Telepon Kepala Tukang Menanyakan Status Pekerjaan</Label>
                                        <Select value={form.data.teleponKepalaTukangSore} onValueChange={(value) => form.setData('teleponKepalaTukangSore', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {yesNoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status Item Pekerjaan Pendukung</Label>
                                        <Select value={form.data.statusPekerjaanSore} onValueChange={(value) => form.setData('statusPekerjaanSore', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status pekerjaan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusPekerjaanSoreOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Catatan dari Kepala Tukang</Label>
                                    <Textarea value={form.data.catatanKepalaTukangSore} onChange={(event) => form.setData('catatanKepalaTukangSore', event.target.value)} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <ImageUploadField
                                        id="upload-foto-hasil"
                                        label="Upload Foto Masing-Masing Hasil Pekerjaan"
                                        file={form.data.uploadFotoHasil}
                                        onChange={(file) => form.setData('uploadFotoHasil', file)}
                                    />
                                    <ImageUploadField
                                        id="foto-nota"
                                        label="Foto Nota"
                                        file={form.data.fotoNota}
                                        onChange={(file) => form.setData('fotoNota', file)}
                                    />
                                </div>

                                {form.data.statusPekerjaanSore === 'Mangkrak/Berhenti/Belum selesai' ? (
                                    <div className="grid gap-2">
                                        <Label>Penyebab Utama Jika Pekerjaan Mangkrak / Berhenti / Belum Selesai</Label>
                                        <Textarea value={form.data.penyebabPekerjaanSore} onChange={(event) => form.setData('penyebabPekerjaanSore', event.target.value)} />
                                    </div>
                                ) : null}

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Sudah Order Seluruh Material yang Ditulis Siang Tadi?</Label>
                                        <Select value={form.data.orderMaterialSiang} onValueChange={(value) => form.setData('orderMaterialSiang', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {yesNoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status Material untuk Pekerjaan Besok</Label>
                                        <Select value={form.data.statusMaterialBesok} onValueChange={(value) => form.setData('statusMaterialBesok', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status material" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusMaterialBesokOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                    <DynamicRowsHeader
                                        title="Nama Material + Jumlah + Harga Satuan + Harga Jumlah"
                                        onAdd={() => addRow('materialHarga', { namaBahan: '', jumlah: '', hargaSatuan: '', hargaJumlah: '' })}
                                    />
                                    {form.data.materialHarga.map((row, index) => (
                                        <div key={`harga-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center">
                                            <Input value={row.namaBahan ?? ''} onChange={(event) => updateListItem<PriceRow>('materialHarga', index, 'namaBahan', event.target.value)} placeholder="Nama bahan / alat" />
                                            <Input value={row.jumlah ?? ''} onChange={(event) => updateListItem<PriceRow>('materialHarga', index, 'jumlah', event.target.value)} placeholder="Jumlah" />
                                            <Input value={row.hargaSatuan ?? ''} onChange={(event) => updateListItem<PriceRow>('materialHarga', index, 'hargaSatuan', event.target.value)} placeholder="Harga satuan" />
                                            <Input value={row.hargaJumlah ?? ''} onChange={(event) => updateListItem<PriceRow>('materialHarga', index, 'hargaJumlah', event.target.value)} placeholder="Harga jumlah" />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => removeRow('materialHarga', index)}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Kendala Kerja Hari Ini</Label>
                                    <Textarea value={form.data.kendalaKerjaHariIni} onChange={(event) => form.setData('kendalaKerjaHariIni', event.target.value)} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Target Utama Pekerjaan Besok</Label>
                                        <Input value={form.data.targetUtamaBesok} onChange={(event) => form.setData('targetUtamaBesok', event.target.value)} />
                                    </div>
                                    <ImageUploadField
                                        id="cctv-jam-14"
                                        label="Upload Capture CCTV Jam 14 Siang (Waktu Proyek)"
                                        file={form.data.cctvJam14}
                                        onChange={(file) => form.setData('cctvJam14', file)}
                                    />
                                </div>

                                <ImageUploadField
                                    id="cctv-jam-16"
                                    label="Upload Capture CCTV Jam 16 Sore (Waktu Proyek)"
                                    file={form.data.cctvJam16}
                                    onChange={(file) => form.setData('cctvJam16', file)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border/70 shadow-sm">
                        <CardHeader className="border-b pb-5">
                            <CardTitle>Finance dan Cash</CardTitle>
                            <CardDescription>
                                Catat pengeluaran kas harian, lampiran nota, dan kasbon tukang.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Rincian Pengeluaran Kas"
                                    onAdd={() => addRow('rincianPengeluaranKas', { namaBahan: '', jumlah: '', hargaSatuan: '', hargaJumlah: '' })}
                                />
                                {form.data.rincianPengeluaranKas.map((row, index) => (
                                    <div key={`kas-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center">
                                        <Input value={row.namaBahan ?? ''} onChange={(event) => updateListItem<PriceRow>('rincianPengeluaranKas', index, 'namaBahan', event.target.value)} placeholder="Nama bahan / alat" />
                                        <Input value={row.jumlah ?? ''} onChange={(event) => updateListItem<PriceRow>('rincianPengeluaranKas', index, 'jumlah', event.target.value)} placeholder="Jumlah" />
                                        <Input value={row.hargaSatuan ?? ''} onChange={(event) => updateListItem<PriceRow>('rincianPengeluaranKas', index, 'hargaSatuan', event.target.value)} placeholder="Harga satuan" />
                                        <Input value={row.hargaJumlah ?? ''} onChange={(event) => updateListItem<PriceRow>('rincianPengeluaranKas', index, 'hargaJumlah', event.target.value)} placeholder="Harga jumlah" />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('rincianPengeluaranKas', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <ImageUploadField
                                id="finance-foto-nota"
                                label="Upload Foto Nota"
                                file={form.data.financeFotoNota}
                                onChange={(file) => form.setData('financeFotoNota', file)}
                            />

                            <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 shadow-xs transition-all hover:bg-muted/40 grid gap-4">
                                <DynamicRowsHeader
                                    title="Kasbon Tukang"
                                    onAdd={() => addRow('kasbonTukang', { namaTukang: '', jumlahKasbon: '' })}
                                />
                                {form.data.kasbonTukang.map((row, index) => (
                                    <div key={`kasbon-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center">
                                        <Input value={row.namaTukang ?? ''} onChange={(event) => updateListItem<KasbonRow>('kasbonTukang', index, 'namaTukang', event.target.value)} placeholder="Nama tukang" />
                                        <Input value={row.jumlahKasbon ?? ''} onChange={(event) => updateListItem<KasbonRow>('kasbonTukang', index, 'jumlahKasbon', event.target.value)} placeholder="Jumlah kasbon" />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => removeRow('kasbonTukang', index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    </>
                    ) : null}

                    <div className="bg-background/95 sticky bottom-0 flex justify-end rounded-2xl border p-3 shadow-lg backdrop-blur">
                        <Button type="submit" size="lg" disabled={form.processing} className="min-w-48">
                            <Send className="size-4" />
                            Kirim Laporan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
