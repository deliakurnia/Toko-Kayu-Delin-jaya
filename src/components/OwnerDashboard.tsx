import React, { useState, useEffect } from 'react';
import { 
  Inquiry, 
  Customer, 
  InquiryStatus, 
  OrderReport, 
  SecurityLog, 
  WoodType, 
  WoodStockStatus,
  CostBreakdown,
  PaymentRecord,
  ProductionMilestone,
  SVLKCertificate,
  ShipmentWaybill,
  StockLedgerEntry,
  CashLedgerEntry
} from '../types';
import { dbService } from '../services/dbService';
import { OrderPdfDocument } from './OrderPdfDocument';
import {
  QuotationModal,
  MilestoneModal,
  SvlkModal,
  WaybillModal
} from './OwnerBusinessModals';
import {
  Search,
  Filter,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Users,
  PackageCheck,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Database,
  Lock,
  LogOut,
  AlertTriangle,
  FileText,
  RotateCcw,
  Save,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Server,
  Terminal,
  Shield,
  KeyRound,
  Boxes,
  Radio,
  Plus,
  X,
  Palette,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  CreditCard,
  Activity,
  Truck,
  Flame,
  Calculator,
  Coins
} from 'lucide-react';

interface WoodStockEditorCardProps {
  wood: WoodType;
  onSave: (woodId: string, values: { stockStatus: WoodStockStatus; stockVolumeM3: number; stockSlabsCount: number; restockEstimate?: string }) => Promise<void>;
  onOpenUploadModal: (wood: WoodType) => void;
  isUpdating: boolean;
  isSuccess: boolean;
}

