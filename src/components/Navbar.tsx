import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterfaceLines } from '@designcodeio/threeui';
import { ThreeMiniWoodSpecimen } from './ThreeMiniWoodSpecimen';
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
  Heart,
  Plus,
  Search
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
  isDark = true,
  isDarkMode = true,
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
  const isThemeDark = isDarkMode ?? isDark ?? true;

  const handleTabClick = (tab: string) => {
    if (isOwnerAuth && tab === 'user-dashboard') {
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
      icon: <Box className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 
    },
  ];

  return (
    <header className="w-full bg-[#0c0d10]/90 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-50 transition-all duration-300 text-stone-100">
      
      {/* ThreeUI Ambient WebGL Micro-Shader Hairline */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden pointer-events-none opacity-45">
        <InterfaceLines
          mode="dark"
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
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* LEFT: Brand Identity + Three.js 3D Specimen Micro-Visualizer */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* 3D WebGL Mini Specimen Cube (Three.js) */}
            <div className="ring-1 ring-amber-500/20 p-0.5 rounded-xl bg-amber-500/10 shadow-2xs flex items-center justify-center">
              <ThreeMiniWoodSpecimen isDark={isThemeDark} />
            </div>

            {/* Brand Logo & Editorial Title */}
            <div className="flex items-center gap-2">
              <div className="h-9 sm:h-10 flex items-center shrink-0">
                <img
                  src="/logo-delin-jaya.png"
                  alt="Toko Delin Jaya Logo"
                  className="h-8 sm:h-9 w-auto max-w-[105px] sm:max-w-[130px] object-contain rounded-md bg-white p-0.5 shadow-2xs border border-white/20 transition-transform group-hover:scale-105"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-stone-100">
                    Kayu Nusantara
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                    SVLK Legal
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-sans hidden sm:block">
                  Atelier Kayu Solid &amp; Custom Furniture
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Navigation Links with Framer Motion Sliding Highlight */}
          <nav className="hidden xl:flex items-center gap-1 relative bg-white/[0.03] p-1 rounded-xl border border-white/[0.07]">
            {navItems.map(item => {
              const isActive = selectedTab === item.id || (item.id === 'visualizer' && selectedTab === '3d');
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer z-10 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-amber-300 font-bold'
                      : 'text-stone-400 hover:text-stone-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute inset-0 bg-amber-500/15 border border-amber-500/35 rounded-lg -z-10 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Compact, Balanced Action Cluster (Zero Overflow / Truncation) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Search Trigger Pill */}
            <button
              onClick={onOpenCommandBar}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white border border-white/[0.08] hover:border-amber-500/40 transition-all cursor-pointer group shadow-2xs"
              title="Cari spesimen kayu, mebel, kalkulator, dan 3D (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-stone-400 text-xs">Cari...</span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/[0.08] text-stone-400 border border-white/[0.1] shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={onOpenCommandBar}
              title="Buka Pencarian & Perintah (Ctrl + K)"
              className="lg:hidden p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
            </button>

            {/* Wishlist Button */}
            {!isOwnerAuth && (
              <button
                onClick={onOpenSavedItems}
                className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-rose-950/20 border border-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
                title="Lihat spesimen kayu tersimpan"
              >
                <Heart className={`w-4 h-4 ${savedItemsCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                {savedItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white shadow-2xs">
                    {savedItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth: Profile or Login */}
            {currentUser ? (
              <button
                onClick={() => handleTabClick('user-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedTab === 'user-dashboard'
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-2xs'
                    : 'bg-white/[0.05] border-white/[0.08] text-stone-200 hover:border-amber-500/50'
                }`}
                title="Buka Akun Pemesan"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[85px] truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={() => handleTabClick('login')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedTab === 'login'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs border-amber-400'
                    : 'bg-white/[0.04] text-stone-200 hover:text-white hover:bg-white/[0.08] border-white/[0.08] hover:border-amber-500/40'
                }`}
                title="Masuk ke akun pemesan terdaftar"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk</span>
              </button>
            )}

            {/* Button-in-Button CTA: Pesan */}
            <button
              onClick={() => handleTabClick('order')}
              className="group inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all duration-200 cursor-pointer border border-amber-400/30"
            >
              <span>Pesan</span>
              <span className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-3 h-3 text-white" />
              </span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Real-time"
              className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
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
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
            >
              {isThemeDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-300 hover:bg-white/[0.06] border border-white/[0.08] cursor-pointer"
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
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden overflow-hidden pt-3 pb-4 space-y-2 border-t border-white/[0.08]"
            >
              {/* Mobile Quick Search Bar */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCommandBar();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-stone-400 text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Cari spesimen kayu, 3D, atau kalkulator...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono">
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-stone-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
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
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium text-stone-300 hover:bg-white/[0.04] cursor-pointer"
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
              <div className="pt-2 border-t border-white/[0.08] space-y-1">
                {currentUser ? (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <button
                      onClick={() => handleTabClick('user-dashboard')}
                      className="flex items-center gap-2 text-sm text-amber-300 font-medium truncate text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{currentUser.name}</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogoutUser();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-400 hover:underline shrink-0 ml-2 cursor-pointer font-medium"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleTabClick('login')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] text-stone-200 border border-white/[0.1] cursor-pointer hover:bg-white/[0.1]"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Masuk Akun</span>
                    </button>
                    <button
                      onClick={() => handleTabClick('register')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-xs"
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
