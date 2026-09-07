import React, { useRef, useState, useEffect } from 'react';
import { ProductCategory } from '../types';
import { dbService } from '../services/dbService';
import { Clock, Ruler, ArrowRight, Hammer, Heart } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

interface FurnitureCatalogProps {
  categories?: ProductCategory[];
  onOrderCategory?: (category: ProductCategory) => void;
}

interface FurnitureCatalogCardProps {
  cat: ProductCategory;
  index: number;
  onOrderCategory: (category: ProductCategory) => void;
}

const FurnitureCatalogCard: React.FC<FurnitureCatalogCardProps> = ({
  cat,
  index,
  onOrderCategory
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const [isSaved, setIsSaved] = useState(() => dbService.isItemSaved(cat.id));

  useEffect(() => {
    setIsSaved(dbService.isItemSaved(cat.id));
    const unsubscribe = dbService.subscribe(() => {
      setIsSaved(dbService.isItemSaved(cat.id));
    });
    return () => unsubscribe();
  }, [cat.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.toggleSaveItem({
      itemType: 'furniture',
      referenceId: cat.id,
      name: cat.name,
      image: cat.referenceImages?.[0] || 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
      priceEstimate: 'Estimasi Kustom Atelier',
      subtitle: cat.typicalDimensions || 'Custom Solid Wood'
    });
    setIsSaved(!isSaved);
  };

  // Parallax transform for the image and title overlay
  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const titleY = useTransform(scrollYProgress, [0, 1], [6, -6]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: (index % 3) * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300 flex flex-col justify-between will-change-transform"
    >
      {/* Image with Parallax & Title Overlay */}
      <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-950">
        <motion.img
          src={cat.referenceImages?.[0] || 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'}
          alt={cat.name || 'Furniture'}
          referrerPolicy="no-referrer"
          style={{ y: imageY, scale: 1.16 }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-122 will-change-transform opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Top-Right Save / Bookmark Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleToggleSave}
            title={isSaved ? "Hapus dari barang tersimpan" : "Simpan model mebel ini untuk dibeli"}
            className={`p-2 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                : 'bg-white/85 dark:bg-[#0f1115]/85 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        <motion.div
          style={{ y: titleY }}
          className="absolute bottom-3 left-4 right-4 text-white z-10"
        >
          <h3 className="text-lg font-bold font-display drop-shadow-xs">
            {cat.name || 'Kategori Furniture'}
          </h3>
        </motion.div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {cat.description || '-'}
        </p>

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Ruler className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              Dimensi Acuan: <strong className="text-slate-900 dark:text-slate-200">{cat.typicalDimensions || '-'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              Estimasi Produksi: <strong className="text-slate-900 dark:text-slate-200">{cat.estimatedCraftTime || '-'}</strong>
            </span>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={() => onOrderCategory(cat)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#1c212a] dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Pesan Custom {cat.name ? cat.name.split('(')[0].trim() : 'Furniture'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const FurnitureCatalog: React.FC<FurnitureCatalogProps> = ({
  categories = [],
  onOrderCategory = (_category: ProductCategory) => {}
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Keahlian Pengrajin Tradisional
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Hammer className="w-3 h-3" />
            Mortise & Tenon Joinery
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
          Katalog Karya & Custom Furniture
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
          Setiap produk dibuat secara kustom menurut ukuran ruang dan preferensi estetika Anda menggunakan kayu solid utuh tanpa bahan serbuk pres.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeCategories.map((cat, index) => (
          <FurnitureCatalogCard
            key={cat.id}
            cat={cat}
            index={index}
            onOrderCategory={onOrderCategory}
          />
        ))}
      </div>
    </section>
  );
};
