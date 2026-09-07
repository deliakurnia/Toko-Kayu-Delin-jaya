import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { ShieldCheck, ShieldAlert, Lock, KeyRound, AlertCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface OwnerAuthGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const OwnerAuthGate: React.FC<OwnerAuthGateProps> = ({ onSuccess, onCancel }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const checkStatus = () => {
    const status = dbService.getOwnerLockoutStatus();
    setAttemptsLeft(status.attemptsLeft);
    setLockoutSeconds(status.remainingSeconds);
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          checkStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = dbService.ownerLogin(passcode);
    if (!res.success) {
      setError(res.error || 'Autentikasi gagal.');
      if (res.attemptsLeft !== undefined) setAttemptsLeft(res.attemptsLeft);
      if (res.remainingSeconds !== undefined) setLockoutSeconds(res.remainingSeconds);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-stone-100">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            {lockoutSeconds > 0 ? (
              <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
            ) : (
              <KeyRound className="w-8 h-8 text-amber-400" />
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100 tracking-tight">
            Verifikasi Otoritas Pemilik (Owner)
          </h2>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Halaman ini diproteksi ketat. Pengguna umum tidak memiliki hak akses ke kontrol database dan laporan internal.
          </p>
        </div>

        {/* Security Notice Pill */}
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-stone-300">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Brute-Force Shield Aktif
          </span>
          <span className="font-mono text-amber-400">Maks. 3 Percobaan</span>
        </div>

        {/* Error / Lockout Display */}
        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              {attemptsLeft > 0 && (
                <p className="text-[11px] text-rose-300/80 mt-0.5">Kesempatan tersisa: {attemptsLeft}x</p>
              )}
            </div>
          </div>
        )}

        {lockoutSeconds > 0 ? (
          <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-2xl text-center space-y-2">
            <Clock className="w-8 h-8 text-rose-400 mx-auto animate-spin" />
            <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">Akses Terkunci Sementara</p>
            <p className="text-2xl font-mono font-extrabold text-stone-100">
              {Math.floor(lockoutSeconds / 60)}:{(lockoutSeconds % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-[11px] text-stone-400">
              Demi keamanan dari serangan brute-force, sistem mengunci akses selama 5 menit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                <span>Kunci Sandi Pemilik (Passcode)</span>
                <span className="text-[10px] text-stone-500 font-normal">Sandi bawaan: <code className="text-amber-400 bg-stone-950 px-1 py-0.5 rounded">owner88</code></span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Masukkan kode kunci pemilik..."
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Memvalidasi Kunci...' : 'Buka Dashboard Pemilik'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back to Client Site */}
        <div className="pt-2 text-center">
          <button
            onClick={onCancel}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda Pelanggan
          </button>
        </div>

      </div>
    </div>
  );
};