const WoodStockEditorCard: React.FC<WoodStockEditorCardProps> = ({ wood, onSave, onOpenUploadModal, isUpdating, isSuccess }) => {
  const [status, setStatus] = useState<WoodStockStatus>(wood.stockStatus || 'ready');
  const [volume, setVolume] = useState<number>(wood.stockVolumeM3 ?? 10);
  const [slabs, setSlabs] = useState<number>(wood.stockSlabsCount ?? 5);
  const [estimate, setEstimate] = useState<string>(wood.restockEstimate || 'Siap Kirim');

  // Sinkronisasi data saat terjadi push event dari backend atau tab lain
  useEffect(() => {
    setStatus(wood.stockStatus || 'ready');
    setVolume(wood.stockVolumeM3 ?? 10);
    setSlabs(wood.stockSlabsCount ?? 5);
    setEstimate(wood.restockEstimate || 'Siap Kirim');
  }, [wood]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(wood.id, {
      stockStatus: status,
      stockVolumeM3: Number(volume),
      stockSlabsCount: Number(slabs),
      restockEstimate: estimate
    });
  };

  const getStatusBadge = (st: WoodStockStatus) => {
    switch (st) {
      case 'ready':
        return {
          label: 'Tersedia • Siap Kirim',
          classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
        };
      case 'low_stock':
        return {
          label: 'Stok Menipis • Terbatas',
          classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
        };
      case 'out_of_stock':
        return {
          label: 'Habis • Inden Penebangan',
          classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
        };
      case 'pre_order':
        return {
          label: 'Pre-Order • Oven Kiln-Dry',
          classes: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
        };
    }
  };

  const currentBadge = getStatusBadge(wood.stockStatus);
  const coverImage = wood.images && wood.images.length > 0 ? wood.images[0] : (wood as any).imageUrl;

  return (
    <div className="ring-1 ring-black/5 dark:ring-white/10 p-1.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
        {/* Identitas Kayu & Thumbnail Foto Spesimen */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group/thumb shrink-0">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={wood.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl border border-black/10 shrink-0 shadow-xs flex items-center justify-center font-bold text-white text-xs"
                  style={{ backgroundColor: wood.textureColorHex || '#8B5A2B' }}
                >
                  {wood.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => onOpenUploadModal(wood)}
                title="Ganti / Unggah Foto Spesimen"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {wood.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentBadge.classes}`}>
                  {currentBadge.label}
                </span>
              </div>
              <div className="text-[11px] font-mono text-stone-400 italic">
                {wood.botanicalName} • {wood.origin}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {wood.lastStockUpdate && (
              <span className="text-[10px] font-mono text-stone-400 text-right">
                Update: {new Date(wood.lastStockUpdate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              type="button"
              onClick={() => onOpenUploadModal(wood)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300/60 dark:border-stone-700/60"
            >
              <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Ganti / Unggah Foto</span>
            </button>
          </div>
        </div>

        {/* Pemilihan Status Ketersediaan Cepat */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            Status Ketersediaan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(
              [
                { id: 'ready', label: 'Tersedia (Ready)', color: 'hover:border-emerald-500' },
                { id: 'low_stock', label: 'Menipis (Low)', color: 'hover:border-amber-500' },
                { id: 'out_of_stock', label: 'Habis (Out)', color: 'hover:border-rose-500' },
                { id: 'pre_order', label: 'Pre-Order', color: 'hover:border-indigo-500' }
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  status === opt.id
                    ? opt.id === 'ready'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : opt.id === 'low_stock'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : opt.id === 'out_of_stock'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 ' + opt.color
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Angka Kubikasi & Slab */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Volume Siap Kirim (m³):
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Jumlah Slab Utuh (Pcs):
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={slabs}
              onChange={e => setSlabs(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Catatan Ketersediaan:
            </label>
            <input
              type="text"
              value={estimate}
              onChange={e => setEstimate(e.target.value)}
              placeholder="e.g. Gudang Jepara / Oven 2 Minggu"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tombol Simpan & Siarkan SSE */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/60">
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Siaran real-time via broker SSE</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
            }`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiarkan...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersiar Real-Time!</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>Simpan &amp; Siarkan Real-Time</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddWoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newWood: WoodType) => void;
}

const WOOD_PRESETS = [
  {
    label: 'Ulin Kalimantan',
    name: 'Kayu Ulin Kalimantan',
    botanicalName: 'Eusideroxylon zwageri',
    origin: 'Kalimantan Timur (Hutan Alami)',
    priceRangeEstimate: 'Rp 35.000.000 - Rp 60.000.000 / m³',
    description: 'Kayu besi nusantara yang tahan terhadap air asin, rayap, dan pembusukan cuaca tropis puluhan tahun.',
    textureColorHex: '#3E3224',
    roughness: 0.50,
    metalness: 0.08,
    stockStatus: 'ready' as WoodStockStatus,
    stockVolumeM3: 7.5,
    stockSlabsCount: 6,
    restockEstimate: 'Siap Kirim (Gudang Balikpapan)',
    imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Merbau Papua',
    name: 'Kayu Merbau Papua',
    botanicalName: 'Intsia bijuga',
    origin: 'Papua Barat & Maluku',
    priceRangeEstimate: 'Rp 24.000.000 - Rp 42.000.000 / m³',
    description: 'Kayu berdensitas padat dengan corak cokelat kemerahan berkilau. Pilihan utama lantai mewah dan balok konstruksi eksotis.',
    textureColorHex: '#5C281E',
    roughness: 0.40,
    metalness: 0.10,
    stockStatus: 'ready' as WoodStockStatus,
    stockVolumeM3: 12.0,
    stockSlabsCount: 8,
    restockEstimate: 'Siap Kirim (Gudang Sorong)',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Trembesi Suar',
    name: 'Kayu Trembesi (Suar Wood)',
    botanicalName: 'Samanea saman',
    origin: 'Jawa Tengah (Legal SVLK)',
    priceRangeEstimate: 'Rp 16.000.000 - Rp 28.000.000 / m³',
    description: 'Kayu dengan penampang slab utuh berdiameter raksasa. Memiliki gradasi serat putih gubal dan cokelat teras yang dramatis.',
    textureColorHex: '#785338',
    roughness: 0.35,
    metalness: 0.05,
    stockStatus: 'ready' as WoodStockStatus,
    stockVolumeM3: 15.0,
    stockSlabsCount: 10,
    restockEstimate: 'Siap Kirim (Gudang Jepara)',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Mahoni Jepara',
    name: 'Kayu Mahoni (Mahogany)',
    botanicalName: 'Swietenia mahagoni',
    origin: 'Jawa Timur & Jawa Tengah',
    priceRangeEstimate: 'Rp 14.000.000 - Rp 25.000.000 / m³',
    description: 'Serat halus kemerahan dengan kestabilan dimensi prima. Sangat ideal untuk furniture bergaya neo-klasik dan ukiran presisi.',
    textureColorHex: '#6E2C1D',
    roughness: 0.45,
    metalness: 0.06,
    stockStatus: 'pre_order' as WoodStockStatus,
    stockVolumeM3: 5.0,
    stockSlabsCount: 4,
    restockEstimate: 'Proses Oven Suhu Rendah (2 Minggu)',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
  }
];

const AddWoodModal: React.FC<AddWoodModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [origin, setOrigin] = useState('');
  const [priceRangeEstimate, setPriceRangeEstimate] = useState('');
  const [description, setDescription] = useState('');
  const [textureColorHex, setTextureColorHex] = useState('#3E3224');
  const [roughness, setRoughness] = useState(0.45);
  const [metalness, setMetalness] = useState(0.08);
  const [stockStatus, setStockStatus] = useState<WoodStockStatus>('ready');
  const [stockVolumeM3, setStockVolumeM3] = useState(8.0);
  const [stockSlabsCount, setStockSlabsCount] = useState(6);
  const [restockEstimate, setRestockEstimate] = useState('Siap Kirim (Gudang Jepara)');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyPreset = (preset: typeof WOOD_PRESETS[0]) => {
    setName(preset.name);
    setBotanicalName(preset.botanicalName);
    setOrigin(preset.origin);
    setPriceRangeEstimate(preset.priceRangeEstimate);
    setDescription(preset.description);
    setTextureColorHex(preset.textureColorHex);
    setRoughness(preset.roughness);
    setMetalness(preset.metalness);
    setStockStatus(preset.stockStatus);
    setStockVolumeM3(preset.stockVolumeM3);
    setStockSlabsCount(preset.stockSlabsCount);
    setRestockEstimate(preset.restockEstimate);
    setImageUrl(preset.imageUrl);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama spesimen kayu wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanSlug = cleanName.toLowerCase().replace(/kayu\s+/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const newWoodData: Partial<WoodType> = {
      name: cleanName,
      botanicalName: botanicalName.trim() || 'Spesies Tropis',
      slug: cleanSlug,
      origin: origin.trim() || 'Nusantara',
      priceRangeEstimate: priceRangeEstimate.trim() || 'Hubungi Atelier untuk Penawaran',
      description: description.trim() || 'Kayu solid nusantara kualitas premium.',
      textureColorHex,
      roughness: Number(roughness),
      metalness: Number(metalness),
      stockStatus,
      stockVolumeM3: Number(stockVolumeM3),
      stockSlabsCount: Number(stockSlabsCount),
      restockEstimate: restockEstimate.trim(),
      images: [imageUrl.trim()],
      characteristics: {
        kekerasan: 'Keras & Stabil',
        warna: 'Alami Eksotis',
        ketahanan: 'Kelas Awet I/II',
        kadarAir: '10% - 12% (Kiln-Dried)',
        massaJenis: '750 - 900 kg/m³',
        kegunaan: ['Meja Solid Slab', 'Custom Architectural Furniture', 'Lantai Kayu']
      }
    };

    const res = await dbService.createWood(newWoodData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      onCreated(res.data);
      onClose();
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan spesimen kayu baru.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl ring-1 ring-black/10 dark:ring-white/10 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 max-h-[90vh] overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  Tambah Spesimen Kayu Baru
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Data langsung disimpan ke database dan disiarkan real-time ke seluruh pembeli.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Isi Otomatis dari Preset Varietas Nusantara:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {WOOD_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-amber-500/10 hover:border-amber-500 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.textureColorHex }} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Nama & Botani */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Varietas Kayu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kayu Ulin Kalimantan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Botani Ilmiah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Eusideroxylon zwageri"
                  value={botanicalName}
                  onChange={e => setBotanicalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 italic"
                />
              </div>
            </div>

            {/* Row 2: Asal Daerah & Estimasi Harga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Daerah Asal Hutan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kalimantan Timur & Selatan"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Estimasi Rentang Harga
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 35.000.000 - Rp 55.000.000 / m³"
                  value={priceRangeEstimate}
                  onChange={e => setPriceRangeEstimate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Deskripsi Serat &amp; Karakteristik
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan karakteristik visual serat kayu, ketahanan alami, dan keistimewaan karya..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Section 3D Shader WebGL */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Konfigurasi Tekstur Shader 3D (WebGL Three.js)
                  </span>
                </div>
                {/* Mini Swatch Live Preview */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
                  <span>Preview:</span>
                  <div
                    className="w-6 h-6 rounded-lg border border-black/20 shadow-xs"
                    style={{ backgroundColor: textureColorHex }}
                    title={`Hex: ${textureColorHex}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    Warna Serat Dasar (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textureColorHex}
                      onChange={e => setTextureColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={textureColorHex}
                      onChange={e => setTextureColorHex(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 mb-1">
                    <span>Roughness (Kekasaran)</span>
                    <span className="font-mono text-amber-600">{roughness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={roughness}
                    onChange={e => setRoughness(parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 mb-1">
                    <span>Metalness (Pantulan)</span>
                    <span className="font-mono text-amber-600">{metalness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.3"
                    step="0.02"
                    value={metalness}
                    onChange={e => setMetalness(parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Section Inventaris Stok Awal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Status Ketersediaan
                </label>
                <select
                  value={stockStatus}
                  onChange={e => setStockStatus(e.target.value as WoodStockStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="ready">Tersedia (Ready)</option>
                  <option value="low_stock">Stok Menipis (Low)</option>
                  <option value="out_of_stock">Habis (Out of Stock)</option>
                  <option value="pre_order">Pre-Order Kiln-Dry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Volume Kubikasi (m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={stockVolumeM3}
                  onChange={e => setStockVolumeM3(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Jumlah Slab Utuh
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockSlabsCount}
                  onChange={e => setStockSlabsCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Catatan Restock & Foto URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Catatan Lokasi Gudang / Restock
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Siap Kirim (Gudang Jepara)"
                  value={restockEstimate}
                  onChange={e => setRestockEstimate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  URL Foto Spesimen Serat
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan &amp; Menyiarkan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Terbitkan &amp; Siarkan Real-Time</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface UploadWoodImageModalProps {
  isOpen: boolean;
  wood: WoodType | null;
  onClose: () => void;
  onSuccess: (updatedWood: WoodType) => void;
}

const UploadWoodImageModal: React.FC<UploadWoodImageModalProps> = ({
  isOpen,
  wood,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [action, setAction] = useState<'replace' | 'append'>('replace');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setAction('replace');
      setErrorMsg(null);
      setIsDragOver(false);
    }
  }, [isOpen, wood]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen || !wood) return null;

  const currentCoverImage = wood.images && wood.images.length > 0 ? wood.images[0] : (wood as any).imageUrl;

  const handleFile = (file?: File) => {
    setErrorMsg(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format berkas tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`Ukuran berkas (${sizeMB} MB) melebihi batas maksimum 5.00 MB.`);
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Silakan pilih berkas foto spesimen terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const res = await dbService.uploadWoodImage(wood.id, selectedFile, action);
    setIsUploading(false);

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan dan menyiarkan foto spesimen ke backend.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="ring-1 ring-black/5 dark:ring-white/10 p-1.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] w-full max-w-xl my-8">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-5">
          {/* Header Modal */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Unggah / Perbarui Foto Spesimen
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {wood.name} ({wood.botanicalName})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Aksi: Ganti Foto Utama atau Tambah ke Galeri */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                Pilih Mode Perubahan Foto:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('replace')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    action === 'replace'
                      ? 'bg-amber-500/10 border-amber-500 text-stone-900 dark:text-stone-100 ring-1 ring-amber-500'
                      : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Ganti Foto Utama (Cover)</span>
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      action === 'replace' ? 'border-amber-500 bg-amber-500' : 'border-stone-400'
                    }`}>
                      {action === 'replace' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Mengganti foto sampul utama spesimen. Foto lama dari server akan dibersihkan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('append')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    action === 'append'
                      ? 'bg-amber-500/10 border-amber-500 text-stone-900 dark:text-stone-100 ring-1 ring-amber-500'
                      : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Tambah ke Galeri Spesimen</span>
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      action === 'append' ? 'border-amber-500 bg-amber-500' : 'border-stone-400'
                    }`}>
                      {action === 'append' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Menyimpan foto baru sebagai sudut pandang tambahan tanpa menghapus foto cover utama.
                  </p>
                </button>
              </div>
            </div>

            {/* Komparasi Foto Saat Ini vs Foto Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
              {/* Foto Saat Ini */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Foto Sampul Saat Ini:
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {wood.images?.length || 1} berkas
                  </span>
                </div>
                <div className="h-36 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-200 dark:bg-stone-900 relative">
                  {currentCoverImage ? (
                    <img
                      src={currentCoverImage}
                      alt={wood.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      Belum ada foto
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    Aktif di Katalog
                  </span>
                </div>
              </div>

              {/* Foto Baru (Preview atau Dropzone) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {previewUrl ? 'Pratinjau Foto Baru:' : 'Pilih Foto Baru:'}
                  </span>
                  {selectedFile && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>

                {previewUrl ? (
                  <div className="h-36 rounded-lg overflow-hidden border border-amber-500/50 relative group">
                    <img
                      src={previewUrl}
                      alt="Pratinjau Foto Baru"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded bg-stone-900/90 text-white text-xs font-semibold hover:bg-stone-900 cursor-pointer"
                      >
                        Ganti Berkas
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-mono">
                      Siap Diunggah
                    </span>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-stone-300 dark:border-stone-700 hover:border-amber-500/60 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-stone-400 mb-1" />
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Tarik &amp; lepas foto di sini
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      atau <span className="text-amber-600 font-bold">klik untuk memilih</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1 font-mono">
                      JPG, PNG, WEBP (Maks 5 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* Alert Error Jika Ada */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Siaran real-time via broker SSE</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah &amp; Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah &amp; Siarkan Real-Time</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export interface OwnerDashboardProps {
  inquiries?: Inquiry[];
  customers?: Customer[];
  onRefreshData?: () => void;
  onLogoutOwner?: () => void;
  onReturnToStore?: () => void;
}

export type AdminDashboardProps = OwnerDashboardProps;

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  inquiries = [],
  customers = [],
  onRefreshData = () => {},
  onLogoutOwner = () => {},
  onReturnToStore
}) => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'inventory' | 'payments' | 'production' | 'reports' | 'database'>('inquiries');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data states
  const [reports, setReports] = useState<OrderReport[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [selectedPdfInquiry, setSelectedPdfInquiry] = useState<Inquiry | null>(null);
  const [stockLedgers, setStockLedgers] = useState<StockLedgerEntry[]>([]);
  const [cashLedgers, setCashLedgers] = useState<CashLedgerEntry[]>([]);

  // Interconnected Modals state
  const [selectedQuotationInquiry, setSelectedQuotationInquiry] = useState<Inquiry | null>(null);
  const [selectedMilestoneInquiry, setSelectedMilestoneInquiry] = useState<Inquiry | null>(null);
  const [selectedSvlkInquiry, setSelectedSvlkInquiry] = useState<Inquiry | null>(null);
  const [selectedWaybillInquiry, setSelectedWaybillInquiry] = useState<Inquiry | null>(null);
  
  // Wood Inventory state
  const [woodsList, setWoodsList] = useState<WoodType[]>(() => dbService.getWoods());
  const [updatingWoodId, setUpdatingWoodId] = useState<string | null>(null);
  const [stockUpdateSuccessId, setStockUpdateSuccessId] = useState<string | null>(null);
  const [isAddWoodModalOpen, setIsAddWoodModalOpen] = useState(false);
  const [uploadTargetWood, setUploadTargetWood] = useState<WoodType | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Resolution note state
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');
  const [dbNotification, setDbNotification] = useState<string | null>(null);

  // Live Backend & Storage Engine state
  const [backendInfo, setBackendInfo] = useState(dbService.getBackendStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const loadExtraData = () => {
    setReports(dbService.getOrderReports());
    setSecurityLogs(dbService.getSecurityLogs());
    setWoodsList(dbService.getWoods());
    setStockLedgers(dbService.getStockLedgers());
    setCashLedgers(dbService.getCashLedgers());
  };

  useEffect(() => {
    loadExtraData();
    dbService.checkBackendHealth().then(info => setBackendInfo(info));
    const unsubscribe = dbService.subscribe((event) => {
      loadExtraData();
      if (
        event.type === 'BACKEND_STATUS_CHANGED' ||
        event.type === 'DATA_SYNCED' ||
        event.type === 'WOOD_STOCK_UPDATED' ||
        event.type === 'WOOD_IMAGE_UPDATED' ||
        event.type === 'WOOD_CREATED'
      ) {
        setBackendInfo(dbService.getBackendStatus());
        setWoodsList(dbService.getWoods());
      }
    });

    const handleWindowUpdate = () => {
      setWoodsList(dbService.getWoods());
    };
    window.addEventListener('woodCatalogUpdated', handleWindowUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('woodCatalogUpdated', handleWindowUpdate);
    };
  }, []);

  const handleOpenUploadModal = (wood: WoodType) => {
    setUploadTargetWood(wood);
    setIsUploadModalOpen(true);
  };

  const handleImageUploaded = (updatedWood: WoodType) => {
    setWoodsList(dbService.getWoods());
    setDbNotification(`Foto spesimen "${updatedWood.name}" berhasil diperbarui dan disiarkan real-time ke seluruh katalog!`);
    onRefreshData();
    setTimeout(() => {
      setDbNotification(null);
    }, 4500);
  };

  const handleWoodCreated = (newWood: WoodType) => {
    setWoodsList(dbService.getWoods());
    setDbNotification(`Spesimen baru "${newWood.name}" berhasil diterbitkan dan disiarkan real-time!`);
    onRefreshData();
    setTimeout(() => {
      setDbNotification(null);
    }, 4500);
  };

  const handleSaveStock = async (
    woodId: string,
    values: { stockStatus: WoodStockStatus; stockVolumeM3: number; stockSlabsCount: number; restockEstimate?: string }
  ) => {
    setUpdatingWoodId(woodId);
    const result = await dbService.updateWoodStock(woodId, values);
    setUpdatingWoodId(null);
    if (result.success) {
      setStockUpdateSuccessId(woodId);
      setWoodsList(dbService.getWoods());
      setDbNotification(`Ketersediaan stok ${result.data?.name || 'kayu'} berhasil diperbarui dan disiarkan via broker real-time.`);
      setTimeout(() => {
        setStockUpdateSuccessId(null);
        setDbNotification(null);
      }, 4000);
    }
  };

  const handleSyncBackend = async () => {
    setIsSyncing(true);
    const success = await dbService.syncWithBackend();
    const info = await dbService.checkBackendHealth();
    setBackendInfo(info);
    setIsSyncing(false);
    onRefreshData();
    loadExtraData();
    if (success) {
      setDbNotification('Sinkronisasi data berhasil terhubung dengan basis data Go / MongoDB.');
    } else {
      setDbNotification('Server backend tidak merespons atau sedang offline. Mode local storage tetap aktif.');
    }
    setTimeout(() => setDbNotification(null), 4500);
  };

  // Metrics
  const totalInquiries = safeInquiries.length;
  const newInquiries = safeInquiries.filter(i => i.status === 'new').length;
  const processingInquiries = safeInquiries.filter(i => i.status === 'processing').length;
  const doneInquiries = safeInquiries.filter(i => i.status === 'done').length;
  const completedRate = totalInquiries > 0 ? Math.round((doneInquiries / totalInquiries) * 100) : 0;
  const openReports = reports.filter(r => r.status !== 'resolved').length;

  // Status Updater
  const handleStatusChange = (inquiryId: string, newStatus: InquiryStatus) => {
    dbService.updateInquiryStatus(inquiryId, newStatus);
    onRefreshData();
  };

  // Report Status Updater
  const handleUpdateReport = (reportId: string, status: 'open' | 'investigating' | 'resolved') => {
    dbService.updateReportStatus(reportId, status, resolutionText || undefined);
    setEditingReportId(null);
    setResolutionText('');
    loadExtraData();
  };

  // Filtered Inquiries
  const filteredInquiries = safeInquiries.filter(item => {
    const matchesSearch =
      item.inquiryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sessionNumber && item.sessionNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.woodTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  // Filtered Reports
  const filteredReports = reports.filter(r =>
    r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.inquiryNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Excel Exports (Clean & Structured)
  const handleExportInquiriesExcel = () => {
    dbService.exportInquiriesToExcel(safeInquiries);
  };

  const handleExportReportsExcel = () => {
    dbService.exportReportsToExcel(reports);
  };

  // Business Modals Handlers
  const handleQuotationSaved = async (quotation: CostBreakdown) => {
    if (!selectedQuotationInquiry) return;
    const res = await dbService.saveQuotation(selectedQuotationInquiry.id, quotation);
    if (res) {
      setDbNotification(`Kalkulasi penawaran resmi pesanan ${selectedQuotationInquiry.inquiryNumber} berhasil disimpan.`);
      onRefreshData();
      loadExtraData();
    }
    setSelectedQuotationInquiry(null);
    setTimeout(() => setDbNotification(null), 4500);
  };

  const handleMilestoneSaved = async (milestone: Omit<ProductionMilestone, 'id' | 'timestamp'>) => {
    if (!selectedMilestoneInquiry) return;
    const res = await dbService.addProductionMilestone(selectedMilestoneInquiry.id, milestone as any);
    if (res) {
      setDbNotification(`Dokumentasi tahapan "${milestone.title}" berhasil ditambahkan ke riwayat pengerjaan.`);
      onRefreshData();
      loadExtraData();
    }
    setSelectedMilestoneInquiry(null);
    setTimeout(() => setDbNotification(null), 4500);
  };

  const handleSvlkSaved = async (cert: SVLKCertificate) => {
    if (!selectedSvlkInquiry) return;
    const res = await dbService.updateSVLKCertificate(selectedSvlkInquiry.id, cert);
    if (res) {
      setDbNotification(`Sertifikat Legalitas SVLK ${cert.certificateNumber} berhasil diverifikasi.`);
      onRefreshData();
      loadExtraData();
    }
    setSelectedSvlkInquiry(null);
    setTimeout(() => setDbNotification(null), 4500);
  };

  const handleWaybillSaved = async (waybill: ShipmentWaybill) => {
    if (!selectedWaybillInquiry) return;
    const res = await dbService.updateShipmentWaybill(selectedWaybillInquiry.id, waybill);
    if (res.success) {
      setDbNotification(`Surat jalan ekspedisi ${waybill.carrierName} (Resi: ${waybill.waybillNumber}) berhasil diterbitkan.`);
      onRefreshData();
      loadExtraData();
    } else {
      setDbNotification(res.error || 'Gagal menerbitkan surat jalan pengiriman.');
    }
    setSelectedWaybillInquiry(null);
    setTimeout(() => setDbNotification(null), 4500);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-stone-900 dark:text-stone-100">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Lock className="w-3 h-3" />
              Sesi Pemilik Aktif (Protected)
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              backendInfo.isCloudLive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : backendInfo.isOnline
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                backendInfo.isCloudLive ? 'bg-emerald-400 animate-pulse' :
                backendInfo.isOnline ? 'bg-amber-400' : 'bg-stone-500'
              }`}></span>
              {backendInfo.isCloudLive ? 'Cloud MongoDB Atlas M0 Live' :
               backendInfo.isOnline ? 'Golang Microservice Active' : 'Local Storage Fallback'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mt-1.5">
            Konsol Pemilik Atelier (Owner Studio)
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Kendali penuh pengadaan kayu solid Nusantara, mebel kustom, tiket komplain, dan sinkronisasi basis data MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncBackend}
            disabled={isSyncing}
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isSyncing ? 'bg-amber-950/60 text-amber-300 border-amber-700 animate-pulse' :
              'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="Sinkronisasikan data lokal dengan backend Go / MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan API'}</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 border border-stone-700 transition-colors"
            title="Segarkan data dari database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleExportInquiriesExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Ekspor rekap inquiry ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          {onReturnToStore && (
            <button
              onClick={onReturnToStore}
              className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lihat tampilan etalase toko pelanggan tanpa mengunci sesi"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Etalase Toko</span>
            </button>
          )}

          <button
            onClick={onLogoutOwner}
            className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-rose-950/80 text-stone-300 hover:text-rose-300 border border-stone-700 hover:border-rose-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kunci sesi pemilik atelier dan kembali ke beranda"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci &amp; Keluar</span>
          </button>
        </div>
      </div>

      {dbNotification && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-700/80 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dbNotification}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Total Inquiry Masuk</span>
            <PackageCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2 font-serif">
            {totalInquiries}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
            {newInquiries} pesanan baru menunggu konfirmasi
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Dalam Pengerjaan</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2 font-serif">
            {processingInquiries}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
            Sedang dikerjakan pengrajin
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Laporan Kendala Pengiriman</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-serif">
            {openReports}
          </div>
          <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 block">
            {reports.length} total laporan keterlambatan
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Penyelesaian Pesanan</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-serif">
            {doneInquiries} ({completedRate}%)
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
            Pesanan selesai dan terkirim ke pemesan
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'inquiries'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Daftar Inquiry ({safeInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-500" />
            <span>Stok Real-Time ({woodsList.length})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kas &amp; Pembayaran</span>
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'production'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Progres &amp; Kargo Truk</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Laporan Kendala Pesanan ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Infrastruktur Cloud &amp; Keamanan
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari ref, nomor sesi, nama..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeTab === 'inquiries' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="new">Baru</option>
              <option value="processing">Diproses</option>
              <option value="done">Selesai</option>
              <option value="cancelled">Batal</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: INQUIRIES WITH AESTHETIC PDF PRINT & EXCEL EXPORT */}
      {activeTab === 'inquiries' && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
          <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Rekap Pesanan</span>
              <span className="text-stone-400">({filteredInquiries.length} data)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportInquiriesExcel}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel Rapih</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">No. Ref &amp; Sesi</th>
                  <th className="py-3 px-4">Pelanggan &amp; Kontak</th>
                  <th className="py-3 px-4">Kayu &amp; Kategori</th>
                  <th className="py-3 px-4">Dimensi / Catatan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Tidak ada inquiry yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map(inquiry => (
                    <tr key={inquiry.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          {inquiry.inquiryNumber}
                        </div>
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                          {inquiry.sessionNumber || '-'}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(inquiry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
                          <span>{inquiry.customerName}</span>
                          {inquiry.isRepeatCustomer && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              ⭐ #{inquiry.repeatOrderCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                          +{inquiry.whatsappNumber}
                        </div>
                        {inquiry.customerEmail && (
                          <div className="text-[10px] text-stone-400 truncate max-w-[140px]">
                            {inquiry.customerEmail}
                          </div>
                        )}
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          📍 {inquiry.city}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-amber-800 dark:text-amber-400">
                          {inquiry.woodTypeName}
                        </div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          {inquiry.orderType === 'raw_wood' ? 'Bahan Kayu Mentah' : inquiry.categoryName || 'Custom Furniture'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                          {inquiry.sizeEstimate || '-'}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate italic">
                          "{inquiry.referenceNote}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={inquiry.status}
                          onChange={e => handleStatusChange(inquiry.id, e.target.value as InquiryStatus)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium border cursor-pointer ${
                            inquiry.status === 'new'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                              : inquiry.status === 'processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : inquiry.status === 'done'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <option value="new">Baru</option>
                          <option value="processing">Diproses</option>
                          <option value="done">Selesai</option>
                          <option value="cancelled">Batal</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedQuotationInquiry(inquiry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 transition-colors text-xs font-semibold"
                          title="Buat / Edit Kalkulasi Penawaran Resmi & HPP"
                        >
                          <Calculator className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {inquiry.quotation
                              ? `Rp ${(inquiry.quotation.finalPrice / 1000000).toFixed(1)}Jt`
                              : '+ Penawaran'}
                          </span>
                        </button>

                        <button
                          onClick={() => setSelectedPdfInquiry(inquiry)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-colors text-xs font-semibold"
                          title="Cetak PDF Aesthetic & Lengkap dengan Nomor Sesi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
                        </button>

                        <a
                          href={`https://wa.me/${inquiry.whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Hubungi Pelanggan via WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-xs font-medium"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB INVENTARIS & STOK KAYU REAL-TIME */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Header Banner Penjelasan Broker SSE */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Boxes className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-base text-white">
                  Ketersediaan Stok Kayu &amp; Siaran Real-Time
                </h3>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                Kelola status ketersediaan dan kubikasi kayu di bawah ini. Setiap perubahan yang disimpan langsung disiarkan via Server-Sent Events (SSE) ke katalog etalase, visualizer 3D, dan form pemesanan secara live tanpa me-refresh halaman.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddWoodModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                <span>Tambah Bahan Kayu Baru</span>
              </button>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs shrink-0 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div className="space-y-0.5">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    <span>Broker SSE Aktif</span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    /api/v1/realtime/stream
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Kartu Editor Stok Tiap Kayu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {woodsList.map(wood => (
              <WoodStockEditorCard
                key={wood.id || wood.slug}
                wood={wood}
                onSave={handleSaveStock}
                onOpenUploadModal={handleOpenUploadModal}
                isUpdating={updatingWoodId === wood.id}
                isSuccess={stockUpdateSuccessId === wood.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ORDER REPORTS (LAPOR PESANAN & KETERLAMBATAN) */}
      {activeTab === 'reports' && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm space-y-4">
          <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Laporan Kendala Pesanan &amp; Keterlambatan Pengiriman
              </h3>
              <p className="text-stone-500 text-xs">
                Pengguna mengirimkan nomor sesi dan berkas PDF pesanan jika pesanan belum sampai atau ada kendala.
              </p>
            </div>
            <button
              onClick={handleExportReportsExcel}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Laporan ke Excel</span>
            </button>
          </div>

          <div className="p-4">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
                <p>Tidak ada laporan kendala pesanan yang aktif.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => {
                  const targetInquiry = safeInquiries.find(i => i.id === report.inquiryId || i.inquiryNumber === report.inquiryNumber);

                  return (
                    <div
                      key={report.id}
                      className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800/80 space-y-3"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                              {report.reportNumber}
                            </span>
                            <span className="text-stone-400">•</span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                              NOMOR SESI: {report.sessionNumber}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Ref: {report.inquiryNumber} • Pelapor: <strong>{report.customerName}</strong> (+{report.whatsappNumber})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            report.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            report.status === 'investigating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {report.status === 'resolved' ? 'Terselesaikan' :
                             report.status === 'investigating' ? 'Sedang Diinvestigasi' :
                             'Menunggu Tindakan Owner'}
                          </span>

                          {targetInquiry && (
                            <button
                              onClick={() => setSelectedPdfInquiry(targetInquiry)}
                              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                              title="Buka Berkas PDF Pesanan Ber-Nomor Sesi"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Lihat PDF Sesi</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-1">
                        <div className="text-stone-500 font-semibold">Uraian Kendala Pelanggan:</div>
                        <p className="text-stone-800 dark:text-stone-200 italic">"{report.description}"</p>
                      </div>

                      {/* Owner Resolution Controls */}
                      {editingReportId === report.id ? (
                        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2 text-xs">
                          <label className="block font-semibold text-stone-800 dark:text-stone-200">
                            Catatan Tindak Lanjut Pemilik (Owner Resolution):
                          </label>
                          <textarea
                            rows={2}
                            value={resolutionText}
                            onChange={e => setResolutionText(e.target.value)}
                            placeholder="Contoh: Kargo telah dicek ke pihak ekspedisi, resi baru no. 88102399 dikirimkan ke pelanggan."
                            className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateReport(report.id, 'investigating')}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                            >
                              Set Investigasi
                            </button>
                            <button
                              onClick={() => handleUpdateReport(report.id, 'resolved')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium"
                            >
                              Tandai Selesai (Resolved)
                            </button>
                            <button
                              onClick={() => setEditingReportId(null)}
                              className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          {report.resolutionNote ? (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              <strong>Tindak lanjut owner:</strong> {report.resolutionNote}
                            </p>
                          ) : (
                            <span className="text-xs text-stone-400">Belum ada catatan penyelesaian</span>
                          )}

                          <button
                            onClick={() => {
                              setEditingReportId(report.id);
                              setResolutionText(report.resolutionNote || '');
                            }}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                          >
                            Tulis Tanggapan / Update Status
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: KAS & PEMBAYARAN (MODUL 2 & 5) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Summary KPI Kas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Total Penerimaan Kas Masuk</span>
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                  cashLedgers.reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block font-mono">
                {cashLedgers.length} transaksi kas tercatat di buku kas
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Pesanan Lunas 100% (Siap Kirim)</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-2">
                {safeInquiries.filter(i => i.paymentRecord?.isSettled).length}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Finansial aman untuk diberangkatkan kargo
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Pesanan DP 50% (Pengiriman Tertahan)</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-2">
                {safeInquiries.filter(i => i.paymentRecord?.paymentPlan === 'dp_50' && !i.paymentRecord?.isSettled).length}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
                Kayu diproses, menunggu pelunasan sisa
              </span>
            </div>
          </div>

          {/* Tabel Manajemen Tagihan & Verifikasi Pembayaran */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Daftar Tagihan &amp; Verifikasi Pembayaran ({safeInquiries.length} pesanan)
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                Sistem Verifikasi Multi-Bank QRIS &amp; VA
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">No. Ref &amp; Pemesan</th>
                    <th className="py-3 px-4">Spesimen &amp; Tujuan</th>
                    <th className="py-3 px-4">Skema &amp; Metode</th>
                    <th className="py-3 px-4">Total &amp; Sisa Tagihan</th>
                    <th className="py-3 px-4">Janji Pelunasan</th>
                    <th className="py-3 px-4">Status &amp; Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {safeInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        Belum ada pesanan aktif
                      </td>
                    </tr>
                  ) : (
                    safeInquiries.map(inquiry => {
                      const pay = inquiry.paymentRecord;
                      const isSettled = pay?.isSettled;
                      const isDpPaid = pay?.isDpPaid;
                      const totalVal = inquiry.quotation?.finalPrice || pay?.totalAmount || 0;

                      return (
                        <tr key={inquiry.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                              {inquiry.inquiryNumber}
                            </div>
                            <div className="font-medium text-stone-700 dark:text-stone-300 mt-0.5">
                              {inquiry.customerName}
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">+{inquiry.whatsappNumber}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-amber-700 dark:text-amber-400">
                              {inquiry.woodTypeName}
                            </div>
                            <span className="text-stone-500 text-[11px]">📍 {inquiry.city}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-900 dark:text-stone-100">
                              {pay?.paymentPlan === 'full' ? 'Lunas Penuh (100%)' : 'Down Payment (50%)'}
                            </div>
                            <span className="text-[10px] font-mono uppercase text-stone-500">
                              Metode: {pay?.method || 'qris'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              Rp {totalVal.toLocaleString('id-ID')}
                            </div>
                            {pay?.paymentPlan === 'dp_50' && !isSettled && (
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                Sisa: Rp {(pay?.remainingAmount ?? (totalVal * 0.5)).toLocaleString('id-ID')}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {pay?.paymentPlan === 'dp_50' ? (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                                {pay?.settlementDueDate || 'Belum diatur'}
                              </span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                            {isSettled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Lunas 100% (Siap Kirim)</span>
                              </span>
                            ) : isDpPaid ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <span>DP 50% Masuk (Pengerjaan Aktif)</span>
                                </span>
                                <div>
                                  <button
                                    onClick={() => {
                                      dbService.verifyPayment(inquiry.id, true);
                                      setDbNotification(`Pelunasan 100% untuk pesanan ${inquiry.inquiryNumber} berhasil diverifikasi!`);
                                      onRefreshData();
                                      loadExtraData();
                                      setTimeout(() => setDbNotification(null), 4500);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Verifikasi Pelunasan 100%
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    dbService.verifyPayment(inquiry.id, false);
                                    setDbNotification(`DP 50% pesanan ${inquiry.inquiryNumber} berhasil diverifikasi!`);
                                    onRefreshData();
                                    loadExtraData();
                                    setTimeout(() => setDbNotification(null), 4500);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Verifikasi DP 50%
                                </button>
                                <button
                                  onClick={() => {
                                    dbService.verifyPayment(inquiry.id, true);
                                    setDbNotification(`Pelunasan 100% pesanan ${inquiry.inquiryNumber} berhasil diverifikasi!`);
                                    onRefreshData();
                                    loadExtraData();
                                    setTimeout(() => setDbNotification(null), 4500);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Verifikasi Lunas
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buku Kas Masuk (Cash Ledger - Modul 5) */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Buku Kas Masuk Atelier (Financial Cash Ledger)
                </h4>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                Pencatatan Otomatis Setiap Penerimaan DP &amp; Pelunasan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Waktu Transaksi</th>
                    <th className="py-2.5 px-3">No. Ref Pesanan</th>
                    <th className="py-2.5 px-3">Kategori Kas</th>
                    <th className="py-2.5 px-3">Nominal Masuk</th>
                    <th className="py-2.5 px-3">Keterangan / Uraian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono text-[11px]">
                  {cashLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400 font-sans">
                        Belum ada catatan arus kas masuk.
                      </td>
                    </tr>
                  ) : (
                    cashLedgers.map((entry) => (
                      <tr key={entry.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="py-2.5 px-3 text-stone-500">
                          {new Date(entry.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-800 dark:text-stone-200">
                          {entry.inquiryNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.type === 'income_settlement'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {entry.type === 'income_settlement' ? 'Pelunasan 100%' : 'Down Payment (DP)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {entry.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 font-sans">
                          {entry.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROGRES & KARGO TRUK (MODUL 1, 3, 4, 5) */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          {/* Header Banner Logistik & Anti-Kabur */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-stone-100">
                  Kendali Pengerjaan Workshop, Legalitas SVLK, &amp; Kargo Truk
                </h3>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl">
                Dokumentasikan foto tahap pengerjaan (oven kiln-dry MC%, perakitan, finishing), sertifikat legalitas SVLK, dan terbitkan surat jalan ekspedisi logistik.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center gap-2 shrink-0">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Klausul Anti-Kabur: Kargo terkunci jika belum lunas 100%</span>
            </div>
          </div>

          {/* Tabel Kontrol Produksi Pesanan */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Status Produksi &amp; Kargo Truk Tiap Pesanan ({safeInquiries.length} data)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">No. Ref &amp; Pemesan</th>
                    <th className="py-3 px-4">Material Kayu</th>
                    <th className="py-3 px-4">Progres Terakhir &amp; MC%</th>
                    <th className="py-3 px-4">Dokumen SVLK</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4 text-right">Aksi Modul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {safeInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        Belum ada pesanan terdaftar
                      </td>
                    </tr>
                  ) : (
                    safeInquiries.map(inquiry => {
                      const pay = inquiry.paymentRecord;
                      const isAntiDefaultLocked = pay?.paymentPlan === 'dp_50' && !pay?.isSettled;
                      const milestones = inquiry.productionMilestones || [];
                      const latestMilestone = milestones[milestones.length - 1];
                      const svlk = inquiry.svlkCertificate;
                      const waybill = inquiry.shipmentWaybill;

                      return (
                        <tr key={inquiry.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                              {inquiry.inquiryNumber}
                            </div>
                            <div className="font-medium text-stone-700 dark:text-stone-300 mt-0.5">
                              {inquiry.customerName}
                            </div>
                            <span className="text-[11px] text-stone-500">📍 {inquiry.city}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-amber-700 dark:text-amber-400">
                              {inquiry.woodTypeName}
                            </div>
                            <span className="text-[11px] text-stone-500 truncate block max-w-[130px]">
                              {inquiry.sizeEstimate}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {latestMilestone ? (
                              <div>
                                <div className="font-semibold text-stone-900 dark:text-stone-100">
                                  {latestMilestone.title}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {latestMilestone.moistureContentMC && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      MC: {latestMilestone.moistureContentMC}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-stone-400">
                                    ({milestones.length} tahap)
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Belum ada dokumentasi foto</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {svlk ? (
                              <div>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
                                  {svlk.certificateNumber}
                                </span>
                                <span className="text-[10px] text-stone-500 truncate block max-w-[150px]">
                                  {svlk.originForestLocation}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Belum terverifikasi</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {waybill ? (
                              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                                <span className="font-bold block">{waybill.carrierName}</span>
                                <span className="font-mono text-[10px]">Resi: {waybill.waybillNumber} ({waybill.truckPlateNumber})</span>
                              </div>
                            ) : isAntiDefaultLocked ? (
                              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                                <span className="font-bold flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Pengiriman Terkunci</span>
                                </span>
                                <span className="text-[10px] block mt-0.5">
                                  Sisa Rp {pay?.remainingAmount.toLocaleString('id-ID')} (Janji: {pay?.settlementDueDate || '-'})
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Izin Kirim Terbuka (Lunas)</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedMilestoneInquiry(inquiry)}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold transition-colors"
                              title="Tambah foto tahapan workshop & kadar air MC%"
                            >
                              + Progres
                            </button>

                            <button
                              onClick={() => setSelectedSvlkInquiry(inquiry)}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors"
                              title="Kelola sertifikat legalitas kayu SVLK"
                            >
                              SVLK
                            </button>

                            <button
                              onClick={() => setSelectedWaybillInquiry(inquiry)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isAntiDefaultLocked
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                              }`}
                              title={isAntiDefaultLocked ? 'Pengiriman ditahan menunggu pelunasan sisa 50%' : 'Terbitkan surat jalan & resi kargo truk'}
                            >
                              <Truck className="w-3.5 h-3.5 inline mr-1" />
                              <span>{waybill ? 'Edit Resi' : 'Kargo Truk'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buku Mutasi Kubikasi Stok (Stock Ledger - Modul 5) */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Buku Mutasi Kubikasi Stok (Stock Ledger)
                </h4>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                Riwayat Pengadaan &amp; Alokasi Kayu Solid
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Spesimen Kayu</th>
                    <th className="py-2.5 px-3">Jenis Mutasi</th>
                    <th className="py-2.5 px-3">Volume (m³)</th>
                    <th className="py-2.5 px-3">Slab</th>
                    <th className="py-2.5 px-3">No. Referensi</th>
                    <th className="py-2.5 px-3">Uraian Alokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono text-[11px]">
                  {stockLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 font-sans">
                        Belum ada mutasi stok tercatat.
                      </td>
                    </tr>
                  ) : (
                    stockLedgers.map((entry) => (
                      <tr key={entry.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="py-2.5 px-3 text-stone-500">
                          {new Date(entry.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-400 font-sans">
                          {entry.woodName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.type === 'inflow'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {entry.type === 'inflow' ? 'Masuk (Inflow)' : 'Keluar (Outflow)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100">
                          {entry.volumeM3.toFixed(1)} m³
                        </td>
                        <td className="py-2.5 px-3">
                          {entry.slabsCount} pcs
                        </td>
                        <td className="py-2.5 px-3 text-stone-500">
                          {entry.referenceId}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 font-sans">
                          {entry.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUD INFRASTRUCTURE & ATLAS ACCESS GUIDANCE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Main Security Card */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl text-stone-100 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-stone-100">
                      Infrastruktur Cloud &amp; Keamanan Basis Data
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Zero-Trust Architecture
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Operasi data mentah dan backup terisolasi aman di MongoDB Atlas Cloud &amp; server terminal Go.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                  title="Buka konsol manajemen cluster MongoDB Atlas resmi"
                >
                  <Database className="w-4 h-4" />
                  <span>Buka Konsol MongoDB Atlas</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Live Status Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800/90 space-y-1.5">
                <span className="text-stone-400 font-medium">Status Engine Cloud:</span>
                <p className="text-stone-100 font-semibold flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    backendInfo.isCloudLive ? 'bg-emerald-400 animate-pulse' :
                    backendInfo.isOnline ? 'bg-amber-400' : 'bg-stone-500'
                  }`}></span>
                  <span className="font-mono text-sm">{backendInfo.engine}</span>
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {backendInfo.isCloudLive
                    ? 'Terhubung aktif ke MongoDB Atlas M0 Cluster dengan enkripsi TLS.'
                    : backendInfo.isOnline
                    ? 'Microservice Go Fiber aktif dengan penyimpanan lokal tangguh.'
                    : 'Penyimpanan lokal browser aktif.'}
                </p>
              </div>

              <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800/90 space-y-1.5">
                <span className="text-stone-400 font-medium">Isolasi Kredensial &amp; Secrets:</span>
                <p className="text-stone-100 font-semibold flex items-center gap-1.5 font-mono">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  backend-go/.env
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  String koneksi, kata sandi, dan token API terisolasi di sisi server dan tidak dapat dibaca oleh publik atau browser.
                </p>
              </div>

              <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800/90 space-y-1.5">
                <span className="text-stone-400 font-medium">Proteksi Akses &amp; Brute-Force:</span>
                <p className="text-stone-100 font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Rate-Limiting Aktif
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Maksimal 3 kali percobaan sandi sebelum penguncian 5 menit diterapkan secara otomatis.
                </p>
              </div>
            </div>

            {/* Owner Operational Separation Notice (Cybersecurity Standard) */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Pemisahan Hak Akses &amp; Pertahanan Siber (Separation of Concerns)</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Demi melindungi bisnis Kayu Nusantara dari ancaman siber (pembajakan sesi, XSS, atau kesalahan klik yang merugikan), tindakan manipulasi database mentah seperti penghapusan koleksi, pemulihan data massal, dan reset pabrik ditiadakan dari browser web.
              </p>
            </div>

            {/* 3 Access Pillars Guidance */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-serif">
                3 Saluran Resmi Akses Basis Data bagi Pemilik Bengkel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h5 className="font-bold text-stone-100">MongoDB Atlas Cloud Console</h5>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Buka <strong className="text-stone-200">cloud.mongodb.com</strong> untuk backup otomatis harian, monitoring throughput IOPS, kuota storage, dan manajemen IP Whitelist dengan 2FA.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h5 className="font-bold text-stone-100">MongoDB Compass (Desktop GUI)</h5>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Gunakan aplikasi desktop resmi MongoDB Compass di laptop Anda untuk menginspeksi, memfilter, dan menyalin data dokumen secara visual tanpa risiko kebocoran browser.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h5 className="font-bold text-stone-100">Microservice Golang Terminal</h5>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Jalankan <code className="text-amber-400 bg-stone-900 px-1 py-0.5 rounded">go run main.go</code> di direktori <code className="text-stone-200">backend-go</code> untuk memantau log lalu lintas RESTful API secara langsung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Audit Trail Log Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 text-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-stone-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Jejak Audit Keamanan Sistem (Security Audit Logs)
              </h3>
              <span className="text-[11px] text-stone-400">{securityLogs.length} aktivitas terekam</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Tipe Aktivitas</th>
                    <th className="p-3">Sumber / IP</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3 text-right">Tingkat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-mono text-[11px]">
                  {securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-500 font-sans">
                        Belum ada jejak audit yang dicatat.
                      </td>
                    </tr>
                  ) : (
                    securityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/40">
                        <td className="p-3 text-stone-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString('id-ID', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit'
                          })}
                        </td>
                        <td className="p-3 font-semibold text-stone-200 whitespace-nowrap">
                          {log.eventType}
                        </td>
                        <td className="p-3 text-stone-400 whitespace-nowrap">{log.ipOrSource}</td>
                        <td className="p-3 text-stone-300 font-sans">{log.details}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            log.severity === 'danger' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            log.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PDF View / Print Modal */}
      {selectedPdfInquiry && (
        <OrderPdfDocument
          inquiry={selectedPdfInquiry}
          onClose={() => setSelectedPdfInquiry(null)}
        />
      )}

      {/* Modal Tambah Spesimen Kayu Baru */}
      <AddWoodModal
        isOpen={isAddWoodModalOpen}
        onClose={() => setIsAddWoodModalOpen(false)}
        onCreated={handleWoodCreated}
      />

      {/* Modal Unggah Foto Spesimen Kayu */}
      <UploadWoodImageModal
        isOpen={isUploadModalOpen}
        wood={uploadTargetWood}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadTargetWood(null);
        }}
        onSuccess={handleImageUploaded}
      />

      {/* Modals 1, 2, 3, 4: Penawaran, Milestone, SVLK, Kargo Truk */}
      {selectedQuotationInquiry && (
        <QuotationModal
          inquiry={selectedQuotationInquiry}
          onClose={() => setSelectedQuotationInquiry(null)}
          onSaved={handleQuotationSaved}
        />
      )}

      {selectedMilestoneInquiry && (
        <MilestoneModal
          inquiry={selectedMilestoneInquiry}
          onClose={() => setSelectedMilestoneInquiry(null)}
          onSaved={handleMilestoneSaved}
        />
      )}

      {selectedSvlkInquiry && (
        <SvlkModal
          inquiry={selectedSvlkInquiry}
          onClose={() => setSelectedSvlkInquiry(null)}
          onSaved={handleSvlkSaved}
        />
      )}

      {selectedWaybillInquiry && (
        <WaybillModal
          inquiry={selectedWaybillInquiry}
          onClose={() => setSelectedWaybillInquiry(null)}
          onSaved={handleWaybillSaved}
        />
      )}

    </div>
  );
};

export const AdminDashboard = OwnerDashboard;
