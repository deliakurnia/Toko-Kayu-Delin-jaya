import React, { useState } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/dbService';
import { ShieldCheck, Mail, Phone, User, MapPin, Lock, AlertCircle, CheckCircle, ArrowRight, X } from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'register' | 'login';
  title?: string;
  subtitle?: string;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'register',
  title = 'Registrasi Pemesan Toko Kayu Delin Jaya',
  subtitle = 'Sesuai protokol keamanan, Anda wajib mendaftar dengan email dan nomor WhatsApp aktif sebelum mengajukan pesanan.'
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = dbService.registerUser({
        name,
        email,
        whatsappNumber,
        city: city || 'Indonesia'
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(res.user);
      onClose();
    } catch {
      setError('Terjadi kesalahan pada sistem autentikasi.');
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = dbService.loginUser(loginIdentifier);
      if (!res.success || !res.user) {
        setError(res.error || 'Akun tidak ditemukan.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(res.user);
      onClose();
    } catch {
      setError('Gagal masuk ke sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-900 px-6 py-5 border-b border-stone-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100 tracking-tight">
                {mode === 'register' ? title : 'Masuk ke Akun Pemesan'}
              </h3>
              <p className="text-xs text-stone-400 leading-snug max-w-xs mt-0.5">
                {mode === 'register' ? subtitle : 'Akses riwayat pesanan, cetak PDF, dan laporan kendala.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Trust Banner */}
        <div className="bg-amber-950/20 px-6 py-2.5 border-b border-amber-900/30 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Verifikasi Data Aman &amp; Validasi Sesi Resmi</span>
          </div>
          <span className="font-mono text-stone-400">SSL / TLS Protected</span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nama Lengkap Pemesan <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Alamat Email Aktif <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] text-stone-400 font-normal">Untuk penerbitan berkas PDF SPK</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: budi@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Nomor WhatsApp Aktif <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] text-stone-400 font-normal">Wajib nomor WA aktif</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 08123456789 atau 628123456789"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Kota Domisili / Lokasi Pengiriman <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan, Surabaya, Bandung"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-950/40 rounded-xl border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed">
                🛡️ <strong>Ketentuan Workshop:</strong> Data email dan nomor WA digunakan untuk validasi Nomor Sesi Resmi, penerbitan tanda bukti PDF, dan pelaporan kendala pengiriman jika pesanan terlambat sampai.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Daftar & Lanjutkan Pesanan'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Email Aktif atau Nomor WhatsApp Terdaftar
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Contoh: budi.hartono@example.com atau 081298765432"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  Demo Akun Tersedia: <code className="text-amber-400 bg-stone-950 px-1 py-0.5 rounded">budi.hartono@example.com</code> atau <code className="text-amber-400 bg-stone-950 px-1 py-0.5 rounded">081298765432</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Memeriksa Sesi...' : 'Masuk ke Dashboard Pemesan'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle between Register and Login */}
          <div className="pt-4 border-t border-stone-800/80 text-center text-xs text-stone-400">
            {mode === 'register' ? (
              <p>
                Sudah pernah mendaftar?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p>
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Daftar akun pemesan baru
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
