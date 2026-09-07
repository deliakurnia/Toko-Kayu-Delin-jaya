import React from 'react';
import { WoodType } from '../types';
import { ArrowRight, Box, ShieldCheck, TreeDeciduous, MessageSquare, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onStartOrder: () => void;
  onExplore3D: () => void;
  onViewCatalog?: () => void;
  woods?: WoodType[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onExplore3D,
  woods = []
}) => {
  const safeWoods = Array.isArray(woods) ? woods : [];
  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Pengadaan Kayu Legal SVLK & Custom Workshop
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-[1.12]">
              Toko Kayu Delin Jaya. Material Kayu Pilihan, Presisi Tanpa Kompromi.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-body leading-relaxed max-w-2xl">
              Penyedia material kayu solid berkualitas tinggi—<strong className="text-slate-900 dark:text-slate-200">Jati, Eboni, Sonokeling, Gaharu, dan Kayu Konstruksi</strong> di Patuk, Gunungkidul, D.I. Yogyakarta. Sedia balok mentah, papan slab, hingga custom furniture dengan alur terstruktur langsung ke WhatsApp pemilik.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartOrder}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Pesan Sekarang via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExplore3D}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1c212a] font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Box className="w-4 h-4 text-emerald-500" />
                <span>Inspeksi Serat 3D (Three.js)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">100% Legal SVLK</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sertifikasi Perhutani</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <TreeDeciduous className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Kiln-Dried Oven</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Kadar Air MC &lt; 12%</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Repeat Customer</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Histori Otomatis Terdata</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Visual Composition */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Main Featured Slab Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800/80 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80"
                  alt="Kayu Jati Solid Slab"
                  referrerPolicy="no-referrer"
                  className="w-full h-[380px] sm:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Floating 3D Badge on image */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onExplore3D}
                    className="px-3 py-1.5 rounded-full bg-[#0f1115]/90 text-emerald-400 text-xs font-medium border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Mode Interaktif 3D</span>
                  </button>
                </div>

                {/* Bottom caption in image */}
                <div className="absolute bottom-6 inset-x-6 text-white space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400">
                    Master Craftsmanship
                  </span>
                  <h3 className="text-xl font-bold font-display">
                    Meja Makan Kayu Jati Live-Edge Solid
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    Finishing natural doff menonjolkan serat emas alami tanpa menghilangkan guratan asli lingkaran tahunan kayu.
                  </p>
                </div>
              </div>

              {/* Floating Quick Wood Selector Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 p-4 rounded-2xl bg-white/95 dark:bg-[#16191f]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-xl text-xs space-y-2 max-w-[280px]">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Spesies Kayu Utama</span>
                  <span className="text-[10px] text-emerald-500 font-medium">4 Pilihan</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {safeWoods.map(w => (
                    <div
                      key={w.id}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#0f1115] border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: w.textureColorHex }}
                      />
                      <span className="font-medium truncate text-slate-700 dark:text-slate-300">
                        {w.name ? w.name.split('(')[0].trim() : 'Kayu'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
