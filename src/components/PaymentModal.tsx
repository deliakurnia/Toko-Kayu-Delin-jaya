import React, { useState, useEffect, useId } from 'react';
import { Inquiry, PaymentPlanType, PaymentMethodType, PaymentRecord } from '../types';
import { dbService } from '../services/dbService';
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Upload,
  Coins
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onPaymentSuccess?: (updatedInquiry: Inquiry) => void;
}

// Generate aesthetic SVG QR Code Matrix
const AestheticQrSvg: React.FC<{ value: string; size?: number }> = ({ value, size = 200 }) => {
  // Simple deterministic hash to populate QR pattern
  const cells = 25;
  const matrix: boolean[][] = Array(cells).fill(null).map(() => Array(cells).fill(false));

  // Helper finder pattern at 3 corners (7x7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(cells - 7, 0);
  drawFinder(0, cells - 7);

  // Timing lines
  for (let i = 8; i < cells - 8; i += 2) {
    matrix[6][i] = true;
    matrix[i][6] = true;
  }

  // Populate data dots based on string value
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Skip finder zones
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= cells - 8;
      const isBottomLeft = r >= cells - 8 && c < 8;
      if (!isTopLeft && !isTopRight && !isBottomLeft) {
        const seed = Math.sin(hash + r * 13 + c * 37) * 10000;
        if ((seed - Math.floor(seed)) > 0.52) {
          matrix[r][c] = true;
        }
      }
    }
  }

  const cellSize = size / cells;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl">
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.2}
              height={cellSize - 0.2}
              fill="#1c1917"
              rx={cellSize > 6 ? 1 : 0}
            />
          ) : null
        )
      )}
      {/* Center Logo Badge */}
      <circle cx={size / 2} cy={size / 2} r={cellSize * 2.2} fill="#ffffff" />
      <circle cx={size / 2} cy={size / 2} r={cellSize * 1.7} fill="#d97706" />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize={cellSize * 1.5}
        fontWeight="bold"
        fill="#ffffff"
        fontFamily="sans-serif"
      >
        KN
      </text>
    </svg>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onPaymentSuccess
}) => {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanType>('dp_50');
  const [method, setMethod] = useState<PaymentMethodType>('qris');
  const [settlementDueDate, setSettlementDueDate] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 menit
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSandboxGuide, setShowSandboxGuide] = useState(false);
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeVaBank, setActiveVaBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri'>('bca');
  const [expandedBankFaq, setExpandedBankFaq] = useState<string | null>('m_banking');

  // Kalkulasi total & DP
  const totalAmount = inquiry.quotation?.finalPrice || (inquiry.paymentRecord?.totalAmount ?? 25000000);
  const dpAmount = Math.round(totalAmount * 0.5);
  const remainingAmount = totalAmount - dpAmount;

  // Tanggal default settlement: 14 hari dari hari ini
  useEffect(() => {
    if (!settlementDueDate) {
      const target = new Date();
      target.setDate(target.getDate() + 14);
      setSettlementDueDate(target.toISOString().slice(0, 10));
    }
  }, []);

  // Countdown timer 15:00
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate nomor VA unik per bank
  const numericId = inquiry.inquiryNumber.replace(/[^0-9]/g, '').slice(-6) || '260825';
  const vaNumbers = {
    bca: `12988${numericId}`,
    mandiri: `88012${numericId}`,
    bni: `98811${numericId}`,
    bri: `10234${numericId}`
  };

  const activeNominal = paymentPlan === 'full' ? totalAmount : dpAmount;
  const uniqueCode = inquiry.paymentRecord?.uniqueCode || 419;
  const exactPaymentNominal = activeNominal + uniqueCode;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Submit atau simulasi pembayaran
  const handleExecutePayment = (isSimulatedSuccess: boolean) => {
    setErrorMessage(null);

    if (paymentPlan === 'dp_50' && !settlementDueDate) {
      setErrorMessage('Harap pilih Target Tanggal Pelunasan untuk skema Down Payment (DP 50%).');
      return;
    }

    setIsSimulating(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const updatedPayment: PaymentRecord = {
        id: inquiry.paymentRecord?.id || `PAY-${inquiry.inquiryNumber}`,
        inquiryId: inquiry.id,
        inquiryNumber: inquiry.inquiryNumber,
        paymentPlan,
        method,
        totalAmount,
        dpAmount,
        remainingAmount: paymentPlan === 'full' ? 0 : remainingAmount,
        settlementDueDate: paymentPlan === 'dp_50' ? settlementDueDate : undefined,
        isDpPaid: isSimulatedSuccess,
        dpPaidAt: isSimulatedSuccess ? now : undefined,
        isSettled: isSimulatedSuccess && paymentPlan === 'full',
        settledAt: isSimulatedSuccess && paymentPlan === 'full' ? now : undefined,
        virtualAccountNumber: method !== 'qris' ? vaNumbers[activeVaBank] : undefined,
        uniqueCode,
        status: isSimulatedSuccess
          ? (paymentPlan === 'full' ? 'settled' : 'dp_paid')
          : 'pending',
        verifiedByOwner: isSimulatedSuccess,
        verifiedAt: isSimulatedSuccess ? now : undefined
      };

      const updatedInq = dbService.savePaymentRecord(inquiry.id, updatedPayment);

      if (isSimulatedSuccess && updatedInq) {
        dbService.verifyPayment(inquiry.id, paymentPlan === 'full');
        setSuccessMessage(
          paymentPlan === 'full'
            ? 'Pembayaran Lunas 100% Berhasil! Pesanan diprioritaskan dan siap dikirim setelah pengerjaan selesai.'
            : `DP 50% Berhasil Diterima! Pengerjaan dimulai di workshop. Kayu akan siap dikirim segera setelah Anda melunasi sisa tagihan pada tanggal ${settlementDueDate}.`
        );
      } else {
        setSuccessMessage('Tagihan pembayaran berhasil disimpan. Anda dapat menyelesaikan transfer sesuai panduan.');
      }

      setIsSimulating(false);
      if (onPaymentSuccess && updatedInq) {
        onPaymentSuccess(updatedInq);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 ring-1 ring-black/5 dark:ring-white/10 p-2 rounded-3xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl">
        <div className="rounded-[calc(1.5rem-0.25rem)] bg-stone-900 border border-stone-800 p-6 sm:p-8 text-stone-100 space-y-6">
          
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Gerbang Pembayaran Resmi Atelier
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Ref: {inquiry.inquiryNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
                Pembayaran &amp; Konfirmasi Pesanan
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Spesimen {inquiry.woodTypeName} • Tujuan Kirim: {inquiry.city}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {successMessage ? (
            <div className="p-6 bg-emerald-950/70 border border-emerald-600/60 rounded-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-7 h-7 shrink-0" />
                <div>
                  <h3 className="font-bold text-base text-emerald-200">
                    Konfirmasi Pembayaran Sukses!
                  </h3>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    {successMessage}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-950/60 rounded-xl border border-emerald-800/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">Skema Pembayaran:</span>
                  <span className="font-semibold text-stone-200">
                    {paymentPlan === 'full' ? 'Lunas Penuh (100%)' : 'Down Payment (DP 50%)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Nominal Diterima:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupiah(exactPaymentNominal)}
                  </span>
                </div>
                {paymentPlan === 'dp_50' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Sisa Tagihan Pelunasan:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {formatRupiah(remainingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Target Tanggal Pelunasan:</span>
                      <span className="font-semibold text-stone-200">{settlementDueDate}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Kayu Anda saat ini tersimpan aman di workshop kami untuk proses produksi. Sesuai kesepakatan, pengiriman akan diberangkatkan begitu sisa tagihan dilunasi.
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Kembali ke Portal Pemesan
              </button>
            </div>
          ) : (
            <>
              {/* SKEMA 1: PILIHAN PEMBAYARAN (DP 50% vs LUNAS 100%) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    1. Pilih Skema Pembayaran
                  </label>
                  <span className="text-[11px] text-amber-400 font-medium">
                    Total Nilai Proyek: {formatRupiah(totalAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card Opsi DP 50% */}
                  <div
                    onClick={() => setPaymentPlan('dp_50')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      paymentPlan === 'dp_50'
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Paling Fleksibel
                        </span>
                        <h4 className="font-bold text-sm text-stone-100 mt-2">
                          Down Payment (DP 50%)
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Pengerjaan langsung dimulai di oven &amp; workshop.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentPlan === 'dp_50' ? 'border-amber-500 bg-amber-500 text-stone-950' : 'border-stone-600'
                      }`}>
                        {paymentPlan === 'dp_50' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-baseline justify-between">
                      <span className="text-xs text-stone-400">Bayar Sekarang:</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {formatRupiah(dpAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Card Opsi Lunas Penuh 100% */}
                  <div
                    onClick={() => setPaymentPlan('full')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      paymentPlan === 'full'
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Bebas Khawatir
                        </span>
                        <h4 className="font-bold text-sm text-stone-100 mt-2">
                          Pelunasan Penuh (100%)
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Prioritas pengerjaan &amp; langsung kirim saat selesai.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentPlan === 'full' ? 'border-emerald-500 bg-emerald-500 text-stone-950' : 'border-stone-600'
                      }`}>
                        {paymentPlan === 'full' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-baseline justify-between">
                      <span className="text-xs text-stone-400">Bayar Sekarang:</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KLAUSUL ANTI-KABUR: TARGET TANGGAL PELUNASAN JIKA PILIH DP */}
                {paymentPlan === 'dp_50' && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-300">Klausul Keamanan Anti-Default Atelier:</strong>
                        <p className="mt-0.5">
                          Kayu yang telah di-DP akan langsung dipotong dan dimasukkan ke oven pengering. Namun demi keamanan kedua pihak, <strong>kayu tidak akan dikirim ke alamat Anda</strong> sebelum pelunasan sisa 50% (Rp {remainingAmount.toLocaleString('id-ID')}) diselesaikan.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kapan Anda berencana melunasi sisa tagihan?</span>
                      </label>

                      <input
                        type="date"
                        value={settlementDueDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={e => setSettlementDueDate(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-700/60 text-xs font-semibold text-stone-100 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SKEMA 2: PILIHAN METODE BAYAR (QRIS vs VIRTUAL ACCOUNT) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    2. Pilih Metode Pembayaran
                  </label>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sisa Waktu: {formatTimer(timeLeft)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('qris')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      method === 'qris'
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QRIS / QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bca_va')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      method !== 'qris'
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Virtual Account Bank</span>
                  </button>
                </div>

                {/* TAMPILAN JIKA METODE = QRIS */}
                {method === 'qris' && (
                  <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Dynamic QRIS Canvas / SVG */}
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-stone-300 flex flex-col items-center shrink-0">
                        <div className="w-full flex items-center justify-between px-1 mb-1">
                          <span className="text-[10px] font-bold text-stone-900 tracking-wider">QRIS</span>
                          <span className="text-[9px] font-mono text-stone-500">NMID: ID10200482910</span>
                        </div>

                        <AestheticQrSvg value={`00020101021226${exactPaymentNominal}KNUSANTARA`} size={180} />

                        <p className="text-[10px] font-semibold text-stone-800 mt-1 text-center">
                          TOKO KAYU DELIN JAYA
                        </p>
                      </div>

                      {/* Detail Instruksi QRIS */}
                      <div className="space-y-3 flex-1 text-xs">
                        <div>
                          <span className="text-stone-400">Total Pembayaran Persis:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl font-bold font-mono text-amber-400">
                              {formatRupiah(exactPaymentNominal)}
                            </span>
                            <button
                              onClick={() => handleCopy(exactPaymentNominal.toString(), 'nominal')}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                              title="Salin Nominal"
                            >
                              {copiedField === 'nominal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                            *Termasuk 3 digit kode verifikasi otomatis ({uniqueCode})
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 space-y-1">
                          <p className="font-semibold text-stone-200">Dapat di-scan dengan seluruh aplikasi:</p>
                          <p className="text-stone-400">
                            BCA Mobile, Livin' Mandiri, BRImo, BNI Mobile, GoPay, OVO, Dana, ShopeePay, LinkAja.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              alert('Gambar QRIS berhasil diunduh ke perangkat Anda. Buka aplikasi e-wallet Anda dan pilih "Scan dari Galeri".');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Unduh Kode QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAMPILAN JIKA METODE = VIRTUAL ACCOUNT */}
                {method !== 'qris' && (
                  <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4 animate-in fade-in">
                    {/* Pilihan 4 Bank Besar */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'bca', name: 'BCA VA' },
                        { id: 'mandiri', name: 'Mandiri VA' },
                        { id: 'bni', name: 'BNI VA' },
                        { id: 'bri', name: 'BRI VA' }
                      ].map(bank => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setActiveVaBank(bank.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            activeVaBank === bank.id
                              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>

                    {/* Kotak Nomor VA */}
                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                      <div>
                        <span className="text-[11px] font-medium text-stone-400">
                          Nomor Virtual Account {activeVaBank.toUpperCase()}:
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xl font-mono font-bold text-amber-400 tracking-wider">
                            {vaNumbers[activeVaBank]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(vaNumbers[activeVaBank], 'va')}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedField === 'va' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin Nomor</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                        <span className="text-stone-400">Jumlah Nominal Tagihan:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-100">
                            {formatRupiah(exactPaymentNominal)}
                          </span>
                          <button
                            onClick={() => handleCopy(exactPaymentNominal.toString(), 'nominal')}
                            className="p-1 rounded bg-stone-800 text-stone-400 hover:text-stone-200"
                            title="Salin Nominal"
                          >
                            {copiedField === 'nominal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Petunjuk Transfer Singkat */}
                    <div className="text-[11px] text-stone-400 space-y-1">
                      <p className="font-semibold text-stone-300">Petunjuk Transfer m-Banking {activeVaBank.toUpperCase()}:</p>
                      <p>1. Buka aplikasi m-Banking Anda, pilih menu <strong>Transfer &gt; Virtual Account</strong>.</p>
                      <p>2. Masukkan nomor VA di atas ({vaNumbers[activeVaBank]}).</p>
                      <p>3. Pastikan nama penerima tertera <strong>DELIN JAYA - {inquiry.customerName}</strong>.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ACTION BUTTONS & SIMULATOR */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Tombol Simpan Tagihan Manual */}
                  <button
                    type="button"
                    onClick={() => handleExecutePayment(false)}
                    disabled={isSimulating}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Simpan &amp; Bayar Nanti via m-Banking
                  </button>

                  {/* Tombol Simulasi Pembayaran Sandbox (Instan) */}
                  <button
                    type="button"
                    onClick={() => handleExecutePayment(true)}
                    disabled={isSimulating}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSimulating ? (
                      <span>Memproses Verifikasi...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Simulasi Bayar Berhasil (Sandbox)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Link: Panduan Midtrans & Xendit Gratis */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Sistem proteksi transaksi 256-bit TLS</span>
                  <button
                    type="button"
                    onClick={() => setShowSandboxGuide(!showSandboxGuide)}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Cara Pasang Midtrans/Xendit Gratis?</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Panduan Drawer Midtrans / Xendit Sandbox */}
                {showSandboxGuide && (
                  <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/40 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>Panduan Setup Midtrans &amp; Xendit Sandbox (100% Gratis):</span>
                      <button onClick={() => setShowSandboxGuide(false)} className="text-stone-400 hover:text-stone-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-stone-300">
                      Midtrans dan Xendit menyediakan <strong>Sandbox Environment yang 100% GRATIS tanpa biaya bulanan</strong>, tanpa minimum saldo, dan tanpa deposit untuk pengujian integrasi payment gateway.
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-stone-400 text-[11px]">
                      <li>Buka situs resmi <strong>dashboard.midtrans.com</strong> atau <strong>dashboard.xendit.co</strong> lalu klik "Daftar Akun".</li>
                      <li>Pilih mode <strong>Sandbox / Environment Testing</strong> di pojok kiri atas.</li>
                      <li>Salin <strong>Server Key</strong> dan <strong>Client Key</strong> yang tertera.</li>
                      <li>Masukkan ke berkas konfigurasi <code className="text-amber-300 font-mono">backend-go/.env</code> pada baris <code className="text-amber-300 font-mono">MIDTRANS_SERVER_KEY=...</code>.</li>
                      <li>Untuk pembayaran nyata (Production), Midtrans/Xendit hanya memotong biaya per transaksi sukses (tanpa biaya langganan bulanan).</li>
                    </ol>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
