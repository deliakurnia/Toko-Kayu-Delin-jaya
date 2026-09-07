import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterfaceLines } from '@designcodeio/threeui';
import {
  ShieldCheck,
  LogOut,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  Database,
  Truck,
  CreditCard,
  AlertTriangle,
  Menu,
  X,
  Package,
  Activity,
  Search
} from 'lucide-react';

export type OwnerNavSection = 
  | 'overview' 
  | 'inquiries' 
  | 'stock' 
  | 'finance' 
  | 'production' 
  | 'reports' 
  | 'infrastructure';

interface OwnerNavbarProps {
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  unreadCount?: number;
  pendingInquiriesCount?: number;
  onOpenNotifications?: () => void;
  onReturnToStore: () => void;
  onLogoutOwner: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenCommandBar?: () => void;
}

export const OwnerNavbar: React.FC<OwnerNavbarProps> = ({
  activeSection = 'overview',
  onSelectSection = (_section: string) => {},
  unreadCount = 0,
  pendingInquiriesCount = 0,
  onOpenNotifications = () => {},
  onReturnToStore,
  onLogoutOwner,
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onOpenCommandBar = () => {}
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: string; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Ringkasan', icon: <Layers className="w-3.5 h-3.5" /> },
    { 
      id: 'inquiries', 
      label: 'Inquiry Masuk', 
      icon: <Package className="w-3.5 h-3.5" />, 
      badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : undefined 
    },
    { id: 'stock', label: 'Stok Kayu', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'finance', label: 'Kas & Bayar', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'production', label: 'Progres & Kargo', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Kendala', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'infrastructure', label: 'Cloud & Database', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (id: string) => {
    onSelectSection(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0e13]/95 text-stone-100 backdrop-blur-xl border-b border-amber-900/30 dark:border-stone-800 shadow-md transition-colors duration-200">
      
      {/* ThreeUI WebGL Ambient Hairline Micro-Shader */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden pointer-events-none opacity-50">
        <InterfaceLines
          mode="dark"
          hue={34}
          saturation={1.4}
          speed={0.4}
          opacity={0.7}
          density={0.85}
          strokeWidth={1}
          className="w-full h-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand & Konsol Identifier */}
          <div className="flex items-center gap-3 select-none shrink-0">
            <div className="ring-1 ring-amber-500/20 p-1 rounded-xl bg-amber-500/[0.04]">
              <div className="h-9 sm:h-10 flex items-center shrink-0">
                <img
                  src="/logo-delin-jaya.png"
                  alt="Toko Delin Jaya Logo"
                  className="h-8 sm:h-9 w-auto max-w-[125px] object-contain rounded-md bg-white p-0.5 shadow-2xs border border-amber-500/30"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-amber-400">
                  Konsol Pemilik Atelier
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Sesi Terlindungi
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                Manajemen Pengadaan Kayu Solid &amp; Custom Furniture
              </p>
            </div>
          </div>

          {/* Desktop Owner Workspace Navigation with Framer Motion Sliding Pill */}
          <nav className="hidden xl:flex items-center gap-1 relative">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 z-10 ${
                    isActive
                      ? 'text-amber-300 font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-2xs animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="ownerNavbarActiveIndicator"
                      className="absolute inset-0 bg-amber-500/20 border border-amber-500/40 rounded-xl -z-10 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Command Bar Trigger Pill for Owner */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenCommandBar}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-stone-800/80 text-stone-300 hover:text-white border border-stone-700/80 hover:border-amber-500/50 transition-all cursor-pointer group shadow-2xs"
              title="Pencarian Operasional & Perintah Cepat (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-stone-400">Cari stok, kas, cloud...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-900 text-stone-400 border border-stone-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons: Owner Notifications, Dark Mode, Etalase, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Search Button */}
            <button
              onClick={onOpenCommandBar}
              title="Buka Perintah Cepat (Ctrl + K)"
              className="md:hidden p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
            </button>

            {/* Owner Operational Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Operasional Toko"
              className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
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
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Return to Public Storefront */}
            <button
              onClick={onReturnToStore}
              title="Lihat Etalase Publik"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Etalase</span>
            </button>

            {/* Logout Owner */}
            <button
              onClick={onLogoutOwner}
              title="Kunci & Keluar Konsol"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Kunci Konsol</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-300 hover:bg-stone-800 border border-stone-700/60 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer with Framer Motion */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden overflow-hidden border-t border-stone-800 pt-3 pb-4 space-y-1.5"
            >
              {/* Mobile Quick Search Bar */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenCommandBar();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-800/90 border border-stone-700 text-stone-400 text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Cari data operasional, stok, kas...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-900 text-[10px] font-mono">
                  Ctrl K
                </kbd>
              </button>

              {/* Owner Sections List */}
              <div className="space-y-1 pt-1">
                {navItems.map(item => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-stone-300 hover:bg-stone-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Store Return & Logout */}
              <div className="pt-2 border-t border-stone-800 flex gap-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onReturnToStore();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-200 border border-stone-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lihat Toko</span>
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onLogoutOwner();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kunci Konsol</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
};
