import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Box,
  TreePine,
  Armchair,
  ShieldCheck,
  MessageCircle,
  User,
  Heart,
  Package,
  Plus,
  Layers,
  Activity,
  CornerDownLeft,
  Sparkles,
  Database
} from 'lucide-react';
import { WoodType } from '../types';

export interface CommandItem {
  id: string;
  category: 'woods' | 'furniture' | 'tools' | 'user' | 'owner';
  categoryLabel: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
}

interface CommandBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  woods?: WoodType[];
  onSelectWood?: (wood: WoodType) => void;
  isOwnerAuth?: boolean;
  currentUser?: { name: string; email?: string } | null;
  onOpenSavedItems?: () => void;
  onOpenAuthModal?: () => void;
}

export const CommandBarModal: React.FC<CommandBarModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  woods = [],
  onSelectWood,
  isOwnerAuth = false,
  currentUser = null,
  onOpenSavedItems = () => {},
  onOpenAuthModal = () => {}
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedCategory('all');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // WhatsApp helper
  const handleOpenWhatsApp = (message: string) => {
    const phone = '6285226231998'; // Toko Kayu Delin Jaya
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  // Base list of items
  const allItems: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // 1. Interactive Tools & WebGL
      {
        id: 'tool-3d',
        category: 'tools',
        categoryLabel: 'Alat & WebGL',
        title: 'Studio 3D Serat Kayu',
        subtitle: 'Inspeksi interaktif model 3D balok, slab meja & orientasi serat kayu 360°',
        icon: <Box className="w-4 h-4 text-emerald-400" />,
        badge: 'WebGL Three.js',
        action: () => {
          onSelectTab('visualizer');
          onClose();
        }
      },
      {
        id: 'tool-order',
        category: 'tools',
        categoryLabel: 'Alat & WebGL',
        title: 'Buat Pesanan & Konsultasi Custom',
        subtitle: 'Kirim spesifikasi dimensi kayu, ketebalan, dan pengerjaan mebel kustom',
        icon: <Plus className="w-4 h-4 text-amber-400" />,
        badge: 'Formulir Langsung',
        action: () => {
          onSelectTab('order');
          onClose();
        }
      },
      {
        id: 'tool-svlk',
        category: 'tools',
        categoryLabel: 'Alat & WebGL',
        title: 'Verifikasi Legalitas SVLK',
        subtitle: 'Cek jaminan kayu 100% legal asal Perhutani resmi tanpa risiko tebang liar',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        badge: 'Perhutani SVLK',
        action: () => {
          onSelectTab('woods');
          onClose();
        }
      },
      {
        id: 'tool-wa',
        category: 'tools',
        categoryLabel: 'Alat & WebGL',
        title: 'Hubungi WhatsApp Pengrajin Workshop',
        subtitle: 'Konsultasi ketersediaan balok kayu mentah dan penawaran harga terbaik',
        icon: <MessageCircle className="w-4 h-4 text-green-400" />,
        badge: 'Respons Cepat',
        action: () => {
          handleOpenWhatsApp('Halo Bengkel Kayu Nusantara Delin Jaya, saya ingin menanyakan pengadaan kayu & mebel kustom.');
        }
      },

      // 2. User & Orders
      {
        id: 'user-wishlist',
        category: 'user',
        categoryLabel: 'Akun & Transaksi',
        title: 'Barang & Spesimen Tersimpan',
        subtitle: 'Lihat daftar kayu favorit dan mebel yang Anda simpan untuk dipesan nanti',
        icon: <Heart className="w-4 h-4 text-rose-400" />,
        badge: 'Koleksi Saya',
        action: () => {
          onOpenSavedItems();
          onClose();
        }
      },
      {
        id: 'user-orders',
        category: 'user',
        categoryLabel: 'Akun & Transaksi',
        title: 'Status Pesanan & Riwayat Pembelian',
        subtitle: currentUser 
          ? `Sesi aktif: ${currentUser.name} • Pantau progres pengerjaan & dokumen pengiriman`
          : 'Masuk akun untuk memantau status pengerjaan kayu dan resi pengiriman',
        icon: <Package className="w-4 h-4 text-amber-400" />,
        badge: currentUser ? 'Terautentikasi' : 'Login Dibutuhkan',
        action: () => {
          if (currentUser) {
            onSelectTab('user-dashboard');
          } else {
            onSelectTab('login');
          }
          onClose();
        }
      },
      {
        id: 'user-auth',
        category: 'user',
        categoryLabel: 'Akun & Transaksi',
        title: currentUser ? `Kelola Akun: ${currentUser.name}` : 'Masuk atau Daftar Akun Baru',
        subtitle: currentUser ? 'Lihat ringkasan akun dan histori pemesanan' : 'Daftar akun pemesan untuk kemudahan repeat order',
        icon: <User className="w-4 h-4 text-sky-400" />,
        action: () => {
          if (currentUser) {
            onSelectTab('user-dashboard');
          } else {
            onSelectTab('login');
          }
          onClose();
        }
      },

      // 3. Furniture Catalog
      {
        id: 'furn-meja',
        category: 'furniture',
        categoryLabel: 'Katalog Mebel',
        title: 'Meja Solid Slab Live-Edge',
        subtitle: 'Meja makan & meja kerja kayu solid utuh dengan sambungan dowel alami',
        icon: <Armchair className="w-4 h-4 text-amber-300" />,
        badge: 'Atelier Kustom',
        action: () => {
          onSelectTab('furniture');
          onClose();
        }
      },
      {
        id: 'furn-buffet',
        category: 'furniture',
        categoryLabel: 'Katalog Mebel',
        title: 'Buffet & Credenza Kayu Solid',
        subtitle: 'Kabinet ruang tamu dengan pintu geser kayu masif dan laci soft-closing',
        icon: <Armchair className="w-4 h-4 text-amber-300" />,
        action: () => {
          onSelectTab('furniture');
          onClose();
        }
      },
      {
        id: 'furn-lemari',
        category: 'furniture',
        categoryLabel: 'Katalog Mebel',
        title: 'Lemari Pakaian & Display Buku',
        subtitle: 'Konstruksi kayu masif kokoh anti rayap dengan finishing satin natural',
        icon: <Armchair className="w-4 h-4 text-amber-300" />,
        action: () => {
          onSelectTab('furniture');
          onClose();
        }
      },
      {
        id: 'furn-bangku',
        category: 'furniture',
        categoryLabel: 'Katalog Mebel',
        title: 'Bangku & Kursi Minimalis Jati',
        subtitle: 'Dudukan ergonomis lekuk natural untuk hunian dan kafe berkelas',
        icon: <Armchair className="w-4 h-4 text-amber-300" />,
        action: () => {
          onSelectTab('furniture');
          onClose();
        }
      },
    ];

    // Dynamic Woods from props or standard catalog
    const woodList = (woods.length > 0 ? woods : [
      { id: 'w-jati', name: 'Jati (Teak)', botanicalName: 'Tectona grandis', characteristics: { kekerasan: '1.155 lbf', ketahanan: 'Kelas I', kadarAir: '10%-12%' } },
      { id: 'w-eboni', name: 'Eboni (Macassar Ebony)', botanicalName: 'Diospyros celebica', characteristics: { kekerasan: '3.220 lbf', ketahanan: 'Kelas I', kadarAir: '8%-11%' } },
      { id: 'w-sonokeling', name: 'Sonokeling (Rosewood)', botanicalName: 'Dalbergia latifolia', characteristics: { kekerasan: '1.780 lbf', ketahanan: 'Kelas I', kadarAir: '10%-12%' } },
      { id: 'w-gaharu', name: 'Gaharu (Agarwood)', botanicalName: 'Aquilaria microcarpa', characteristics: { kekerasan: 'Aromatik', ketahanan: 'Koleksi Seni', kadarAir: 'Resin Alami' } },
      { id: 'w-ulin', name: 'Ulin (Ironwood)', botanicalName: 'Eusideroxylon zwageri', characteristics: { kekerasan: 'Kayu Besi', ketahanan: 'Tahan Air & Rayap', kadarAir: 'Solid' } },
      { id: 'w-mahoni', name: 'Mahoni (Mahogany)', botanicalName: 'Swietenia macrophylla', characteristics: { kekerasan: 'Sedang', ketahanan: 'Kelas III', kadarAir: '12%' } },
      { id: 'w-merbau', name: 'Merbau Papua', botanicalName: 'Intsia bijuga', characteristics: { kekerasan: '1.925 lbf', ketahanan: 'Kelas I-II', kadarAir: '12%' } }
    ] as any[]);

    const woodItems: CommandItem[] = woodList.map(w => ({
      id: `wood-${w.id || w.name}`,
      category: 'woods',
      categoryLabel: 'Kayu Solid',
      title: `Kayu ${w.name}`,
      subtitle: `${w.botanicalName || 'Spesies Nusantara'} • Ketahanan: ${w.characteristics?.ketahanan || 'Kuat & Awet'} • MC: ${w.characteristics?.kadarAir || '< 12%'}`,
      icon: <TreePine className="w-4 h-4 text-amber-500" />,
      badge: 'Legal SVLK',
      action: () => {
        if (onSelectWood && typeof w === 'object' && 'priceRangeEstimate' in w) {
          onSelectWood(w as WoodType);
        }
        onSelectTab('woods');
        onClose();
      }
    }));

    // Owner Operations
    const ownerItems: CommandItem[] = [
      {
        id: 'owner-overview',
        category: 'owner',
        categoryLabel: 'Konsol Pemilik',
        title: 'Ringkasan Eksekutif Atelier',
        subtitle: 'Statistik omzet, inquiry baru, dan log operasional bisnis Delin Jaya',
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        badge: 'Admin Toko',
        action: () => {
          onSelectTab('admin');
          onClose();
        }
      },
      {
        id: 'owner-stock',
        category: 'owner',
        categoryLabel: 'Konsol Pemilik',
        title: 'Manajemen Stok & Harga Kayu',
        subtitle: 'Pembaruan kuantitas log, volume kubikasi, dan status ketersediaan siap kirim',
        icon: <Activity className="w-4 h-4 text-amber-400" />,
        badge: 'Real-time Sync',
        action: () => {
          onSelectTab('admin');
          onClose();
        }
      },
      {
        id: 'owner-infra',
        category: 'owner',
        categoryLabel: 'Konsol Pemilik',
        title: 'Konektivitas Cloud Database & Server Go',
        subtitle: 'Status latensi MongoDB Atlas Cloud dan status daemon kayu-nusantara-backend',
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        badge: 'MongoDB Atlas',
        action: () => {
          onSelectTab('admin');
          onClose();
        }
      }
    ];

    return [...woodItems, ...list, ...ownerItems];
  }, [woods, currentUser, isOwnerAuth, onSelectTab, onSelectWood, onClose, onOpenSavedItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = allItems;

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allItems, selectedCategory, query]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -16 }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className="relative w-full max-w-2xl ring-1 ring-black/10 dark:ring-white/10 p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] shadow-2xl overflow-hidden z-10"
      >
        <div className="rounded-[calc(1rem-0.125rem)] bg-white dark:bg-[#12141a] border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 overflow-hidden shadow-xl flex flex-col max-h-[82vh]">
          
          {/* Search Input Bar */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-[#151821]/50">
            <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik nama kayu (Jati, Eboni), mebel, kalkulator, atau Studio 3D..."
              className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300/60 dark:border-stone-700">
              ESC
            </kbd>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-stone-100 dark:border-stone-800/60 overflow-x-auto no-scrollbar text-xs bg-white dark:bg-[#12141a]">
            {[
              { id: 'all', label: 'Semua Perintah' },
              { id: 'woods', label: 'Kayu Solid' },
              { id: 'furniture', label: 'Mebel' },
              { id: 'tools', label: 'Alat & WebGL' },
              { id: 'user', label: 'Akun & Pesanan' },
              ...(isOwnerAuth ? [{ id: 'owner', label: 'Konsol Pemilik' }] : [])
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#181b24]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-stone-100 dark:divide-stone-800/40"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-stone-500 dark:text-stone-400 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500/50 mx-auto" />
                <p className="text-sm font-medium">Tidak ada hasil yang cocok dengan &quot;{query}&quot;</p>
                <p className="text-xs text-stone-400">Coba kata kunci: Jati, Eboni, Sonokeling, 3D, Pesanan, atau WhatsApp</p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-index={index}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 text-stone-900 dark:text-stone-50 ring-1 ring-amber-500/30'
                        : 'hover:bg-stone-100/80 dark:hover:bg-[#181b24]/80 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-100 dark:bg-[#1b1e28] text-stone-600 dark:text-stone-400 group-hover:text-amber-500'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-300/40 dark:border-stone-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="hidden sm:inline text-[10px] uppercase font-semibold text-stone-400 dark:text-stone-500 tracking-wider">
                        {item.categoryLabel}
                      </span>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-500 translate-x-0.5'
                          : 'text-stone-400 opacity-0 group-hover:opacity-100'
                      }`}>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer Hotkeys Bar */}
          <div className="px-4 py-2.5 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/80 dark:bg-[#151821]/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">↓</kbd>
                <span className="ml-0.5 hidden sm:inline">Navigasi</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">↵</kbd>
                <span className="ml-0.5 hidden sm:inline">Pilih</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">ESC</kbd>
                <span className="ml-0.5 hidden sm:inline">Tutup</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kayu Nusantara • Delin Jaya</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
