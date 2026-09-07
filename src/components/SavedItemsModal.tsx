import React from 'react';
import { SavedItem } from '../types';
import { dbService } from '../services/dbService';
import { 
  Heart, 
  X, 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles 
} from 'lucide-react';

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onOrderSavedItem: (item: SavedItem) => void;
  onBrowseCatalog: () => void;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onOrderSavedItem,
  onBrowseCatalog
}) => {
  if (!isOpen) return null;

  const handleRemove = (referenceId: string) => {
    dbService.removeSavedItem(referenceId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Barang Tersimpan Saya</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {savedItems.length}
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Rencana kayu solid &amp; model mebel kustom yang Anda simpan untuk dibeli
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {savedItems.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 opacity-40" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-base text-stone-800 dark:text-stone-200">
                  Belum Ada Barang yang Disimpan
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Tekan ikon hati pada kartu katalog kayu atau kustom mebel untuk menyimpan material yang ingin Anda beli nantinya.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onBrowseCatalog();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Jelajahi Katalog Kayu &amp; Mebel</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700/60 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-stone-950/80 text-amber-400">
                        {item.itemType === 'wood' ? 'Bahan Kayu' : 'Mebel Kustom'}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate italic">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.priceEstimate}
                      </p>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        Disimpan: {new Date(item.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 dark:border-stone-800">
                    <button
                      onClick={() => handleRemove(item.referenceId)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus dari daftar simpanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOrderSavedItem(item);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Pesan Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Privacy Note */}
        <div className="p-4 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Daftar simpanan bersifat privat dan hanya tersimpan di perangkat Anda.</span>
          </span>
          <button
            onClick={onClose}
            className="text-stone-700 dark:text-stone-300 hover:underline font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
