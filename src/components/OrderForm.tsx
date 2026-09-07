import React, { useState, useEffect } from 'react';
import { WoodType, ProductCategory, OrderType, Customer, UserAccount, Inquiry } from '../types';
import { INITIAL_WOODS } from '../data/woodData';
import { INITIAL_CATEGORIES } from '../data/categoryData';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { OrderPdfDocument } from './OrderPdfDocument';
import { UserAuthModal } from './UserAuthModal';
import {
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Star,
  Sparkles,
  Upload,
  TreePine,
  Armchair,
  ShieldCheck,
  Lock,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrderFormProps {
  woods?: WoodType[];
  categories?: ProductCategory[];
  preselectedWood?: WoodType | null;
  preselectedCategory?: ProductCategory | null;
  preselectedWoodId?: string;
  preselectedCategoryId?: string;
  preselectedOrderType?: OrderType | null;
  onOrderSuccess?: (inquiryId: string) => void;
  onOrderCompleted?: (inquiryId?: string) => void;
  onGoToCatalog?: () => void;
  onNavigateToDashboard?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  woods = [],
  categories = [],
  preselectedWood,
  preselectedCategory,
  preselectedWoodId,
  preselectedCategoryId,
  preselectedOrderType,
  onOrderSuccess,
  onOrderCompleted,
  onGoToCatalog,
  onNavigateToDashboard
}) => {
  const [formWoods, setFormWoods] = useState<WoodType[]>(() => {
    return Array.isArray(woods) && woods.length > 0 ? woods : dbService.getWoods();
  });

  useEffect(() => {
    if (Array.isArray(woods) && woods.length > 0) {
      setFormWoods(woods);
    } else {
      setFormWoods(dbService.getWoods());
    }
  }, [woods]);

  useEffect(() => {
    const unsubscribe = dbService.subscribe((event) => {
      if (event.type === 'WOOD_STOCK_UPDATED') {
        const updated = event.payload as WoodType;
        setFormWoods(prev => prev.map(w => (w.id === updated.id || w.slug === updated.slug ? { ...w, ...updated } : w)));
      } else if (event.type === 'WOOD_CREATED') {
        const newWood = event.payload as WoodType;
        setFormWoods(prev => {
          if (prev.some(w => w.id === newWood.id || w.slug === newWood.slug)) return prev;
          return [...prev, newWood];
        });
      }
    });

    const handleWindowUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WoodType>;
      if (customEvent.detail) {
        setFormWoods(prev => {
          if (prev.some(w => w.id === customEvent.detail.id || w.slug === customEvent.detail.slug)) {
            return prev.map(w => (w.id === customEvent.detail.id || w.slug === customEvent.detail.slug ? { ...w, ...customEvent.detail } : w));
          }
          return [...prev, customEvent.detail];
        });
      }
    };
    window.addEventListener('woodCatalogUpdated', handleWindowUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('woodCatalogUpdated', handleWindowUpdate);
    };
  }, []);

  const safeWoods = formWoods;
  const safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  const initialWoodId = preselectedWood?.id || preselectedWoodId || safeWoods[0]?.id || '';
  const initialCategoryId = preselectedCategory?.id || preselectedCategoryId || safeCategories[0]?.id || '';

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => dbService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form State
  const [orderType, setOrderType] = useState<OrderType>(preselectedOrderType || 'custom_furniture');
  const [selectedWoodId, setSelectedWoodId] = useState<string>(initialWoodId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [customCategoryText, setCustomCategoryText] = useState<string>('');
  const [sizeEstimate, setSizeEstimate] = useState<string>('');
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');

  // Customer State (Auto-populated from currentUser if logged in)
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(currentUser?.whatsappNumber || '');
  const [city, setCity] = useState<string>(currentUser?.city || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [saveConsent, setSaveConsent] = useState<boolean>(true);

  // Customer Loyalty Detection
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdInquiry, setCreatedInquiry] = useState<Inquiry | null>(null);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Sync user state
  useEffect(() => {
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!whatsappNumber) setWhatsappNumber(user.whatsappNumber);
      if (!email) setEmail(user.email);
      if (!city) setCity(user.city);
    }
  }, []);

  const handleUserAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setCustomerName(user.name);
    setWhatsappNumber(user.whatsappNumber);
    setEmail(user.email);
    setCity(user.city);
  };

  // Sync if preselected props change
  useEffect(() => {
    if (preselectedWood?.id) {
      setSelectedWoodId(preselectedWood.id);
    } else if (preselectedWoodId) {
      setSelectedWoodId(preselectedWoodId);
    }

    if (preselectedCategory?.id) {
      setSelectedCategoryId(preselectedCategory.id);
    } else if (preselectedCategoryId) {
      setSelectedCategoryId(preselectedCategoryId);
    }

    if (preselectedOrderType) {
      setOrderType(preselectedOrderType);
    }
  }, [preselectedWood, preselectedWoodId, preselectedCategory, preselectedCategoryId, preselectedOrderType]);

  // Real-time WhatsApp detection (PRD 6.3)
  useEffect(() => {
    if (whatsappNumber.length >= 9) {
      const existing = dbService.findCustomerByPhone(whatsappNumber);
      if (existing) {
        setMatchedCustomer(existing);
        if (!customerName && existing.name) setCustomerName(existing.name);
        if (!city && existing.city) setCity(existing.city);
        if (!email && existing.email) setEmail(existing.email);
      } else {
        setMatchedCustomer(null);
      }
    } else {
      setMatchedCustomer(null);
    }
  }, [whatsappNumber, customerName, city, email]);

  const selectedWood = safeWoods.find(w => w.id === selectedWoodId) || safeWoods[0] || INITIAL_WOODS[0];
  const selectedCategory = safeCategories.find(c => c.id === selectedCategoryId) || safeCategories[0] || INITIAL_CATEGORIES[0];

  // Image Upload handler (supports file upload with Base64 preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!sizeEstimate.trim()) {
        alert('Mohon isi estimasi ukuran atau kebutuhan dimensi.');
        return;
      }
      
      // Enforce user registration before proceeding to customer info
      if (!currentUser && !dbService.getCurrentUser()) {
        setIsAuthModalOpen(true);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!customerName.trim()) {
        alert('Mohon isi nama lengkap Anda.');
        return;
      }
      if (!whatsappNumber.trim() || whatsappNumber.length < 8) {
        alert('Mohon cantumkan nomor WhatsApp aktif yang valid.');
        return;
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        alert('Sesuai protokol keamanan workshop, Anda wajib mencantumkan email aktif yang valid.');
        return;
      }
      if (!city.trim()) {
        alert('Mohon isi kota pengiriman tujuan.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = () => {
    // Check authentication
    const activeUser = currentUser || dbService.getCurrentUser();
    if (!activeUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!email.trim() || !whatsappNumber.trim()) {
      alert('Email aktif dan nomor WhatsApp aktif wajib dicantumkan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveCategory = orderType === 'custom_furniture' ? selectedCategoryId : undefined;
      let effectiveNote = referenceNote;
      if (orderType === 'custom_furniture' && selectedCategory?.slug === 'lainnya' && customCategoryText) {
        effectiveNote = `[Kategori Khusus: ${customCategoryText}] ` + effectiveNote;
      }

      const result = dbService.submitInquiry({
        customerName,
        whatsappNumber,
        city,
        email,
        orderType,
        woodTypeId: selectedWoodId,
        categoryId: effectiveCategory,
        sizeEstimate,
        referenceNote: effectiveNote,
        referenceImageUrl
      });

      if (result.isRepeatCustomer) {
        soundService.playLoyaltyChime();
      } else {
        soundService.playWoodChime();
      }

      setCreatedInquiry(result.inquiry);
      setWhatsappRedirectUrl(result.whatsappUrl);

      if (onOrderSuccess) {
        onOrderSuccess(result.inquiry.id);
      }
      if (onOrderCompleted) {
        onOrderCompleted(result.inquiry.id);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was submitted
  if (createdInquiry) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pesanan Terverifikasi Sesi Resmi
            </div>
            <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Inquiry Berhasil Diterbitkan!
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
              Dokumen Surat Perintah Kerja (SPK) dan nomor sesi resmi telah dicatat ke database workshop kami.
            </p>
          </div>

          {/* Session Number Highlight Box */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Nomor Sesi Resmi Pelacakan:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Resmi Terdaftar
              </span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {createdInquiry.sessionNumber}
            </div>
            <div className="text-[11px] text-stone-500 flex flex-wrap justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span>No. Referensi: <strong className="font-mono text-stone-700 dark:text-stone-300">{createdInquiry.inquiryNumber}</strong></span>
              <span>Pemesan: <strong className="text-stone-700 dark:text-stone-300">{createdInquiry.customerName}</strong></span>
              <span>Email: <strong className="text-stone-700 dark:text-stone-300">{createdInquiry.customerEmail}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowPdfModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Berkas PDF Resmi</span>
            </button>

            {whatsappRedirectUrl && (
              <a
                href={whatsappRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Kirim ke WhatsApp Owner</span>
              </a>
            )}

            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Ke Dashboard Pemesan
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-400">
            Simpan atau cetak berkas PDF tersebut. Jika pesanan Anda tidak kunjung sampai, Anda dapat mengajukan laporan kendala dengan melampirkan berkas PDF ini melalui Dashboard Pemesan.
          </p>
        </div>

        {/* PDF Modal */}
        {showPdfModal && (
          <OrderPdfDocument
            inquiry={createdInquiry}
            onClose={() => setShowPdfModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Form Pemesanan Terstruktur
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
              Inquiry Kayu & Custom Furniture
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              Langkah {currentStep} dari 4
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentStep === 1 && 'Pilih Jenis Produk'}
              {currentStep === 2 && 'Spesifikasi & Ukuran'}
              {currentStep === 3 && 'Informasi Pemesan'}
              {currentStep === 4 && 'Konfirmasi & Kirim WA'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-lg">
        {/* STEP 1: PILIH JENIS PRODUK */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                Langkah 1: Apa yang ingin Anda pesan?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Pilih apakah Anda membutuhkan suplai bahan baku kayu mentah atau pembuatan produk furniture kustom.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Kayu Mentah */}
              <div
                onClick={() => setOrderType('raw_wood')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  orderType === 'raw_wood'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#16191f]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <TreePine className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Beli Kayu Mentah
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Balok, papan lembaran, slab natural live-edge berpori utuh, atau kayu gelondongan legal bersertifikasi SVLK.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Pilih Kayu Mentah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option B: Custom Furniture */}
              <div
                onClick={() => setOrderType('custom_furniture')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  orderType === 'custom_furniture'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#16191f]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Armchair className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Custom Furniture Jadi
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Meja makan masif, buffet credenza, lemari, bangku, panel hiasan dinding, atau pesanan gambar arsitek.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Pilih Custom Furniture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SPESIFIKASI & UKURAN */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                Langkah 2: Tentukan Kayu & Spesifikasi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {orderType === 'raw_wood' ? 'Pilih jenis kayu mentah dan estimasi kubikasi/panjang.' : 'Pilih jenis kayu dan kategori furniture yang diinginkan.'}
              </p>
            </div>

            {/* Wood Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                Pilih Jenis Kayu Premium:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {safeWoods.map(wood => (
                  <button
                    key={wood.id}
                    type="button"
                    onClick={() => setSelectedWoodId(wood.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedWoodId === wood.id
                        ? 'border-emerald-500 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16191f] text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: wood.textureColorHex }}
                        />
                        <span className="text-xs font-bold truncate">{wood.name ? wood.name.split('(')[0].trim() : 'Kayu'}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        wood.stockStatus === 'ready'
                          ? selectedWoodId === wood.id ? 'bg-black/20 text-white' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : wood.stockStatus === 'low_stock'
                          ? selectedWoodId === wood.id ? 'bg-black/20 text-white' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : wood.stockStatus === 'out_of_stock'
                          ? selectedWoodId === wood.id ? 'bg-black/20 text-white' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                          : selectedWoodId === wood.id ? 'bg-black/20 text-white' : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
                      }`}>
                        {wood.stockStatus === 'ready' ? 'Ready' : wood.stockStatus === 'low_stock' ? 'Menipis' : wood.stockStatus === 'out_of_stock' ? 'Habis' : 'Pre-Order'}
                      </span>
                    </div>
                    <span className="block text-[10px] opacity-75 mt-1 truncate">
                      {wood.botanicalName}
                    </span>
                  </button>
                ))}
              </div>

              {/* Real-time stock status callout */}
              {(() => {
                const activeWood = safeWoods.find(w => w.id === selectedWoodId || w.slug === selectedWoodId);
                if (!activeWood) return null;
                if (activeWood.stockStatus === 'out_of_stock') {
                  return (
                    <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Status Spesimen: Habis (Inden Penebangan). </span>
                        Stok kayu {activeWood.name} saat ini sedang kosong di gudang utama. Inquiry pemesanan ini tetap akan dicatat sebagai antrean pre-order kayu legal SVLK untuk batch berikutnya.
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${activeWood.stockStatus === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="text-slate-700 dark:text-slate-300">
                        Status Stok: <strong className="text-slate-900 dark:text-slate-100">{activeWood.stockStatus === 'ready' ? 'Tersedia Siap Kirim' : activeWood.stockStatus === 'low_stock' ? 'Stok Terbatas' : 'Pre-Order Oven'}</strong> ({activeWood.stockVolumeM3 ?? 10} m³ / {activeWood.stockSlabsCount ?? 5} Slab Utuh)
                      </span>
                    </div>
                    {activeWood.restockEstimate && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Lokasi/Estimasi: {activeWood.restockEstimate}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Furniture Category (If Custom Furniture) */}
            {orderType === 'custom_furniture' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  Kategori Furniture:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {safeCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedCategoryId === cat.id
                          ? 'border-emerald-500 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16191f] text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{cat.name ? cat.name.split('(')[0].trim() : 'Kategori'}</div>
                      <span className="block text-[10px] opacity-75 mt-0.5 truncate">
                        {cat.typicalDimensions}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedCategory?.slug === 'lainnya' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Sebutkan kategori/proyek kustom Anda:
                    </label>
                    <input
                      type="text"
                      value={customCategoryText}
                      onChange={e => setCustomCategoryText(e.target.value)}
                      placeholder="Contoh: Trap tangga melayang, pintu utama gebyok, dll."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Size & Dimension Estimates */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                Estimasi Ukuran / Kebutuhan Dimensi: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sizeEstimate}
                onChange={e => setSizeEstimate(e.target.value)}
                placeholder={
                  orderType === 'raw_wood'
                    ? 'Contoh: Balok 200 x 30 x 15 cm (4 batang) atau 1.5 m³'
                    : 'Contoh: Meja makan 220 x 95 x 78 cm (Tebal top 8 cm)'
                }
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Notes & Reference Image */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Catatan Tambahan & Spesifikasi Finis:
                </label>
                <textarea
                  rows={3}
                  value={referenceNote}
                  onChange={e => setReferenceNote(e.target.value)}
                  placeholder="Contoh: Finishing natural doff tanpa melamin tebal, sambungan mortise and tenon, tepi alami live-edge..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Upload Foto Referensi Desain */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Upload Foto Sketsa / Referensi Desain (Opsional):
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1c212a] hover:bg-slate-200 dark:hover:bg-[#252b37] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Foto</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {referenceImageUrl && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Foto referensi terlampir
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DATA DIRI & DETEKSI PELANGGAN */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <span>Langkah 3: Informasi Akun Pemesan</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sesuai protokol keamanan workshop, email aktif dan WhatsApp aktif digunakan untuk menerbitkan Surat Perintah Kerja (SPK) dan nomor sesi resmi.
                </p>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 underline font-medium cursor-pointer"
                >
                  Ganti Akun
                </button>
              )}
            </div>

            {/* Authenticated User Banner */}
            {currentUser ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                      Akun Pemesan Terverifikasi: {currentUser.name}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Email: {currentUser.email} • WhatsApp: +{currentUser.whatsappNumber}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                  Aman & Terenkripsi
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-300">
                    Perhatian: Akun Pemesan Belum Terdaftar
                  </h4>
                  <p className="text-slate-600 dark:text-stone-300 text-[11px] mt-0.5">
                    Harap daftarkan email & no WA aktif Anda untuk melanjutkan penerbitan nomor sesi pesanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            )}

            {/* Repeat Customer Detected Banner */}
            {matchedCustomer && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs">
                <Star className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400">
                    Selamat Datang Kembali, {matchedCustomer.name}!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Sistem mendeteksi nomor WhatsApp Anda sebagai <strong>Pelanggan Setia</strong> (Total pesanan sebelumnya: {matchedCustomer.totalOrders}x). Data Anda telah kami isi secara otomatis.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp Number (Key identifier) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Nomor WhatsApp Aktif: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    WA
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Format: 08... atau 628... (Nomor aktif untuk verifikasi & kirim SPK)
                </span>
              </div>

              {/* Email Aktif */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Email Aktif Pemesan: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Wajib aktif untuk penerbitan berkas PDF dan pelaporan kendala
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Nama Lengkap: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nama pemesan / instansi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* City / Destination */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1">
                  Kota / Kabupaten Tujuan Pengiriman: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan, Surabaya, Bali..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={saveConsent}
                  onChange={e => setSaveConsent(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Simpan data saya di database aman agar mempermudah pemesanan berulang di masa mendatang.</span>
              </label>
            </div>
          </motion.div>
        )}

        {/* STEP 4: RINGKASAN & KIRIM KE WHATSAPP */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                Langkah 4: Konfirmasi Ringkasan Pesanan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Periksa rincian sebelum dikirim ke sistem database dan dialihkan ke WhatsApp resmi.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Kategori Pembelian:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {orderType === 'raw_wood' ? 'Beli Kayu Mentah (Timber/Slab)' : `Custom Furniture (${selectedCategory?.name || 'Pilihan'})`}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Jenis Kayu Pilihan:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedWood?.name || 'Kayu Pilihan'} ({selectedWood?.origin || '-'})
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Estimasi Dimensi:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{sizeEstimate}</span>
              </div>

              <div className="flex justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Pemesan & WhatsApp:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {customerName} • {whatsappNumber}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Kota Pengiriman:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{city}</span>
              </div>

              {referenceNote && (
                <div className="pt-1 text-slate-600 dark:text-slate-400">
                  <span className="font-medium block mb-0.5">Catatan Spesifikasi:</span>
                  <p className="italic bg-white dark:bg-[#16191f] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{referenceNote}"
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp Direct Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Kirim Pesanan via WhatsApp Otomatis'}</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                Pesanan akan otomatis disimpan ke database dan teks pemesanan akan otomatis terisi di WhatsApp pemilik.
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c212a] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
            >
              <span>Lanjut ke Langkah {currentStep + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* User Auth Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUserAuthSuccess}
      />
    </div>
  );
};
