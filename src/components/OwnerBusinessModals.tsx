import React, { useState, useEffect } from 'react';
import {
  Inquiry,
  CostBreakdown,
  ProductionMilestone,
  ProductionStage,
  SVLKCertificate,
  ShipmentWaybill
} from '../types';
import {
  X,
  Calculator,
  Save,
  Activity,
  Flame,
  Camera,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  MapPin,
  FileText
} from 'lucide-react';

// =========================================================================
// 1. MODAL KALKULATOR PENAWARAN HARGA RESMI (MODUL 2)
// =========================================================================
interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onSaved: (quote: CostBreakdown) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onSaved
}) => {
  const existing = inquiry.quotation;
  const [rawWoodCost, setRawWoodCost] = useState<number>(existing?.rawWoodCost ?? 15000000);
  const [kilnDryCost, setKilnDryCost] = useState<number>(existing?.kilnDryCost ?? 2000000);
  const [craftsmanshipCost, setCraftsmanshipCost] = useState<number>(existing?.craftsmanshipCost ?? 3500000);
  const [finishingCost, setFinishingCost] = useState<number>(existing?.finishingCost ?? 1500000);
  const [shippingCost, setShippingCost] = useState<number>(existing?.shippingCost ?? 1200000);
  const [notes, setNotes] = useState<string>(existing?.notes ?? `Kayu ${inquiry.woodTypeName} kualitas grade A kering oven.`);

  const calculatedFinal = rawWoodCost + kilnDryCost + craftsmanshipCost + finishingCost + shippingCost;
  const dp50 = Math.round(calculatedFinal * 0.5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quote: CostBreakdown = {
      rawWoodCost,
      kilnDryCost,
      craftsmanshipCost,
      finishingCost,
      shippingCost,
      finalPrice: calculatedFinal,
      notes,
      quotedAt: new Date().toISOString()
    };
    onSaved(quote);
    onClose();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 text-stone-100 space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Calculator className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Kalkulator Penawaran &amp; Rincian HPP
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Pesanan {inquiry.inquiryNumber} • {inquiry.customerName} ({inquiry.woodTypeName})
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">1. Biaya Bahan Baku Kayu (Rp):</label>
                <input
                  type="number"
                  step="100000"
                  value={rawWoodCost}
                  onChange={e => setRawWoodCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">2. Biaya Oven Kiln-Dry (Rp):</label>
                <input
                  type="number"
                  step="100000"
                  value={kilnDryCost}
                  onChange={e => setKilnDryCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">3. Ongkos Pengrajin / Craft (Rp):</label>
                <input
                  type="number"
                  step="100000"
                  value={craftsmanshipCost}
                  onChange={e => setCraftsmanshipCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">4. Biaya Finishing &amp; Coating (Rp):</label>
                <input
                  type="number"
                  step="100000"
                  value={finishingCost}
                  onChange={e => setFinishingCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">5. Estimasi Kargo Truk ke {inquiry.city} (Rp):</label>
              <input
                type="number"
                step="50000"
                value={shippingCost}
                onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Catatan Spesifikasi untuk Pelanggan:</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200"
              />
            </div>

            {/* Rekap Total & Tagihan DP */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-400 font-semibold">Total Nilai Penawaran Resmi:</span>
                <span className="font-mono font-bold text-emerald-400 text-lg">{formatRupiah(calculatedFinal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-amber-300 pt-1 border-t border-stone-800/80">
                <span>Nilai DP 50% yang akan ditagihkan:</span>
                <span className="font-mono font-bold">{formatRupiah(dp50)}</span>
              </div>
              <p className="text-[10px] text-stone-500 italic">
                *Penawaran ini otomatis disinkronkan ke portal akun pemesan dengan opsi pembayaran QRIS dan Virtual Account.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Terbitkan Penawaran Resmi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MODAL DOKUMENTASI TAHAPAN PRODUKSI BERFOTO & KADAR AIR (MODUL 1)
// =========================================================================
interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onSaved: (milestone: Omit<ProductionMilestone, 'id' | 'recordedAt'>) => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onSaved
}) => {
  const [stage, setStage] = useState<ProductionStage>('kiln_dry');
  const [title, setTitle] = useState<string>('Pengeringan Oven Kiln-Dry (MC 11%)');
  const [description, setDescription] = useState<string>('Kayu dimasukkan ke ruang oven pengering bersuhu stabil selama 14 hari.');
  const [moistureContentMC, setMoistureContentMC] = useState<string>('11.4%');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80');
  const [updatedBy, setUpdatedBy] = useState<string>('Kepala Workshop Atelier');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaved({
      inquiryId: inquiry.id,
      stage,
      title,
      description,
      photos: photoUrl ? [photoUrl] : [],
      moistureContentMC: moistureContentMC || undefined,
      updatedBy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 text-stone-100 space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Dokumentasi Tahap Produksi &amp; MC%
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Inquiry: {inquiry.inquiryNumber} ({inquiry.woodTypeName})
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Pilih Tahapan Pengerjaan:</label>
              <select
                value={stage}
                onChange={e => {
                  const val = e.target.value as ProductionStage;
                  setStage(val);
                  if (val === 'raw_log_selection') {
                    setTitle('Pemilihan Balok Kayu Legal Grade A');
                    setDescription('Kayu log diamankan dari konsesi lestari, minim cacat dan serat terpilih.');
                  } else if (val === 'sawmill_cutting') {
                    setTitle('Pembelahan Slab Sawmill Presisi');
                    setDescription('Pembelahan log menjadi bilah slab utuh sesuai ketebalan yang diinginkan.');
                  } else if (val === 'kiln_dry') {
                    setTitle('Pengeringan Oven Kiln-Dry (MC 11%)');
                    setDescription('Proses pengeringan oven menurunkan kadar air agar struktur kayu stabil.');
                  } else if (val === 'woodworking') {
                    setTitle('Konstruksi & Perakitan Sambungan Purus');
                    setDescription('Pengerjaan mekanis purus dan penyatuan komponen furniture kustom.');
                  } else if (val === 'finishing') {
                    setTitle('Finishing Natural Oil / Doff Lapisan Akhir');
                    setDescription('Aplikasi lapisan pelindung transparan untuk menonjolkan serat eksotis kayu.');
                  } else if (val === 'quality_control') {
                    setTitle('Quality Control & Uji Kalibrasi SVLK');
                    setDescription('Inspeksi toleransi dimensi, kadar air akhir, dan kelayakan sertifikat kayu.');
                  } else if (val === 'ready_to_ship') {
                    setTitle('Pengepakan Pallet Kayu & Siap Muat Truk');
                    setDescription('Kayu dibungkus pallet kayu protektif, siap dijemput armada kargo truk.');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
              >
                <option value="raw_log_selection">1. Pemilihan Balok Kayu Legal</option>
                <option value="sawmill_cutting">2. Pembelahan Slab (Sawmill)</option>
                <option value="kiln_dry">3. Pengeringan Oven Kiln-Dry (MC 10-12%)</option>
                <option value="woodworking">4. Konstruksi &amp; Perakitan Sambungan</option>
                <option value="finishing">5. Finishing Natural Oil / Doff</option>
                <option value="quality_control">6. Quality Control &amp; Sertifikasi SVLK</option>
                <option value="ready_to_ship">7. Siap Muat Kargo Truk</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Judul Tahapan:</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Kadar Air Kayu (MC %):</label>
                <input
                  type="text"
                  value={moistureContentMC}
                  onChange={e => setMoistureContentMC(e.target.value)}
                  placeholder="e.g. 11.2%"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-blue-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nama Petugas Workshop:</label>
                <input
                  type="text"
                  value={updatedBy}
                  onChange={e => setUpdatedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Deskripsi Pengerjaan:</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">URL Foto Bukti Workshop:</label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Simpan Progres Produksi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. MODAL SERTIFIKAT LEGALITAS KAYU SVLK & V-LEGAL (MODUL 3)
// =========================================================================
interface SvlkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onSaved: (cert: SVLKCertificate) => void;
}

export const SvlkModal: React.FC<SvlkModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onSaved
}) => {
  const existing = inquiry.svlkCertificate;
  const [certNum, setCertNum] = useState(existing?.certificateNumber || `00${Math.floor(10 + Math.random() * 89)}/SVLK-PHPL/JPR/2026`);
  const [location, setLocation] = useState(existing?.originForestLocation || 'KPH Blora, Petak 42A, Jawa Tengah (Perhutani)');
  const [vLegalUrl, setVLegalUrl] = useState(existing?.vLegalDocUrl || 'https://silk.menlhk.go.id/verify/svlk-official');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaved({
      certificateNumber: certNum,
      originForestLocation: location,
      vLegalDocUrl: vLegalUrl,
      verifiedDate: new Date().toISOString().slice(0, 10)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 text-stone-100 space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Sertifikat Legalitas SVLK &amp; V-Legal
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Inquiry: {inquiry.inquiryNumber} ({inquiry.woodTypeName})
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Nomor Registrasi Sertifikat SVLK:</label>
              <input
                type="text"
                value={certNum}
                onChange={e => setCertNum(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Titik Konsesi Tebang / Asal Hutan:</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Tautan Verifikasi SILK / V-Legal:</label>
              <input
                type="url"
                value={vLegalUrl}
                onChange={e => setVLegalUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Simpan Dokumen SVLK</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. MODAL SURAT JALAN & RESI KARGO TRUK (MODUL 4) DENGAN PENEGAKAN ANTI-KABUR
// =========================================================================
interface WaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onSaved: (waybill: ShipmentWaybill) => void;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onSaved
}) => {
  const existing = inquiry.shipmentWaybill;
  const [carrierName, setCarrierName] = useState(existing?.carrierName || 'Dakota Cargo Logistik');
  const [truckPlateNumber, setTruckPlateNumber] = useState(existing?.truckPlateNumber || 'K 8912 DA');
  const [driverName, setDriverName] = useState(existing?.driverName || 'Bambang Supriyanto');
  const [driverPhone, setDriverPhone] = useState(existing?.driverPhone || '081234998877');
  const [waybillNumber, setWaybillNumber] = useState(existing?.waybillNumber || `DKT-${Date.now().toString().slice(-6)}`);
  const [estimatedArrival, setEstimatedArrival] = useState(existing?.estimatedArrival || '3 - 5 Hari Kerja');

  if (!isOpen) return null;

  const payment = inquiry.paymentRecord;
  const isAntiDefaultLocked = payment?.paymentPlan === 'dp_50' && !payment?.isSettled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAntiDefaultLocked) return;

    onSaved({
      inquiryId: inquiry.id,
      carrierName,
      truckPlateNumber,
      driverName,
      driverPhone,
      waybillNumber,
      estimatedArrival,
      isDelivered: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 text-stone-100 space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                  <Truck className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Surat Jalan &amp; Resi Kargo Truk
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Tujuan: {inquiry.city} • Pemesan: {inquiry.customerName}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PERINGATAN KLAUSUL ANTI-KABUR JIKA BELUM LUNAS */}
          {isAntiDefaultLocked ? (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 space-y-2 text-xs text-rose-200">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                <Lock className="w-4 h-4" />
                <span>Penerbitan Pengiriman Terkunci (Anti-Default Protection)</span>
              </div>
              <p>
                Pelanggan baru menyelesaikan <strong>Down Payment (DP 50%)</strong> dan memiliki sisa tagihan sebesar{' '}
                <strong className="text-amber-300">Rp {payment?.remainingAmount.toLocaleString('id-ID')}</strong> (Target Janji Pelunasan: {payment?.settlementDueDate || '-'}).
              </p>
              <p className="text-[11px] text-rose-300/80">
                Sesuai SOP keamanan atelier, kayu aman disimpan di workshop dan <strong>dilarang keras dimuat ke truk ekspedisi</strong> sebelum pelunasan 100% diverifikasi.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Finansial Lunas Penuh (100%). Izin pemuatan kargo truk disetujui!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nama Ekspedisi Kargo Truk:</label>
                <select
                  value={carrierName}
                  onChange={e => setCarrierName(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 disabled:opacity-50"
                >
                  <option value="Dakota Cargo Logistik">Dakota Cargo Logistik</option>
                  <option value="Indah Logistik Cargo">Indah Logistik Cargo</option>
                  <option value="Baraka Sarana Tama">Baraka Sarana Tama</option>
                  <option value="Armada Truk Khusus Atelier">Armada Truk Khusus Atelier (Dedicated)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nomor Resi / AWB:</label>
                <input
                  type="text"
                  value={waybillNumber}
                  onChange={e => setWaybillNumber(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Plat Nomor Truk:</label>
                <input
                  type="text"
                  value={truckPlateNumber}
                  onChange={e => setTruckPlateNumber(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Estimasi Hari Tiba:</label>
                <input
                  type="text"
                  value={estimatedArrival}
                  onChange={e => setEstimatedArrival(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nama Supir Armada:</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nomor HP / WA Supir:</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  disabled={isAntiDefaultLocked}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isAntiDefaultLocked}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isAntiDefaultLocked ? 'Pengiriman Ditahan (Belum Lunas)' : 'Terbitkan Surat Jalan & Berangkatkan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
