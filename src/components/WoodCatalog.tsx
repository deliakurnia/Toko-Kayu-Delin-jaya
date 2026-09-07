import React, { useState, useRef, useEffect } from 'react';
import { WoodType } from '../types';
import { dbService } from '../services/dbService';
import { Search, Sparkles, Box, ShieldCheck, ArrowRight, X, Layers, Droplets, Scale, Radio, Boxes, Heart } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface WoodCatalogProps {
  woods?: WoodType[];
  onSelectFor3D?: (wood: WoodType) => void;
  onOrderWood?: (wood: WoodType) => void;
}

interface WoodCatalogCardProps {
  wood: WoodType;
  index: number;
  onSelectFor3D: (wood: WoodType) => void;
  onOrderWood: (wood: WoodType) => void;
  onInspect: (wood: WoodType) => void;
}

const WoodCatalogCard: React.FC<WoodCatalogCardProps> = ({
  wood,
  index,
  onSelectFor3D,
  onOrderWood,
  onInspect
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const [isSaved, setIsSaved] = useState(() => dbService.isItemSaved(wood.id));

  useEffect(() => {
    setIsSaved(dbService.isItemSaved(wood.id));
    const unsubscribe = dbService.subscribe(() => {
      setIsSaved(dbService.isItemSaved(wood.id));
    });
    return () => unsubscribe();
  }, [wood.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.toggleSaveItem({
      itemType: 'wood',
      referenceId: wood.id,
      name: wood.name,
      image: wood.images?.[0] || 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80',
      priceEstimate: wood.priceRangeEstimate || 'Hubungi Atelier',
      subtitle: wood.botanicalName
    });
    setIsSaved(!isSaved);
  };

  // Parallax translation for the image and floating badges
  const imageY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  const badgeY = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.65,
        delay: (index % 2) * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300 flex flex-col will-change-transform"
    >
      {/* Image Header with Parallax & Badge Overlay */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-950">
        <motion.img
          src={wood.images?.[0] || 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80'}
          alt={wood.name || 'Kayu'}
          referrerPolicy="no-referrer"
          style={{ y: imageY, scale: 1.15 }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120 opacity-95 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* Top Tags with Floating Parallax */}
        <motion.div
          style={{ y: badgeY }}
          className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-auto"
        >
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 dark:bg-[#0f1115]/90 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10"
              style={{ backgroundColor: wood.textureColorHex || '#8B5A2B' }}
            />
            <span>{wood.origin || 'Indonesia'}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleSave}
              title={isSaved ? "Hapus dari barang tersimpan" : "Simpan kayu ini untuk dibeli"}
              className={`p-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-xs ${
                isSaved
                  ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                  : 'bg-white/85 dark:bg-[#0f1115]/85 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => onSelectFor3D(wood)}
              title="Lihat dalam Visualizer 3D"
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 backdrop-blur-xs flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer shadow-xs"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Inspeksi 3D</span>
            </button>
          </div>
        </motion.div>

        {/* Bottom Title & Real-Time Stock Status */}
        <div className="absolute bottom-4 inset-x-4 text-white z-10 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-mono tracking-widest text-slate-300 italic">
              {wood.botanicalName || '-'}
            </div>

            {/* Live Stock Badge */}
            {wood.stockStatus === 'ready' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                <span>Siap Kirim ({wood.stockVolumeM3 ?? 18.5} m³)</span>
              </span>
            )}
            {wood.stockStatus === 'low_stock' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-pulse" />
                <span>Sisa Terbatas ({wood.stockSlabsCount ?? 3} Slab)</span>
              </span>
            )}
            {wood.stockStatus === 'out_of_stock' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Habis • Inden Penebangan</span>
              </span>
            )}
            {wood.stockStatus === 'pre_order' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Pre-Order Oven Kiln-Dry</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold font-display tracking-tight text-white drop-shadow-xs">
            {wood.name}
          </h3>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
          {wood.description}
        </p>

        {/* Characteristics Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              <Layers className="w-3 h-3" />
              <span>Kekerasan:</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {wood.characteristics?.kekerasan ? wood.characteristics.kekerasan.split('(')[0] : '-'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              <Droplets className="w-3 h-3" />
              <span>Kadar Air (MC):</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {wood.characteristics?.kadarAir ? wood.characteristics.kadarAir.split('(')[0] : '-'}
            </div>
          </div>
        </div>

        {/* Price Range & Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
              Kisaran Harga Acuan:
            </span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {wood.priceRangeEstimate || '-'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onInspect(wood)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#1c212a] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#252b37] transition-colors cursor-pointer"
            >
              Detail Lengkap
            </button>

            <button
              onClick={() => onOrderWood(wood)}
              className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1 shadow-xs transition-transform hover:scale-102 cursor-pointer ${
                wood.stockStatus === 'out_of_stock'
                  ? 'bg-rose-700 hover:bg-rose-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span>{wood.stockStatus === 'out_of_stock' ? 'Konsultasi Inden' : 'Pesan Kayu Ini'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const WoodCatalog: React.FC<WoodCatalogProps> = ({
  woods = [],
  onSelectFor3D = (_wood: WoodType) => {},
  onOrderWood = (_wood: WoodType) => {}
}) => {
  const [displayWoods, setDisplayWoods] = useState<WoodType[]>(() => {
    return woods && woods.length > 0 ? woods : dbService.getWoods();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'teak' | 'ebony' | 'rosewood' | 'agarwood'>('all');
  const [inspectWood, setInspectWood] = useState<WoodType | null>(null);

  useEffect(() => {
    if (woods && woods.length > 0) {
      setDisplayWoods(woods);
    } else {
      setDisplayWoods(dbService.getWoods());
    }
  }, [woods]);

  // Real-time listener for SSE events
  useEffect(() => {
    const unsubscribe = dbService.subscribe((event) => {
      if (event.type === 'WOOD_STOCK_UPDATED') {
        const updated = event.payload as WoodType;
        setDisplayWoods(prev => prev.map(w => (w.id === updated.id || w.slug === updated.slug ? { ...w, ...updated } : w)));
        if (inspectWood && (inspectWood.id === updated.id || inspectWood.slug === updated.slug)) {
          setInspectWood(prev => prev ? { ...prev, ...updated } : null);
        }
      } else if (event.type === 'WOOD_CREATED') {
        const newWood = event.payload as WoodType;
        setDisplayWoods(prev => {
          if (prev.some(w => w.id === newWood.id || w.slug === newWood.slug)) return prev;
          return [...prev, newWood];
        });
      }
    });

    const handleWindowUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WoodType>;
      if (customEvent.detail) {
        setDisplayWoods(prev => {
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
  }, [inspectWood]);

  const safeWoods = Array.isArray(displayWoods) ? displayWoods : [];
  const filteredWoods = safeWoods.filter(wood => {
    if (!wood) return false;
    const matchesSearch =
      (wood.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wood.botanicalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wood.origin || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && wood.slug === activeFilter;
  });

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Koleksi Kayu Nusantara
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              100% Legal SVLK
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Katalog Kayu Premium Pilihan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
            Tersedia dalam bentuk kayu mentah (balok/papan slab natural-edge) maupun diproses menjadi custom furniture bermutu tinggi.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jenis atau asal kayu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#16191f] border border-slate-200/80 dark:border-slate-800/80 p-1 rounded-xl text-xs">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'jati', label: 'Jati' },
                { id: 'eboni', label: 'Eboni' },
                { id: 'sonokeling', label: 'Sonokeling' },
                { id: 'gaharu', label: 'Gaharu' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wood Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredWoods.map((wood, index) => (
          <WoodCatalogCard
            key={wood.id}
            wood={wood}
            index={index}
            onSelectFor3D={onSelectFor3D}
            onOrderWood={onOrderWood}
            onInspect={setInspectWood}
          />
        ))}
      </div>

      {/* Inspect Modal */}
      <AnimatePresence>
        {inspectWood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectWood(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#16191f] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400">
                    Karakteristik & Uji Spesimen
                  </span>
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                    {inspectWood.name}
                  </h3>
                  <span className="text-xs italic text-slate-500 dark:text-slate-400">
                    {inspectWood.botanicalName} • Asal: {inspectWood.origin}
                  </span>
                </div>

                <button
                  onClick={() => setInspectWood(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c212a] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Images row */}
                <div className="grid grid-cols-3 gap-2">
                  {inspectWood.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={inspectWood.name}
                      referrerPolicy="no-referrer"
                      className="h-28 w-full object-cover rounded-xl border border-slate-200/50 dark:border-slate-800/50"
                    />
                  ))}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Deskripsi Karakter Kayu:
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {inspectWood.description}
                  </p>
                </div>

                {/* Real-time Live Stock Status Panel */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-500" />
                      <span>Inventaris Ketersediaan Real-Time</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Stock</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-[#16191f] border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Status Gudang:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {inspectWood.stockStatus === 'ready' ? 'Tersedia Siap Kirim' : inspectWood.stockStatus === 'low_stock' ? 'Stok Menipis' : inspectWood.stockStatus === 'out_of_stock' ? 'Habis (Inden)' : 'Pre-Order Oven'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-[#16191f] border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Volume Kayu:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {inspectWood.stockVolumeM3 ?? 10} m³ ({inspectWood.stockSlabsCount ?? 5} Slab)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-[#16191f] border border-slate-200/60 dark:border-slate-800/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block">Catatan / Estimasi:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {inspectWood.restockEstimate || 'Siap Kirim'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Characteristics Table */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Tingkat Kekerasan:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{inspectWood.characteristics.kekerasan}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Karakter Warna & Serat:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{inspectWood.characteristics.warna}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Ketahanan & Awet:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{inspectWood.characteristics.ketahanan}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Kadar Air (MC Oven):</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{inspectWood.characteristics.kadarAir}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Massa Jenis:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{inspectWood.characteristics.massaJenis}</span>
                  </div>
                  <div className="pt-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Kegunaan Umum:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectWood.characteristics.kegunaan.map((use, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#16191f] flex items-center justify-between">
                <button
                  onClick={() => {
                    const target = inspectWood;
                    setInspectWood(null);
                    onSelectFor3D(target);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#1c212a] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#252b37] cursor-pointer"
                >
                  <Box className="w-4 h-4 text-emerald-500" />
                  <span>Inspeksi Serat di Studio 3D</span>
                </button>

                <button
                  onClick={() => {
                    const target = inspectWood;
                    setInspectWood(null);
                    onOrderWood(target);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Pesan Jenis Kayu Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
