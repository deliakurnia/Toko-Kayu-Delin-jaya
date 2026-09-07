import React from 'react';
import { Inquiry } from '../types';
import { Printer, Download, CheckCircle2, ShieldCheck, X, FileText, Send } from 'lucide-react';
import { OWNER_WHATSAPP_NUMBER } from '../services/dbService';

interface OrderPdfDocumentProps {
  inquiry: Inquiry;
  onClose: () => void;
}

export const OrderPdfDocument: React.FC<OrderPdfDocumentProps> = ({ inquiry, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const orderTypeLabel = inquiry.orderType === 'raw_wood' ? 'Bahan Baku Kayu Mentah (Sawn Timber / Slab)' : 'Kustom Mebel Eksklusif (Bespoke Furniture)';

  // Escalation WhatsApp link with session number
  const handleSendToOwner = () => {
    const text = encodeURIComponent(
      `Halo Toko Kayu Delin Jaya, saya ingin melampirkan Dokumen Pesanan Resmi saya:\n` +
      `• No. Referensi: ${inquiry.inquiryNumber}\n` +
      `• NOMOR SESI: ${inquiry.sessionNumber || '-'}\n` +
      `• Nama: ${inquiry.customerName}\n` +
      `• Kayu: ${inquiry.woodTypeName}\n` +
      `Mohon dibantu konfirmasi status pengerjaan atau pengiriman. Terima kasih!`
    );
    window.open(`https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-stone-50 text-stone-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 border border-stone-200">
        
        {/* Header Bar - Hidden in print */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-stone-900 text-stone-100 border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-100 text-base">Dokumen Pesanan Resmi (PDF)</h3>
              <p className="text-xs text-stone-400">Sesi: <span className="font-mono text-amber-400 font-semibold">{inquiry.sessionNumber || inquiry.inquiryNumber}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendToOwner}
              className="px-3.5 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-lg transition-colors flex items-center gap-1.5"
              title="Kirim ke WhatsApp Owner"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Owner</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BODY */}
        <div className="p-8 sm:p-12 print:p-8 bg-white font-sans text-stone-800">
          
          {/* Top Atelier Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b-2 border-stone-200 gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-serif text-xl font-bold border border-amber-600/40 shadow-sm">
                  DJ
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-900">TOKO KAYU DELIN JAYA</h1>
                  <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold">Penyedia Material Kayu &amp; Custom Furniture</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 max-w-sm leading-relaxed">
                Jalan Yogyakarta - Wonosari Putat I Patuk, Putat II, Putat, Kec. Patuk, Kabupaten Gunungkidul, D.I. Yogyakarta 55862<br />
                WhatsApp Owner: +62 858-9191-7286 • Jam Buka: Senin–Minggu 08.00–17.00 WIB
              </p>
            </div>

            {/* Session & Order Badge */}
            <div className="bg-stone-50 border-2 border-amber-500/30 rounded-xl p-4 sm:text-right min-w-[240px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wider uppercase rounded-md mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                DOKUMEN RESMI ATELIER
              </div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Nomor Sesi Resmi</p>
              <p className="text-lg font-mono font-extrabold text-stone-900 tracking-tight text-amber-950">
                {inquiry.sessionNumber || `SES-${inquiry.inquiryNumber}`}
              </p>
              <p className="text-xs text-stone-500 mt-1">Ref ID: <span className="font-mono text-stone-700 font-medium">{inquiry.inquiryNumber}</span></p>
              <p className="text-[11px] text-stone-400 mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Customer & Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 p-6 bg-stone-50/70 rounded-xl border border-stone-200/80">
            <div>
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-amber-900 mb-2">Identitas Pemesan Terverifikasi</h4>
              <p className="text-base font-bold text-stone-900">{inquiry.customerName}</p>
              <div className="mt-2 space-y-1 text-xs text-stone-600">
                <p><span className="font-medium text-stone-500">Nomor WhatsApp:</span> <span className="font-mono font-semibold text-stone-800">+{inquiry.whatsappNumber}</span></p>
                <p><span className="font-medium text-stone-500">Email Aktif:</span> <span className="font-semibold text-stone-800">{inquiry.customerEmail || 'Tercatat di sistem'}</span></p>
                <p><span className="font-medium text-stone-500">Kota Tujuan:</span> <span className="font-semibold text-stone-800">{inquiry.city}</span></p>
              </div>
            </div>

            <div className="sm:border-l sm:border-stone-200 sm:pl-6">
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-amber-900 mb-2">Status & Tingkat Layanan</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-500">Status Pengerjaan:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    inquiry.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                    inquiry.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    inquiry.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {inquiry.status === 'done' ? 'Selesai / Terkirim' :
                     inquiry.status === 'processing' ? 'Sedang Diproses Pengrajin' :
                     inquiry.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu Konfirmasi Workshop'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-stone-500">Klasifikasi Pelanggan:</span>{' '}
                  <span className="font-semibold text-stone-800">
                    {inquiry.isRepeatCustomer ? `Pelanggan Setia (Order Ke-${inquiry.repeatOrderCount}) ⭐` : 'Pelanggan Baru'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-stone-500">Kanal Verifikasi:</span>{' '}
                  <span className="font-semibold text-stone-800">Sistem Portal Kayu Nusantara (AES-256)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-3 pb-2 border-b border-stone-200 flex items-center justify-between">
              <span>Spesifikasi Pesanan & Material Kayu</span>
              <span className="text-xs font-normal text-stone-500 lowercase">satuan ukuran & referensi kustom</span>
            </h3>

            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 uppercase tracking-wider font-semibold border-b border-stone-200">
                    <th className="p-3.5">Komponen / Item</th>
                    <th className="p-3.5">Spesifikasi Detail</th>
                    <th className="p-3.5 text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-3.5 font-semibold text-stone-900 bg-stone-50/50">Tipe Layanan</td>
                    <td className="p-3.5 text-stone-800">{orderTypeLabel}</td>
                    <td className="p-3.5 text-right text-stone-500">Standar Ekspor</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-stone-900 bg-stone-50/50">Pilihan Kayu Nusantara</td>
                    <td className="p-3.5">
                      <span className="text-stone-900 font-bold text-sm">{inquiry.woodTypeName}</span>
                      <p className="text-[11px] text-stone-500 mt-0.5">Kayu solid oven kering standar MC 10-14% bersertifikat legalitas SVLK</p>
                    </td>
                    <td className="p-3.5 text-right text-amber-700 font-semibold">Grade A Premium</td>
                  </tr>
                  {inquiry.categoryName && (
                    <tr>
                      <td className="p-3.5 font-semibold text-stone-900 bg-stone-50/50">Kategori Produk</td>
                      <td className="p-3.5 text-stone-800 font-medium">{inquiry.categoryName}</td>
                      <td className="p-3.5 text-right text-stone-500">Bespoke Atelier</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-3.5 font-semibold text-stone-900 bg-stone-50/50">Dimensi / Estimasi Ukuran</td>
                    <td className="p-3.5 text-stone-900 font-mono font-semibold">{inquiry.sizeEstimate || 'Sesuai diskonfirmasi teknis'}</td>
                    <td className="p-3.5 text-right text-stone-500">P x L x T</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-stone-900 bg-stone-50/50 align-top">Catatan & Preferensi Desain</td>
                    <td colSpan={2} className="p-3.5 text-stone-700 leading-relaxed italic bg-stone-50/20">
                      "{inquiry.referenceNote || 'Tidak ada catatan khusus.'}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal and Verification Notice */}
          <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-8 text-xs text-amber-950">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                  Instruksi Pelacakan & Validasi Pengiriman (Ketentuan Resmi Workshop)
                </p>
                <p className="text-stone-700">
                  1. Dokumen ini adalah tanda bukti pemesanan resmi yang tercatat di basis data pusat <strong>Toko Kayu Delin Jaya</strong>.
                </p>
                <p className="text-stone-700">
                  2. <strong>NOMOR SESI RESMI ({inquiry.sessionNumber || inquiry.inquiryNumber})</strong> wajib dicantumkan apabila pesanan mengalami kendala pengiriman atau jika barang belum tiba sesuai estimasi jadwal.
                </p>
                <p className="text-stone-700">
                  3. Pengguna dapat melampirkan berkas cetak PDF ini ke kanal layanan pelanggan atau fitur <strong>Lapor Pesanan</strong> untuk prioritas investigasi langsung oleh Owner.
                </p>
              </div>
            </div>
          </div>

          {/* Signature & Barcode footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-600">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-mono text-[11px] text-stone-500">DIGITAL SESSION HASH: SHA256_{inquiry.id.slice(0, 16).toUpperCase()}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-stone-400 font-mono text-[10px] tracking-widest uppercase">
                <span>||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||</span>
              </div>
              <p className="text-[10px] text-stone-400">Dicetak secara elektronik dari Portal Resmi Toko Kayu Delin Jaya</p>
            </div>

            <div className="text-center sm:text-right min-w-[180px]">
              <p className="text-[11px] text-stone-500">Gunungkidul, Terverifikasi</p>
              <div className="h-14 flex items-center justify-center sm:justify-end my-1">
                <span className="font-serif italic text-lg text-amber-900 font-bold tracking-wider px-3 py-1 border-b border-stone-300">
                  Toko Kayu Delin Jaya
                </span>
              </div>
              <p className="font-bold text-stone-900 text-xs">Manajemen &amp; Kontrol Mutu</p>
              <p className="text-[10px] text-stone-400">Patuk, Gunungkidul, D.I. Yogyakarta</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
