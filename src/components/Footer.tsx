import React from 'react';
import { TreeDeciduous, MessageSquare, ShieldCheck, MapPin, Clock, Lock } from 'lucide-react';
import { OWNER_WHATSAPP_NUMBER } from '../services/dbService';

interface FooterProps {
  onOpenOwnerPortal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOwnerPortal }) => {
  return (
    <footer className="bg-slate-50 dark:bg-[#0f1115] border-t border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-delin-jaya.png"
                alt="Toko Delin Jaya Logo"
                className="h-12 w-auto max-w-[170px] object-contain rounded-lg bg-white p-1 shadow-xs border border-stone-200 dark:border-stone-700"
              />
              <div>
                <span className="font-serif text-xl font-bold tracking-tight block">
                  Toko Delin Jaya
                </span>
                <span className="text-[11px] font-medium tracking-wide text-amber-600 dark:text-amber-400 uppercase">
                  Kayu untuk Setiap Kebutuhan Anda
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Pusat penyedia material kayu berkualitas tinggi dan studio custom furniture terpercaya yang berlokasi di Gunungkidul, Daerah Istimewa Yogyakarta. Melayani pengadaan kayu konstruksi, papan slab, mebel kustom, hingga kirim ke seluruh Indonesia.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Sertifikasi Legalitas Kayu (SVLK) &amp; Perhutani Terakreditasi</span>
            </div>
          </div>

          {/* Workshop & Operating Hours */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-serif">
              Lokasi Toko &amp; Kontak
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <span className="leading-relaxed">
                  Jalan Yogyakarta - Wonosari Putat I Patuk, Putat II, Putat, Kec. Patuk, Kabupaten Gunungkidul, D.I. Yogyakarta 55862
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>Senin – Minggu: 08.00 – 17.00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <a
                  href={`https://wa.me/${OWNER_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-mono font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  +62 858-9191-7286 (WhatsApp Pemilik)
                </a>
              </div>
            </div>
          </div>

          {/* Quality & Craftsmanship Standards */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-serif">
              Standar Mutu &amp; Kurasi
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Kadar Air Oven (Kiln-Dry) Terkontrol 10–12%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Sertifikasi Legalitas SVLK &amp; Perhutani</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Presisi Sambungan Kayu Tradisional</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Armada Ekspedisi Khusus Solid Wood</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Konsultasi Ukuran &amp; Desain Terbuka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-stone-500">
          <div>
            © 2026 Toko Kayu Delin Jaya. Semua hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-3">
            <span>Penyedia Material Kayu &amp; Mebel Kustom • Gunungkidul, DIY</span>
            {onOpenOwnerPortal && (
              <button
                onClick={onOpenOwnerPortal}
                title="Akses Portal Internal Atelier (Ctrl + Shift + O)"
                className="text-stone-400 dark:text-stone-600 hover:text-amber-500 dark:hover:text-amber-400 transition-opacity p-1 cursor-pointer"
                aria-label="Akses Internal Atelier"
              >
                <Lock className="w-3 h-3 opacity-25 hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
