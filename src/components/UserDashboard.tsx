import React, { useState, useEffect } from 'react';
import { UserAccount, Inquiry, OrderReport, IssueType, SavedItem } from '../types';
import { dbService, OWNER_WHATSAPP_NUMBER } from '../services/dbService';
import { OrderPdfDocument } from './OrderPdfDocument';
import { PaymentModal } from './PaymentModal';
import { ProductionProgressModal } from './ProductionProgressModal';
import {
  User,
  ShieldCheck,
  Package,
  AlertTriangle,
  AlertCircle,
  FileText,
  Printer,
  Clock,
  CheckCircle2,
  ExternalLink,
  LogOut,
  PlusCircle,
  Phone,
  Mail,
  Send,
  HelpCircle,
  ChevronRight,
  Sparkles,
  CreditCard,
  Activity,
  Truck,
  Lock,
  Heart,
  Trash2,
  MapPin,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onNavigateToOrder: () => void;
  onBrowseCatalog?: () => void;
  onOrderSavedItem?: (item: SavedItem) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateToOrder,
  onBrowseCatalog = () => {},
  onOrderSavedItem
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'saved' | 'reports' | 'profile'>('orders');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reports, setReports] = useState<OrderReport[]>([]);
  const [userSavedItems, setUserSavedItems] = useState<SavedItem[]>(() => dbService.getSavedItems(currentUser));
  const [selectedPdfInquiry, setSelectedPdfInquiry] = useState<Inquiry | null>(null);
  const [selectedPaymentInquiry, setSelectedPaymentInquiry] = useState<Inquiry | null>(null);
  const [selectedProgressInquiry, setSelectedProgressInquiry] = useState<Inquiry | null>(null);
  
  // Reporting state
  const [reportingInquiry, setReportingInquiry] = useState<Inquiry | null>(null);
  const [issueType, setIssueType] = useState<IssueType>('belum_sampai');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editCity, setEditCity] = useState(currentUser.city || '');
  const [editAddress, setEditAddress] = useState(currentUser.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUserData = async () => {
    const allInquiries = dbService.getInquiries();
    // Match by WhatsApp or Email
    let userInquiries = allInquiries.filter(
      inq => inq.whatsappNumber === currentUser.whatsappNumber || (inq.customerEmail && inq.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
    setInquiries(userInquiries);

    // Fetch live inquiries from backend (isolated endpoint)
    try {
      const live = await dbService.getUserInquiriesFromBackend(currentUser.whatsappNumber);
      if (live && live.length > 0) {
        const existingNos = new Set(userInquiries.map(i => i.inquiryNumber));
        const newOnes = live.filter(i => !existingNos.has(i.inquiryNumber));
        if (newOnes.length > 0) {
          userInquiries = [...userInquiries, ...newOnes];
          setInquiries(userInquiries);
        }
      }
    } catch {
      // Keep existing local inquiries
    }

    const allReports = dbService.getOrderReports();
    const userReports = allReports.filter(
      r => r.whatsappNumber === currentUser.whatsappNumber || (r.email && r.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    setReports(userReports);

    // Load user's private saved items
    const saved = dbService.getSavedItems(currentUser);
    setUserSavedItems(saved);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileMsg({ type: 'error', text: 'Nama lengkap tidak boleh kosong.' });
      return;
    }
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await dbService.updateUserProfile(currentUser.whatsappNumber, {
        name: editName.trim(),
        city: editCity.trim(),
        address: editAddress.trim()
      });
      if (res.success && res.user) {
        setProfileMsg({ type: 'success', text: 'Profil dan alamat kargo berhasil diperbarui.' });
        setIsEditingProfile(false);
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Gagal memperbarui profil.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Terjadi kesalahan saat menyimpan profil.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRemoveSavedItem = (referenceId: string) => {
    const updated = dbService.removeSavedItem(referenceId, currentUser);
    setUserSavedItems(updated);
  };

  useEffect(() => {
    loadUserData();
    const unsubscribe = dbService.subscribe(() => {
      loadUserData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenReport = (inquiry: Inquiry) => {
    setReportingInquiry(inquiry);
    setActiveTab('reports');
    setIssueType('belum_sampai');
    setReportDescription(`Pesanan saya dengan No. Sesi ${inquiry.sessionNumber || inquiry.inquiryNumber} belum sampai melebihi estimasi waktu. Mohon konfirmasi posisi pengiriman dan ekspedisi.`);
    setReportSuccessMessage(null);
    setReportErrorMessage(null);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingInquiry) return;

    setReportErrorMessage(null);
    setIsSubmittingReport(true);

    const res = dbService.submitOrderReport({
      inquiryId: reportingInquiry.id,
      issueType,
      description: reportDescription
    });

    if (!res.success || !res.report) {
      setReportErrorMessage(res.error || 'Gagal mengirim laporan pesanan.');
      setIsSubmittingReport(false);
      return;
    }

    setIsSubmittingReport(false);
    setReportSuccessMessage(`Laporan kendala #${res.report.reportNumber} berhasil diajukan ke workshop! Dokumen PDF pesanan Anda ber-Nomor Sesi ${reportingInquiry.sessionNumber} siap diverifikasi.`);
    
    // Auto trigger WhatsApp escalation link
    if (res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
    }

    loadUserData();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Top Profile Header */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-2xl font-bold shadow-inner shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Terverifikasi
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/40 text-amber-300 border border-amber-800/40">
                    Portal Pemesan
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    +{currentUser.whatsappNumber}
                  </span>
                  <span>📍 {currentUser.city}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToOrder}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Pesan Custom Kayu Baru</span>
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800/80 text-xs">
            <div className="bg-stone-950/50 p-3.5 rounded-xl border border-stone-800/50">
              <p className="text-stone-500 font-medium">Total Pesanan Terdaftar</p>
              <p className="text-xl font-bold text-stone-100 mt-0.5">{inquiries.length}</p>
            </div>
            <div className="bg-stone-950/50 p-3.5 rounded-xl border border-stone-800/50">
              <p className="text-stone-500 font-medium">Dalam Pengerjaan</p>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                {inquiries.filter(i => i.status === 'processing' || i.status === 'new').length}
              </p>
            </div>
            <div className="bg-stone-950/50 p-3.5 rounded-xl border border-stone-800/50">
              <p className="text-stone-500 font-medium">Selesai / Terkirim</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {inquiries.filter(i => i.status === 'done').length}
              </p>
            </div>
            <div className="bg-stone-950/50 p-3.5 rounded-xl border border-stone-800/50">
              <p className="text-stone-500 font-medium">Laporan Kendala Aktif</p>
              <p className="text-xl font-bold text-rose-400 mt-0.5">{reports.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs in Customer Dashboard */}
        <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pesanan &amp; Faktur</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/20 text-current">
              {inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Barang Tersimpan (Wishlist)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/20 text-current">
              {userSavedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Laporan Kendala</span>
            {reports.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {reports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Akun &amp; Alamat</span>
          </button>
        </div>

        {/* TAB 1: SECTION PESANAN SAYA (ORDERS LIST) */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Daftar Pesanan &amp; Berkas PDF Sesi Resmi
                </h2>
                <p className="text-xs text-stone-400">
                  Setiap pesanan memiliki Nomor Sesi Resmi yang tercantum pada dokumen cetak PDF untuk validasi dan klaim keterlambatan.
                </p>
              </div>
            </div>

          {inquiries.length === 0 ? (
            <div className="bg-stone-900 border border-dashed border-stone-800 rounded-2xl p-10 text-center space-y-3">
              <Package className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-sm font-semibold text-stone-300">Belum Ada Pesanan Terdaftar</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Anda belum memiliki pesanan aktif di akun ini. Buat pesanan kayu mentah atau kustom mebel untuk mendapatkan dokumen PDF resmi dan Nomor Sesi pelacakan.
              </p>
              <button
                onClick={onNavigateToOrder}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Mulai Pesanan Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiries.map((inquiry) => {
                const isLateEligible = inquiry.status !== 'done';
                return (
                  <div
                    key={inquiry.id}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700/80 rounded-2xl p-5 shadow-lg transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Session & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Nomor Sesi Resmi</span>
                          <p className="text-base font-mono font-bold text-amber-400 tracking-tight">
                            {inquiry.sessionNumber || `SES-${inquiry.inquiryNumber}`}
                          </p>
                          <p className="text-[11px] text-stone-400">Ref: {inquiry.inquiryNumber}</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${
                          inquiry.status === 'done' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                          inquiry.status === 'processing' ? 'bg-blue-950 text-blue-400 border border-blue-800/50' :
                          inquiry.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-800/50' :
                          'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}>
                          {inquiry.status === 'done' ? 'Selesai' :
                           inquiry.status === 'processing' ? 'Pengerjaan' :
                           inquiry.status === 'cancelled' ? 'Batal' : 'Menunggu Workshop'}
                        </span>
                      </div>

                      {/* Detail Items */}
                      <div className="mt-4 p-3 bg-stone-950/60 rounded-xl border border-stone-800/60 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Material Kayu:</span>
                          <span className="font-semibold text-stone-200">{inquiry.woodTypeName}</span>
                        </div>
                        {inquiry.categoryName && (
                          <div className="flex justify-between">
                            <span className="text-stone-500">Kategori:</span>
                            <span className="font-medium text-stone-300">{inquiry.categoryName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-stone-500">Estimasi Ukuran:</span>
                          <span className="font-mono text-stone-300">{inquiry.sizeEstimate || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Tujuan Kirim:</span>
                          <span className="text-stone-300">{inquiry.city}</span>
                        </div>

                        {/* Status Finansial & Tagihan */}
                        {inquiry.paymentRecord ? (
                          inquiry.paymentRecord.isSettled ? (
                            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between">
                              <span className="text-stone-500">Tagihan:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Lunas 100% (Rp {inquiry.paymentRecord.totalAmount.toLocaleString('id-ID')})</span>
                              </span>
                            </div>
                          ) : inquiry.paymentRecord.isDpPaid ? (
                            <div className="pt-2 border-t border-stone-800/60 space-y-1">
                              <div className="flex justify-between text-amber-300 font-semibold">
                                <span>DP 50% Diterima:</span>
                                <span>Rp {inquiry.paymentRecord.dpAmount.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between text-stone-400 text-[11px]">
                                <span>Sisa Tagihan Pelunasan:</span>
                                <span className="font-mono font-bold text-amber-400">
                                  Rp {inquiry.paymentRecord.remainingAmount.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                                <span>Target Pelunasan: {inquiry.paymentRecord.settlementDueDate || '-'}</span>
                                <span className="text-amber-400/90 font-medium">🔒 Pengiriman Tertahan</span>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-stone-800/60 flex justify-between">
                              <span className="text-stone-500">Total Tagihan:</span>
                              <span className="font-mono font-bold text-amber-400">
                                Rp {(inquiry.quotation?.finalPrice || inquiry.paymentRecord.totalAmount).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="pt-2 border-t border-stone-800/60 flex justify-between">
                            <span className="text-stone-500">Estimasi Biaya:</span>
                            <span className="font-mono text-stone-400">Menunggu Penawaran Workshop</span>
                          </div>
                        )}

                        {/* Status Kargo Truk jika sudah dikirim */}
                        {inquiry.shipmentWaybill && (
                          <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/50 text-[11px] text-blue-300 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-400" />
                              <span>{inquiry.shipmentWaybill.carrierName}</span>
                            </div>
                            <span className="font-mono font-bold">{inquiry.shipmentWaybill.waybillNumber}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-[11px] pt-1 border-t border-stone-800/60">
                          <span className="text-stone-500">Waktu Order:</span>
                          <span className="text-stone-400">{new Date(inquiry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Tombol Bayar / Lunasi */}
                        <button
                          onClick={() => setSelectedPaymentInquiry(inquiry)}
                          className={`py-2 px-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            inquiry.paymentRecord?.isSettled
                              ? 'bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>
                            {inquiry.paymentRecord?.isSettled ? 'Status Lunas' :
                             inquiry.paymentRecord?.isDpPaid ? 'Lunasi Sisa 50%' : 'Bayar Pesanan'}
                          </span>
                        </button>

                        {/* Tombol Pantau Progres & Legalitas SVLK */}
                        <button
                          onClick={() => setSelectedProgressInquiry(inquiry)}
                          className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-medium text-xs rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pantau Progres</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPdfInquiry(inquiry)}
                          className="flex-1 py-1.5 px-3 bg-stone-800/60 hover:bg-stone-800 text-amber-300 font-medium text-xs rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF Resmi</span>
                        </button>

                        {isLateEligible && (
                          <button
                            onClick={() => handleOpenReport(inquiry)}
                            className="py-1.5 px-3 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 font-medium text-xs rounded-xl border border-rose-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Lapor jika pesanan belum sampai atau kendala pengiriman"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Lapor Kendala</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* TAB 2: BARANG TERSIMPAN (WISHLIST SAYA) */}
        {activeTab === 'saved' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Barang Tersimpan (Wishlist Pribadi)
                </h2>
                <p className="text-xs text-stone-400">
                  Koleksi material kayu solid dan mebel custom yang Anda tandai untuk konsultasi atau pemesanan langsung.
                </p>
              </div>
              {userSavedItems.length > 0 && (
                <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                  {userSavedItems.length} Item Tersimpan
                </span>
              )}
            </div>

            {userSavedItems.length === 0 ? (
              <div className="bg-stone-900 border border-dashed border-stone-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-800/80 border border-stone-700/50 flex items-center justify-center text-stone-400">
                  <Heart className="w-7 h-7 text-stone-500" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-200">Belum Ada Barang Tersimpan</h3>
                  <p className="text-xs text-stone-400 max-w-md mx-auto mt-1">
                    Jelajahi etalase spesimen kayu solid nusantara atau mebel custom kami, lalu simpan item yang Anda minati.
                  </p>
                </div>
                {onBrowseCatalog && (
                  <button
                    onClick={onBrowseCatalog}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4" />
                    <span>Jelajahi Katalog Kayu</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSavedItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-700/60">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                            Material
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 border border-stone-700/60">
                            {item.itemType === 'wood' ? 'Spesimen Kayu' : 'Mebel Custom'}
                          </span>
                          <button
                            onClick={() => handleRemoveSavedItem(item.referenceId || item.id)}
                            className="text-stone-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Hapus dari tersimpan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-serif font-bold text-stone-100 text-sm mt-1 truncate">
                          {item.name}
                        </h4>
                        {item.subtitle && (
                          <p className="text-[11px] text-stone-500 truncate italic">
                            {item.subtitle}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-amber-300 mt-0.5">
                          {item.priceEstimate || 'Harga Terbuka'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveSavedItem(item.referenceId || item.id)}
                        className="px-3 py-2 bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium rounded-xl border border-stone-700/50 transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => {
                          if (onOrderSavedItem) {
                            onOrderSavedItem(item);
                          } else if (onBrowseCatalog) {
                            onBrowseCatalog();
                          }
                        }}
                        className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan Sekarang</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUSAT BANTUAN & LAPORAN KENDALA */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Pusat Bantuan &amp; Laporan Kendala Pesanan
                </h2>
                <p className="text-xs text-stone-400">
                  Laporkan keterlambatan pengiriman kargo, kendala pengerjaan workshop, atau klaim garansi kayu.
                </p>
              </div>
            </div>

            {/* FORM LAPOR KENDALA (ESCALATION REPORTING FORM / MODAL) */}
            {reportingInquiry ? (
              <div className="bg-stone-900 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-100">
                        Lapor Kendala Pesanan &amp; Keterlambatan Pengiriman
                      </h3>
                      <p className="text-xs text-stone-400">
                        Laporkan ke Owner dengan menyertakan Nomor Sesi dan PDF pesanan resmi.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setReportingInquiry(null)}
                    className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 bg-stone-800 rounded-lg cursor-pointer"
                  >
                    Tutup Form
                  </button>
                </div>

                {reportSuccessMessage ? (
                  <div className="mt-6 p-5 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl text-xs text-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Laporan Berhasil Diajukan</span>
                    </div>
                    <p>{reportSuccessMessage}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedPdfInquiry(reportingInquiry)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Buka / Simpan PDF Pesanan (Sesi {reportingInquiry.sessionNumber})
                      </button>
                      <button
                        onClick={() => setReportingInquiry(null)}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReport} className="mt-6 space-y-4">
                    {reportErrorMessage && (
                      <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-200">
                        {reportErrorMessage}
                      </div>
                    )}

                    {/* Target Order Info */}
                    <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-stone-500">Nomor Sesi Resmi:</span>
                        <p className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                          {reportingInquiry.sessionNumber || reportingInquiry.inquiryNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-500">Material &amp; Dimensi:</span>
                        <p className="text-stone-200 font-medium mt-0.5">
                          {reportingInquiry.woodTypeName} ({reportingInquiry.sizeEstimate || '-'})
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-500">Pemesan &amp; Tujuan:</span>
                        <p className="text-stone-200 mt-0.5">
                          {reportingInquiry.customerName} - {reportingInquiry.city}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Kategori Kendala Pesanan <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={issueType}
                          onChange={(e) => setIssueType(e.target.value as IssueType)}
                          className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                        >
                          <option value="belum_sampai">Pesanan Belum Sampai Melebihi Jadwal Estimasi</option>
                          <option value="keterlambatan_ekspedisi">Keterlambatan Ekspedisi / Kendala Truk Kargo</option>
                          <option value="status_stuck">Status Pengerjaan Berhenti / Tidak Ada Kabar</option>
                          <option value="kerusakan">Klaim Kerusakan Barang Saat Transit</option>
                          <option value="lainnya">Kendala Pesanan Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                          <span>Lampiran Berkas PDF Pesanan</span>
                          <span className="text-[10px] text-amber-400">Otomatis Terlampir</span>
                        </label>
                        <div className="flex items-center gap-2 p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span className="truncate">Dokumen_SPK_{reportingInquiry.sessionNumber}.pdf</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPdfInquiry(reportingInquiry)}
                            className="ml-auto text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            Pratinjau PDF
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Keterangan Rinci Kendala <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Jelaskan kendala Anda secara lengkap. Sebutkan tanggal jatuh tempo kesepakatan jika ada."
                        className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Laporan akan langsung diteruskan ke WhatsApp Owner &amp; masuk antrean prioritas tim workshop.
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReportingInquiry(null)}
                          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReport}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan ke Owner'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-200 text-sm">
                      Cara Mengajukan Laporan Kendala
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Untuk mengajukan laporan, buka tab <button onClick={() => setActiveTab('orders')} className="text-amber-400 underline font-semibold cursor-pointer">Pesanan &amp; Faktur</button> lalu klik tombol <strong>"Lapor Kendala"</strong> pada pesanan yang ingin Anda eskalasikan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RIWAYAT LAPORAN SAYA */}
            {reports.length > 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Riwayat Laporan Kendala Pesanan Anda
                </h3>

                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-400">{report.reportNumber}</span>
                          <span className="text-stone-500">•</span>
                          <span className="font-mono text-stone-300">Sesi: {report.sessionNumber}</span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'resolved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' :
                          report.status === 'investigating' ? 'bg-blue-950 text-blue-300 border border-blue-800/50' :
                          'bg-amber-950 text-amber-300 border border-amber-800/50'
                        }`}>
                          {report.status === 'resolved' ? 'Terselesaikan' :
                           report.status === 'investigating' ? 'Sedang Ditindaklanjuti Owner' :
                           'Menunggu Respon Owner'}
                        </span>
                      </div>

                      <p className="text-stone-300 italic">"{report.description}"</p>

                      {report.resolutionNote && (
                        <div className="mt-2 p-2.5 bg-amber-950/30 border border-amber-800/30 rounded-lg text-amber-200 text-[11px]">
                          <strong>Respon Pemilik / Workshop:</strong> {report.resolutionNote}
                        </div>
                      )}

                      <div className="text-[10px] text-stone-500 pt-1">
                        Diajukan pada: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-stone-900/60 border border-dashed border-stone-800/80 rounded-2xl p-8 text-center text-xs text-stone-500">
                Tidak ada laporan kendala aktif. Semua pesanan Anda berjalan lancar.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFIL AKUN & ALAMAT PENGIRIMAN */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Profil Akun &amp; Pengaturan Pengiriman
                </h2>
                <p className="text-xs text-stone-400">
                  Data kontak pribadi dan alamat pengiriman kargo terverifikasi Toko Delin Jaya.
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditCity(currentUser.city || '');
                    setEditAddress(currentUser.address || '');
                    setProfileMsg(null);
                    setIsEditingProfile(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Ubah Profil &amp; Alamat
                </button>
              )}
            </div>

            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            {isEditingProfile ? (
              /* Profile Edit Form Card */
              <form onSubmit={handleSaveProfile} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif font-bold text-stone-200 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Formulir Pembaruan Data Pemesan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Kota / Kabupaten Tujuan</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="contoh: Surabaya, Jawa Timur"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-stone-400 mb-1 font-medium">Alamat Lengkap Kargo (Jalan, RT/RW, Kecamatan)</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Alamat lengkap untuk kurir kargo kayu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSavingProfile ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Details Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Info Card */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif font-bold text-stone-200 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Informasi Identitas Pelanggan
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Nama Lengkap:</span>
                      <span className="text-stone-200 font-semibold text-sm">{currentUser.name}</span>
                    </div>
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Nomor WhatsApp Aktif:</span>
                      <span className="text-stone-200 font-mono font-semibold">{currentUser.whatsappNumber || (currentUser as any).phone}</span>
                    </div>
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Alamat Email:</span>
                      <span className="text-stone-200 font-medium">{currentUser.email}</span>
                    </div>
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Status Akun:</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terverifikasi Pelanggan Delin Jaya
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif font-bold text-stone-200 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Alamat Pengiriman Utama
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Kota / Wilayah Tujuan:</span>
                      <span className="text-stone-200 font-semibold">{currentUser.city || 'Belum ditentukan'}</span>
                    </div>
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/60">
                      <span className="text-stone-500 block">Alamat Lengkap Kargo:</span>
                      <p className="text-stone-300 mt-1 leading-relaxed">
                        {currentUser.address || 'Alamat otomatis tersimpan saat Anda membuat pesanan kargo pertama kali.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* PDF View / Print Modal */}
      {selectedPdfInquiry && (
        <OrderPdfDocument
          inquiry={selectedPdfInquiry}
          onClose={() => setSelectedPdfInquiry(null)}
        />
      )}

      {/* Payment Gateway Modal (QRIS & Virtual Account) */}
      {selectedPaymentInquiry && (
        <PaymentModal
          isOpen={true}
          inquiry={selectedPaymentInquiry}
          onClose={() => setSelectedPaymentInquiry(null)}
          onPaymentSuccess={(updatedInq) => {
            loadUserData();
            setSelectedPaymentInquiry(null);
          }}
        />
      )}

      {/* Production & Legal Chain Timeline Modal */}
      {selectedProgressInquiry && (
        <ProductionProgressModal
          isOpen={true}
          inquiry={selectedProgressInquiry}
          onClose={() => setSelectedProgressInquiry(null)}
          onOpenPaymentModal={() => {
            setSelectedPaymentInquiry(selectedProgressInquiry);
          }}
        />
      )}
    </div>
  );
};
