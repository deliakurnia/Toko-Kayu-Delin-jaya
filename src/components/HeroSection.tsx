import React, { useState, useMemo } from 'react';
import { WoodType } from '../types';
import { TopoField, ParticleDrift } from '@designcodeio/threeui';
import { OWNER_WHATSAPP_NUMBER } from '../services/dbService';
import {
  ArrowRight,
  Box,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
  ChevronRight,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroSectionProps {
  onStartOrder: () => void;
  onExplore3D: () => void;
  onViewCatalog?: () => void;
  woods?: WoodType[];
}

interface WoodCategorySpecimen {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string;
  botanicalName: string;
  tagline: string;
  image: string;
  swatch: string;
  priceRange: string;
  moistureMC: string;
  grade: string;
}

const WOOD_CATEGORIES: WoodCategorySpecimen[] = [
  {
    id: 'spec_jati',
    slug: 'jati',
    name: 'Jati (Teak)',
    categoryLabel: 'Jati',
    botanicalName: 'Tectona grandis',
    tagline: 'Kualitas terbaik untuk karya yang abadi.',
    image: '/assets/hero_live_edge_monumental.jpg',
    swatch: '/assets/swatch_jati.jpg',
    priceRange: 'Rp 22jt - 45jt / m³',
    moistureMC: '< 12%',
    grade: 'Grade A Perhutani'
  },
  {
    id: 'spec_eboni',
    slug: 'eboni',
    name: 'Ebony Makassar',
    categoryLabel: 'Ebony',
    botanicalName: 'Diospyros celebica',
    tagline: 'Kemewahan hitam tembaga dengan densitas tertinggi.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85',
    swatch: '/assets/swatch_eboni.jpg',
    priceRange: 'Rp 75jt - 140jt / m³',
    moistureMC: '< 11%',
    grade: 'Endemik Sulawesi VVIP'
  },
  {
    id: 'spec_sonokeling',
    slug: 'sonokeling',
    name: 'Sonokeling (Rosewood)',
    categoryLabel: 'Sonokeling',
    botanicalName: 'Dalbergia latifolia',
    tagline: 'Guratan ungu eksotis beraroma harum mawar alami.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85',
    swatch: '/assets/swatch_sonokeling.jpg',
    priceRange: 'Rp 38jt - 65jt / m³',
    moistureMC: '< 12%',
    grade: 'Java Rosewood Export'
  },
  {
    id: 'spec_gaharu',
    slug: 'gaharu',
    name: 'Gaharu (Agarwood)',
    categoryLabel: 'Gaharu',
    botanicalName: 'Aquilaria malaccensis',
    tagline: 'Kayu para dewa dengan gubal resin aromatik sakral.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1400&q=85',
    swatch: '/assets/swatch_gaharu.jpg',
    priceRange: 'Rp 45jt - 150jt / m³',
    moistureMC: '< 10%',
    grade: 'Gubal Super Resinous'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOrder,
  onExplore3D,
  onViewCatalog,
  woods = []
}) => {
  const [activeSlug, setActiveSlug] = useState<string>('jati');
  const [shaderMode, setShaderMode] = useState<'topo' | 'particles'>('topo');

  const activeSpecimen = useMemo(() => {
    return WOOD_CATEGORIES.find(w => w.slug === activeSlug) || WOOD_CATEGORIES[0];
  }, [activeSlug]);

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `Halo Toko Kayu Delin Jaya, saya tertarik memesan kayu solid ${activeSpecimen.name} (${activeSpecimen.botanicalName}). Mohon info stok slab mentah & estimasi kustom furnitur.`
    );
    window.open(`https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-[92vh] bg-[#0c0d10] text-stone-100 overflow-hidden flex flex-col justify-between pt-10 pb-6 lg:pt-14 lg:pb-8 transition-colors">
      {/* 1. CINEMATIC AMBIENT LIGHTING & GLOW */}
      <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-600/20 via-amber-700/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-800/15 via-stone-900/30 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0c0d10] via-[#0c0d10]/80 to-transparent pointer-events-none z-10" />

      {/* 2. THREEUI 3D WEBGL SHADER LAYER (Wood Growth Rings & Floating Golden Particles) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 mix-blend-screen z-0">
        {shaderMode === 'topo' ? (
          <TopoField
            mode="dark"
            speed={0.45}
            density={1.2}
            strokeWidth={1.1}
            opacity={0.38}
            hue={34}
            saturation={1.3}
            brightness={0.85}
            className="w-full h-full"
          />
        ) : (
          <ParticleDrift
            mode="dark"
            speed={0.5}
            density={1.4}
            size={1.2}
            opacity={0.45}
            hue={36}
            saturation={1.4}
            brightness={0.9}
            className="w-full h-full"
          />
        )}
      </div>

      {/* 3. MAIN HERO CONTENT GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
          
          {/* LEFT COLUMN: Editorial Typography & Value Actions */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 lg:space-y-8">
            
            {/* Eyebrow Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-amber-500/30 backdrop-blur-md shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold text-amber-200/90 tracking-wide">
                Pengadaan Kayu Legal SVLK &amp; Custom Workshop
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </motion.div>

            {/* Monumental Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="space-y-1"
            >
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-bold text-stone-100 tracking-tight leading-[1.08]">
                Kayu Nusantara <br />
                Bernilai Tinggi, <br />
                <span className="italic font-normal text-amber-200/90 font-serif">
                  Presisi Tanpa Kompromi.
                </span>
              </h1>
            </motion.div>

            {/* Human & Factual Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="text-xs sm:text-sm lg:text-[15px] text-stone-300 font-normal leading-relaxed max-w-xl"
            >
              Platform pengadaan kayu solid langka — <strong className="text-stone-100 font-semibold">Jati, Ebony, Sonokeling, dan Gaharu</strong>. Sedia balok mentah berpori utuh maupun rancangan custom furniture berstandar ekspor dengan alur terstruktur langsung ke WhatsApp pemilik.
            </motion.p>

            {/* CTA Buttons Duo: Champagne Sand Pill + Frosted Glass 3D */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              {/* Button 1: Warm Champagne Sand Pill (WhatsApp Direct) */}
              <button
                onClick={handleWhatsAppOrder}
                className="group px-5 sm:px-6 py-3.5 rounded-full bg-[#f3ebd8] hover:bg-[#e8dec5] text-[#1c1917] font-semibold text-xs sm:text-sm shadow-lg shadow-amber-950/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-stone-900/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4 text-amber-900 fill-amber-900" />
                </div>
                <span>Pesan Sekarang via WhatsApp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 2: Frosted Dark Glass 3D Inspector */}
              <button
                onClick={onExplore3D}
                className="group px-5 sm:px-6 py-3.5 rounded-full bg-stone-900/70 hover:bg-stone-800/90 text-stone-200 font-semibold text-xs sm:text-sm border border-stone-700/80 hover:border-amber-500/50 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:rotate-12 transition-transform">
                  <Box className="w-4 h-4" />
                </div>
                <span>Inspeksi Serat 3D (Three.js)</span>
              </button>
            </motion.div>

            {/* ThreeUI Shader Switcher Pill (Micro-Interaction) */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-400">
              <span className="text-stone-500 font-mono">ThreeUI WebGL:</span>
              <button
                onClick={() => setShaderMode('topo')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                  shaderMode === 'topo'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-stone-900/50 hover:bg-stone-800/80 text-stone-400 border border-stone-800'
                }`}
              >
                Lingkar Tahun (TopoField)
              </button>
              <button
                onClick={() => setShaderMode('particles')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                  shaderMode === 'particles'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-stone-900/50 hover:bg-stone-800/80 text-stone-400 border border-stone-800'
                }`}
              >
                Debu Atelier (ParticleDrift)
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Monumental Standing Timber Slab & Floating Specimen Selector */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            
            {/* Monumental Double-Bezel Frame */}
            <div className="ring-1 ring-white/10 p-2 sm:p-3 rounded-3xl bg-white/[0.02] shadow-2xl relative">
              <div className="relative rounded-[calc(1.5rem-0.25rem)] overflow-hidden bg-stone-950 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] border border-stone-800/90 group">
                
                {/* Active Wood Slab Image with Cross-fade */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSpecimen.slug}
                    src={activeSpecimen.image}
                    alt={activeSpecimen.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full h-full object-cover object-center brightness-95 contrast-105"
                  />
                </AnimatePresence>

                {/* Ambient Dramatic Lighting Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-stone-950/30 pointer-events-none" />

                {/* FLOATING CARD 1: Kategori Kayu Selector (Top Right) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute top-4 right-4 z-20 w-44 sm:w-48 bg-stone-950/80 backdrop-blur-xl border border-stone-800/90 rounded-2xl p-3 shadow-2xl space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-200 pb-1 border-b border-stone-800/80">
                    <span>Pilih Kategori Kayu</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </div>

                  <div className="space-y-1.5">
                    {WOOD_CATEGORIES.map((cat) => {
                      const isSelected = cat.slug === activeSlug;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => setActiveSlug(cat.slug)}
                          className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border border-amber-500/40 text-stone-100 shadow-xs'
                              : 'hover:bg-stone-800/60 text-stone-400 border border-transparent hover:text-stone-200'
                          }`}
                        >
                          <img
                            src={cat.swatch}
                            alt={cat.categoryLabel}
                            className={`w-6 h-6 rounded-lg object-cover ring-1 shrink-0 ${
                              isSelected ? 'ring-amber-400' : 'ring-stone-700'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold block truncate">
                              {cat.categoryLabel}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* FLOATING CARD 2: Active Specimen Highlight (Bottom Left on Image) */}
                <motion.div
                  key={`highlight-${activeSpecimen.slug}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-4 left-4 z-20 max-w-[280px] sm:max-w-xs bg-stone-950/85 backdrop-blur-xl border border-stone-800/90 rounded-2xl p-3 shadow-2xl flex items-center gap-3"
                >
                  <img
                    src={activeSpecimen.swatch}
                    alt={activeSpecimen.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-amber-500/40 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                        {activeSpecimen.categoryLabel} Premium
                      </h4>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 leading-tight truncate mt-0.5">
                      {activeSpecimen.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-amber-400/90">
                      <span>MC: {activeSpecimen.moistureMC}</span>
                      <span>•</span>
                      <span>{activeSpecimen.priceRange}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Floating WhatsApp Pill Button (Bottom Right) */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 border border-emerald-500/40 text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Hubungi WhatsApp Pemilik Langsung"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Pesan via WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM KICKER TRUST BAR (Hairline Glassmorphic Metrics) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 pt-6 border-t border-stone-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Metric 1: Legalitas SVLK */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 tracking-tight">
                100% Legal SVLK
              </h4>
              <p className="text-[11px] text-stone-400">
                Sertifikasi Perhutani &amp; Asal Kayu Sah
              </p>
            </div>
          </div>

          {/* Metric 2: Kiln-Dried Oven */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 tracking-tight">
                Kiln-Dried Oven
              </h4>
              <p className="text-[11px] text-stone-400">
                Kadar Air Terstandar MC &lt; 12%
              </p>
            </div>
          </div>

          {/* Metric 3: Repeat Customer CRM */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 tracking-tight">
                Repeat Customer
              </h4>
              <p className="text-[11px] text-stone-400">
                Histori Pesanan Otomatis Terdata
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
