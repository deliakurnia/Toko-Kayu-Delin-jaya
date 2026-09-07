import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Box,
  Lock,
  User,
  Package,
  Heart,
  Plus
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
  | 'user-dashboard';

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
  onOpenSavedItems = () => {}
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
    { id: 'visualizer', label: 'Studio 3D', icon: <Box className="w-3.5 h-3.5 inline mr-1 text-emerald-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="h-11 sm:h-12 flex items-center shrink-0">
              <img
                src="/logo-delin-jaya.png"
                alt="Toko Delin Jaya Logo"
                className="h-10 sm:h-11 w-auto max-w-[140px] sm:max-w-[170px] object-contain rounded-lg bg-white p-0.5 shadow-xs border border-stone-200/80 dark:border-stone-700/80 transition-transform group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-stone-100">
                  Kayu Nusantara
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  SVLK Legal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                Bengkel Pengadaan Kayu &amp; Mebel Kustom • Delin Jaya
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = selectedTab === item.id || (item.id === 'visualizer' && selectedTab === '3d');
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-semibold'
                      : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-[#16191f]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

            {/* Tersimpan / Wishlist Button - Khusus Pelanggan */}
            {!isOwnerAuth && (
              <button
                onClick={onOpenSavedItems}
                className="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-slate-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 flex items-center gap-1.5"
                title="Lihat barang dan spesimen kayu yang Anda simpan"
              >
                <Heart className={`w-3.5 h-3.5 ${savedItemsCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>Tersimpan</span>
                {savedItemsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs animate-in zoom-in">
                    {savedItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Pesanan & Riwayat Saya - KHUSUS PELANGGAN */}
            {!isOwnerAuth && (
              <button
                onClick={() => {
                  if (currentUser) {
                    handleTabClick('user-dashboard');
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'user-dashboard'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-semibold'
                    : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-[#16191f]'
                }`}
                title="Lihat status pesanan aktif & riwayat pembelian Anda"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Pesanan Saya</span>
              </button>
            )}

            {/* Separator */}
            <div className="h-5 w-px bg-slate-200 dark:bg-stone-800 mx-1.5" />

            {/* Autentikasi Pengguna Pelanggan */}
            {currentUser ? (
              /* SAAT SESI PELANGGAN AKTIF: TAMPILKAN PROFIL PELANGGAN */
              <button
                onClick={() => handleTabClick('user-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  selectedTab === 'user-dashboard'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                    : 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-500/50'
                }`}
                title="Buka Akun Pemesan & Riwayat Pembelian"
              >
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>
            ) : (
              /* SAAT BELUM LOGIN: TAMPILKAN TOMBOL MASUK & DAFTAR TERPISAH */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTabClick('login')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTab === 'login'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
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

            {/* CTA + Buat Pesanan */}
            <button
              onClick={() => handleTabClick('order')}
              className="ml-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pesanan</span>
            </button>
          </nav>

          {/* Action Icons: Notification & Dark Mode */}
          <div className="flex items-center gap-2">
            {/* Real-time Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Real-time"
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-[#16191f] border border-slate-200/80 dark:border-slate-800/80 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950 shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleTheme}
              title={isThemeDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-[#16191f] border border-slate-200/80 dark:border-slate-800/80 transition-colors cursor-pointer"
            >
              {isThemeDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-[#16191f] border border-slate-200/80 dark:border-slate-800/80 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1">
            {navItems.map(item => {
              const isActive = selectedTab === item.id || (item.id === 'visualizer' && selectedTab === '3d');
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-[#16191f]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

            {/* Mobile: Tersimpan */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSavedItems();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-[#16191f] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${savedItemsCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>Barang Tersimpan</span>
              </div>
              {savedItemsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  {savedItemsCount}
                </span>
              )}
            </button>

            {/* Mobile: Pesanan Saya (Disembunyikan saat Sesi Pemilik Aktif demi Privasi Pelanggan) */}
            {!isOwnerAuth && (
              <button
                onClick={() => {
                  if (currentUser) {
                    handleTabClick('user-dashboard');
                  } else {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium cursor-pointer ${
                  selectedTab === 'user-dashboard'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-[#16191f]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Pesanan &amp; Riwayat Saya</span>
                </div>
              </button>
            )}

            {/* Mobile: Buat Pesanan CTA */}
            <button
              onClick={() => handleTabClick('order')}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pesanan Baru</span>
            </button>

            {/* Mobile: Akun Pemesan (Pelanggan) */}
            <div className="pt-2 border-t border-slate-200 dark:border-stone-800 space-y-1">
              {currentUser ? (
                /* SAAT SESI PELANGGAN AKTIF: TAMPILKAN AKUN PELANGGAN */
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
                /* SAAT BELUM LOGIN: TAMPILKAN TOMBOL MASUK DAN DAFTAR */
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
          </div>
        )}
      </div>
    </header>
  );
};
