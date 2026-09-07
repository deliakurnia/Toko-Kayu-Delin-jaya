import React, { useState } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/dbService';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onSuccess: (user: UserAccount) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToHome
}) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Masukkan alamat email atau nomor WhatsApp yang telah terdaftar.');
      return;
    }

    setLoading(true);
    try {
      const res = await dbService.loginUser(trimmed);
      if (!res.success || !res.user) {
        setError(res.error || 'Akun tidak ditemukan. Pastikan email atau nomor WhatsApp sudah terdaftar.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(res.user);
    } catch {
      setError('Terjadi kendala saat menghubungkan ke server. Silakan coba sesaat lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-stone-50 dark:bg-[#0c0e12] text-stone-900 dark:text-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto w-full">
        {/* Top Back Nav Button */}
        <div className="mb-6">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-full bg-stone-200/80 dark:bg-stone-800/80 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Kembali ke Beranda Utama</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Brand Story & Atelier Value */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-[#12141a] text-stone-100 border border-amber-900/30 shadow-xl relative overflow-hidden"
          >
            {/* Ambient Warm Wood Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Resmi Pelanggan</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-tight leading-snug">
                  Akses Konsol Pesanan &amp; Arsip Dokumen Kayu
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 mt-3 leading-relaxed">
                  Masuk ke akun Anda untuk meninjau penawaran harga resmi, mengunduh salinan berkas PDF bersertifikasi SVLK, dan memantau status pengerjaan kayu secara real-time.
                </p>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-stone-800/80">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-200">Unduh Faktur &amp; SPK Digital</h4>
                    <p className="text-[11px] text-stone-400">Salinan penawaran, nota pelunasan, dan legalitas kayu siap unduh format PDF.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-200">Pelacakan Kargo &amp; Resi Truk</h4>
                    <p className="text-[11px] text-stone-400">Nomor resi ekspedisi, nama supir kargo, dan plat armada transparan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-200">Privasi Akun Terenkripsi</h4>
                    <p className="text-[11px] text-stone-400">Data nomor WhatsApp dan email terlindungi oleh sistem basis data terisolasi.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-8 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <span>Toko Kayu Delin Jaya &copy; 2026</span>
              <span className="font-mono text-amber-400/80">Workshop &amp; Atelier</span>
            </div>
          </motion.div>

          {/* Right Column: Double-Bezel Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Outer Double-Bezel Ring */}
            <div className="ring-1 ring-black/5 dark:ring-white/10 p-2 sm:p-2.5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
              {/* Inner Core Card */}
              <div className="rounded-[calc(1.5rem-0.25rem)] bg-white dark:bg-stone-900 p-7 sm:p-10 shadow-xl border border-stone-200/80 dark:border-stone-800">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Masuk Akun Pemesan</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    Selamat Datang Kembali
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Masukkan email aktif atau nomor WhatsApp terdaftar Anda untuk mengakses dashboard pesanan.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Email atau Nomor WhatsApp Terdaftar
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="contoh: budi@gmail.com atau 081234567890"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-950/80 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-stone-400"
                        disabled={loading}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                      Format WhatsApp didukung: 08xxx atau 628xxx.
                    </p>
                  </div>

                  {/* Primary CTA with Button-in-Button Architecture */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group p-1.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between pl-5 pr-2"
                  >
                    <span>{loading ? 'Memverifikasi Identitas...' : 'Masuk ke Akun Pemesan'}</span>
                    <span className="w-8 h-8 rounded-xl bg-black/15 dark:bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </form>

                {/* Bottom Switcher */}
                <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-stone-500 dark:text-stone-400">
                    Belum memiliki akun pemesan?
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Daftar Akun Baru Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
