import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterfaceLines } from '@designcodeio/threeui';
import { ThreeMiniWoodSpecimen } from './ThreeMiniWoodSpecimen';
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
  Activity
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
}

export const OwnerNavbar: React.FC<OwnerNavbarProps> = ({
  activeSection = 'overview',
  onSelectSection = (_section: string) => {},
  unreadCount = 0,
  pendingInquiriesCount = 0,
  onOpenNotifications = () => {},
  onReturnToStore,
  onLogoutOwner,
  isDarkMode = true,
  onToggleDarkMode = () => {}
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
    <header className="w-full bg-[#0c0d10]/95 backdrop-blur-2xl border-b border-amber-900/30 sticky top-0 z-50 transition-all duration-300 text-stone-100">
      
      {/* ThreeUI Ambient WebGL Micro-Shader Hairline */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden pointer-events-none opacity-45">
        <InterfaceLines
          mode="dark"
          hue={34}
          saturation={1.4}
          speed={0.35}
          opacity={0.65}
          density={0.8}
          strokeWidth={1}
          className="w-full h-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* LEFT: Atelier Brand & Three.js 3D Specimen */}
          <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
            <div className="ring-1 ring-amber-500/30 p-0.5 rounded-xl bg-amber-500/10 shadow-2xs flex items-center justify-center">
              <ThreeMiniWoodSpecimen isDark={true} />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-9 sm:h-10 flex items-center shrink-0">
                <img
                  src="/logo-delin-jaya.png"
                  alt="Toko Delin Jaya Logo"
                  className="h-8 sm:h-9 w-auto max-w-[105px] sm:max-w-[125px] object-contain rounded-md bg-white p-0.5 shadow-2xs border border-amber-500/30"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-amber-400">
                    Konsol Pemilik
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Sesi Terlindungi
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-sans hidden sm:block">
                  Manajemen Workshop Delin Jaya
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Navigation Links for Owner Workspace */}
          <nav className="hidden xl:flex items-center gap-1 relative bg-white/[0.03] p-1 rounded-xl border border-white/[0.07]">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 z-10 ${
                    isActive
                      ? 'text-amber-300 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
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
                      className="absolute inset-0 bg-[#212433] rounded-lg border border-amber-500/35 shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Action Controls (No Search Bar) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Operational Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Operasional Toko"
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
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Return to Public Storefront */}
            <button
              onClick={onReturnToStore}
              title="Lihat Etalase Publik"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 border border-white/[0.1] transition-colors cursor-pointer"
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
              className="xl:hidden p-2 rounded-xl text-stone-300 hover:bg-white/[0.06] border border-white/[0.08] cursor-pointer"
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
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="xl:hidden overflow-hidden pt-3 pb-3 space-y-1.5 border-t border-white/[0.08]"
            >
              {/* Owner Sections List */}
              <div className="space-y-1">
                {navItems.map(item => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-stone-300 hover:bg-white/[0.04]'
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
              <div className="pt-2 border-t border-white/[0.08] flex gap-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onReturnToStore();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] text-stone-200 border border-white/[0.1] cursor-pointer"
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
