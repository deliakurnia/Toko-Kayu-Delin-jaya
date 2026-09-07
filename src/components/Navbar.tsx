import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterfaceLines } from '@designcodeio/threeui';
import { UserAccount } from '../types';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Box,
  User,
  Package,
  Heart,
  Plus,
  Search,
  Sparkles
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'woods'
  | 'furniture'
  | 'order'
  | 'admin'
  | '3d'
  | 'visualizer'
  | 'backup'
  | 'backups'
  | 'api'
  | 'api-docs'
  | 'user-dashboard'
  | 'login'
  | 'register';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  isDark?: boolean;
  isDarkMode?: boolean;
  onToggleDark?: () => void;
  onToggleDarkMode?: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  pendingInquiriesCount?: number;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onLogoutUser?: () => void;
  isOwnerAuth?: boolean;
  savedItemsCount?: number;
  onOpenSavedItems?: () => void;
  onOpenCommandBar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
  isDark,
  isDarkMode,
  onToggleDark,
  onToggleDarkMode,
  unreadCount = 0,
  onOpenNotifications,
  pendingInquiriesCount = 0,
  currentUser = null,
  onOpenAuthModal = () => {},
  onLogoutUser = () => {},
  isOwnerAuth = false,
  savedItemsCount = 0,
  onOpenSavedItems = () => {},
  onOpenCommandBar = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedTab = activeTab || currentTab || 'home';
  const handleToggleTheme = onToggleDarkMode || onToggleDark || (() => {});
  const isThemeDark = isDarkMode ?? isDark ?? false;

  const handleTabClick = (tab: string) => {
    if (isOwnerAuth && tab === 'user-dashboard') {
      // Strict privacy guard: owner cannot visit user profile
      if (onTabChange) onTabChange('admin');
      else if (onSelectTab) onSelectTab('admin');
      setMobileMenuOpen(false);
      return;
    }
    if (onTabChange) onTabChange(tab);
    else if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems: { id: string; label: string; icon?: React.ReactNode }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'woods', label: 'Katalog Kayu' },
    { id: 'furniture', label: 'Katalog Mebel' },
    { 
      id: 'visualizer', 
      label: 'Studio 3D', 
      icon: <Box className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/92 dark:bg-[#0d0e12]/92 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
      
      {/* Subtle ThreeUI WebGL Ambient Hairline Glow */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden pointer-events-none opacity-45">
        <InterfaceLines
          mode={isThemeDark ? 'dark' : 'light'}
          hue={34}
          saturation={1.3}
          speed={0.35}
          opacity={0.65}
          density={0.8}
          strokeWidth={1}
          className="w-full h-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand Logo & Editorial Title */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="ring-1 ring-black/5 dark:ring-white/10 p-1 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="h-10 sm:h-11 flex items-center shrink-0">
                <img
                  src="/logo-delin-jaya.png"
                  alt="Toko Delin Jaya Logo"
                  className="h-9 sm:h-10 w-auto max-w-[130px] sm:max-w-[160px] object-contain rounded-lg bg-white p-0.5 shadow-2xs border border-stone-200/80 dark:border-stone-700/80 transition-transform group-hover:scale-105"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  Kayu Nusantara
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  SVLK Legal
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                Bengkel Pengadaan Kayu &amp; Mebel Kustom • Delin Jaya
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links with Framer Motion Sliding Highlight */}
          <nav className="hidden xl:flex items-center gap-1 relative">
            {navItems.map(item => {
              const isActive = selectedTab === item.id || (item.id === 'visualizer' && selectedTab === '3d');
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer z-10 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute inset-0 bg-amber-500/12 dark:bg-amber-500/20 border border-amber-500/35 rounded-xl -z-10 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Center-Right: Command Bar Trigger Pill */}
          <div className="flex-1 max-w-xs mx-2 hidden md:block">
            <button
              onClick={onOpenCommandBar}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs bg-stone-100/90 dark:bg-[#161821] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-2xs"
              title="Cari kayu, mebel, kalkulator, dan perintah (Ctrl + K)"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Cari spesimen, 3D, kalkulator...</span>
              </div>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300/50 dark:border-stone-700 shrink-0 ml-2">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Section: Customer Wishlist, Orders, Auth, & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Wishlist Button (Khusus Pelanggan) */}
            {!isOwnerAuth && (
              <button
                onClick={onOpenSavedItems}
                className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/20 border border-stone-200/70 dark:border-stone-800/80 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Lihat spesimen kayu tersimpan"
              >
                <Heart className={`w-3.5 h-3.5 ${savedItemsCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="hidden sm:inline">Tersimpan</span>
                {savedItemsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-2xs">
                    {savedItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Pesanan & Riwayat Saya (Khusus Pelanggan) */}
            {!isOwnerAuth && (
              <button
                onClick={() => {
                  if (currentUser) {
                    handleTabClick('user-dashboard');
                  } else {
                    handleTabClick('login');
                  }
                }}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                  selectedTab === 'user-dashboard'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#161821] border-stone-200/70 dark:border-stone-800/80'
                }`}
                title="Lihat status pengerjaan pesanan & riwayat pembelian"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Pesanan Saya</span>
              </button>
            )}

            {/* Autentikasi Pengguna Pelanggan */}
            {currentUser ? (
              /* SAAT SESI PELANGGAN AKTIF: TAMPILKAN PROFIL */
              <button
                onClick={() => handleTabClick('user-dashboard')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  selectedTab === 'user-dashboard'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500/50'
                }`}
                title="Buka Akun Pemesan & Riwayat Transaksi"
              >
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              /* SAAT BELUM LOGIN: TOMBOL MASUK & DAFTAR */
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => handleTabClick('login')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTab === 'login'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 border border-stone-200 dark:border-stone-700'
                  }`}
                  title="Masuk ke akun pemesan terdaftar"
                >
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => handleTabClick('register')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTab === 'register'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                      : 'text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                  title="Daftar akun pemesan baru"
                >
                  <span>Daftar</span>
                </button>
              </div>
            )}

            {/* Button-in-Button CTA: Buat Pesanan */}
            <button
              onClick={() => handleTabClick('order')}
              className="group hidden sm:inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-stone-950 transition-all duration-200 shadow-xs cursor-pointer border border-white/10 dark:border-black/10"
            >
              <span>Buat Pesanan</span>
              <span className="w-6 h-6 rounded-lg bg-white/15 dark:bg-black/10 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={onOpenCommandBar}
              title="Buka Pencarian & Perintah (Ctrl + K)"
              className="md:hidden p-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#161821] border border-stone-200/80 dark:border-stone-800/80 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-500" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Real-time"
              className="relative p-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#161821] border border-stone-200/80 dark:border-stone-800/80 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950 shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleTheme}
              title={isThemeDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#161821] border border-stone-200/80 dark:border-stone-800/80 transition-colors cursor-pointer"
            >
              {isThemeDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#161821] border border-stone-200/80 dark:border-stone-800/80 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer with Framer Motion */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden overflow-hidden border-t border-stone-200/80 dark:border-stone-800/80 pt-3 pb-4 space-y-2"
            >
              {/* Mobile Quick Search Bar */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCommandBar();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-[#161821] border border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Cari spesimen kayu, 3D, kalkulator...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-mono">
                  Ctrl K
                </kbd>
              </button>

              {/* Navigation Tabs */}
              <div className="space-y-1">
                {navItems.map(item => {
                  const isActive = selectedTab === item.id || (item.id === 'visualizer' && selectedTab === '3d');
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#161821]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}

                {/* Mobile: Tersimpan (Wishlist) */}
                {!isOwnerAuth && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSavedItems();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#161821] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className={`w-4 h-4 ${savedItemsCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                      <span>Barang Tersimpan</span>
                    </div>
                    {savedItemsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                        {savedItemsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile: Pesanan Saya */}
                {!isOwnerAuth && (
                  <button
                    onClick={() => {
                      if (currentUser) {
                        handleTabClick('user-dashboard');
                      } else {
                        handleTabClick('login');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium cursor-pointer ${
                      selectedTab === 'user-dashboard'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#161821]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Pesanan &amp; Riwayat Saya</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Mobile CTA: Buat Pesanan */}
              <button
                onClick={() => handleTabClick('order')}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Pesanan Kustom Baru</span>
              </button>

              {/* Mobile: Akun & Auth Controls */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                {currentUser ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <button
                      onClick={() => handleTabClick('user-dashboard')}
                      className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium truncate text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{currentUser.name}</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogoutUser();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-500 hover:underline shrink-0 ml-2 cursor-pointer font-medium"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleTabClick('login')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-200"
                    >
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>Masuk Akun</span>
                    </button>
                    <button
                      onClick={() => handleTabClick('register')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-xs"
                    >
                      <span>Daftar Baru</span>
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
};
