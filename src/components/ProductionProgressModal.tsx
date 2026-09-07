import React from 'react';
import { Inquiry, ProductionMilestone, ProductionStage } from '../types';
import {
  X,
  CheckCircle2,
  Clock,
  Flame,
  Wrench,
  Sparkles,
  Truck,
  ShieldCheck,
  FileText,
  Lock,
  ExternalLink,
  MapPin,
  Camera,
  Layers,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface ProductionProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onOpenPaymentModal?: () => void;
}

const STAGES_ORDER: { key: ProductionStage; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'raw_log_selection', label: '1. Pemilihan Balok Kayu Legal', icon: Layers },
  { key: 'sawmill_cutting', label: '2. Pembelahan Slab (Sawmill)', icon: Wrench },
  { key: 'kiln_dry', label: '3. Pengeringan Oven Kiln-Dry (MC 10-12%)', icon: Flame },
  { key: 'woodworking', label: '4. Konstruksi & Perakitan Sambungan', icon: Activity },
  { key: 'finishing', label: '5. Finishing Natural Oil / Doff', icon: Sparkles },
  { key: 'quality_control', label: '6. Quality Control & Audit SVLK', icon: ShieldCheck },
  { key: 'ready_to_ship', label: '7. Siap Muat Kargo Truk', icon: Truck },
];

export const ProductionProgressModal: React.FC<ProductionProgressModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onOpenPaymentModal
}) => {
  if (!isOpen) return null;

  const milestones = inquiry.productionMilestones || [];
  const svlk = inquiry.svlkCertificate;
  const waybill = inquiry.shipmentWaybill;
  const payment = inquiry.paymentRecord;

  const isDpOnly = payment?.paymentPlan === 'dp_50' && !payment?.isSettled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 sm:p-8 text-stone-100 space-y-6">
          
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Activity className="w-3.5 h-3.5" />
                  Live Atelier Production &amp; Legal Chain
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Sesi: {inquiry.sessionNumber || inquiry.inquiryNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
                Pantau Progres Pengerjaan &amp; Legalitas SVLK
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {inquiry.woodTypeName} • Pesanan: {inquiry.customerName} ({inquiry.city})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STATUS KLAUSUL ANTI-KABUR & PENGIRIMAN */}
          {isDpOnly ? (
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-600/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Status Pengiriman: Tertahan (Menunggu Pelunasan 100%)
                  </h4>
                  <p className="text-xs text-amber-300/90 mt-0.5">
                    Pesanan Anda telah di-DP 50% dan saat ini sedang aktif dikerjakan di workshop. Sesuai kesepakatan, <strong>barang akan dikirim segera setelah Anda melunasi sisa Rp {payment?.remainingAmount.toLocaleString('id-ID')}</strong> (Janji Pelunasan: {payment?.settlementDueDate || '-'}).
                  </p>
                </div>
              </div>

              {onOpenPaymentModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shrink-0 transition-colors cursor-pointer"
                >
                  Lunasi Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-600/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-emerald-300">
                  Status Finansial: Lunas Penuh (100%)
                </h4>
                <p className="text-emerald-400/90 mt-0.5">
                  Pesanan telah lunas. Pengiriman kargo truk akan langsung diberangkatkan ke lokasi Anda tanpa ada kendala tagihan lagi.
                </p>
              </div>
            </div>
          )}

          {/* DUA KOLOM: TIMELINE PROGRES & SERTIFIKAT SVLK / RESI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI (2/3): TIMELINE TAHAPAN PRODUKSI DENGAN FOTO */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Tahapan Pengerjaan &amp; Pengeringan Oven</span>
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">
                  {milestones.length} Tahap Terdokumentasi
                </span>
              </div>

              {milestones.length === 0 ? (
                <div className="p-8 rounded-2xl bg-stone-950/60 border border-stone-800 text-center space-y-2">
                  <Clock className="w-8 h-8 text-stone-600 mx-auto" />
                  <p className="text-xs text-stone-400">
                    Pengerjaan pesanan sedang dijadwalkan oleh kepala pengrajin atelier. Foto tahap awal akan diunggah segera setelah pemotongan bahan dimulai.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-stone-100">{m.title}</h4>
                            <p className="text-[11px] text-stone-400">
                              Dicatat oleh: <span className="text-stone-300 font-medium">{m.updatedBy}</span> • {new Date(m.recordedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {/* Moisture Content Meter Badge */}
                        {m.moistureContentMC && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 shrink-0 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-blue-400" />
                            <span>MC: {m.moistureContentMC}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-300 leading-relaxed pl-8">
                        {m.description}
                      </p>

                      {/* Foto Dokumentasi Aktual Workshop */}
                      {m.photos && m.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-8 pt-1">
                          {m.photos.map((photoUrl, pIdx) => (
                            <a
                              key={pIdx}
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group relative rounded-xl overflow-hidden border border-stone-800 aspect-video block"
                            >
                              <img
                                src={photoUrl}
                                alt={`Foto ${m.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-4 h-4 text-white" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KOLOM KANAN (1/3): SERTIFIKAT SVLK & EKSPEDISI KARGO */}
            <div className="space-y-4">
              
              {/* Box 1: Sertifikat Legalitas Kayu SVLK (Modul 3) */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                    Sertifikasi Legalitas (SVLK)
                  </h4>
                </div>

                {svlk ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-500">Nomor Registrasi SVLK:</span>
                      <p className="font-mono font-bold text-amber-400 text-sm">
                        {svlk.certificateNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500">Titik Konsesi Hutan Lestari:</span>
                      <p className="text-stone-300 font-medium flex items-start gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{svlk.originForestLocation}</span>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-800 flex justify-between text-[11px]">
                      <span className="text-stone-500">Verifikasi Terakhir:</span>
                      <span className="text-stone-400">{svlk.verifiedDate}</span>
                    </div>

                    {svlk.vLegalDocUrl && (
                      <a
                        href={svlk.vLegalDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Cek Keabsahan V-Legal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    Data SVLK sedang diverifikasi bersama Perhutani saat log tiba di workshop.
                  </p>
                )}
              </div>

              {/* Box 2: Surat Jalan & Resi Kargo Truk (Modul 4) */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                    Ekspedisi &amp; Resi Kargo Truk
                  </h4>
                </div>

                {waybill ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-500">Ekspedisi Pengangkut:</span>
                      <p className="font-semibold text-stone-200 text-sm">
                        {waybill.carrierName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500">Nomor Resi / AWB:</span>
                      <p className="font-mono font-bold text-amber-400 text-sm">
                        {waybill.waybillNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500">Plat Nomor Armada Truk:</span>
                      <p className="font-mono font-medium text-stone-300">
                        {waybill.truckPlateNumber}
                      </p>
                    </div>
                    {waybill.driverName && (
                      <div>
                        <span className="text-[11px] text-stone-500">Pengemudi:</span>
                        <p className="text-stone-300">
                          {waybill.driverName} {waybill.driverPhone ? `(${waybill.driverPhone})` : ''}
                        </p>
                      </div>
                    )}
                    {waybill.estimatedArrival && (
                      <div className="pt-2 border-t border-stone-800 flex justify-between text-[11px]">
                        <span className="text-stone-500">Estimasi Tiba:</span>
                        <span className="text-stone-300 font-semibold">{waybill.estimatedArrival}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-500">
                      {isDpOnly
                        ? 'Surat jalan belum diterbitkan. Menunggu pelunasan 100% sebelum kargo diberangkatkan.'
                        : 'Barang sedang dipersiapkan untuk muat ke armada truk ekspedisi.'}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
