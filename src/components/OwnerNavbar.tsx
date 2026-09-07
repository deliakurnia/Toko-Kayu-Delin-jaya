import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
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
  isDarkMode = false,
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
    <header className="sticky top-0 z-40 w-full bg-stone-900/95 dark:bg-[#0c0d10]/95 backdrop-blur-md border-b border-amber-900/40 dark:border-stone-800 text-stone-100 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Konsol Identifier */}
          <div className="flex items-center gap-3 select-none">
            <div className="h-10 flex items-center shrink-0">
              <img
                src="/logo-delin-jaya.png"
                alt="Toko Delin Jaya Logo"
                className="h-9 w-auto max-w-[130px] object-contain rounded-md bg-white p-0.5 shadow-xs border border-amber-500/30"
              />
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

          {/* Desktop Owner Workspace Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-xs'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-xs animate-in zoom-in">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Owner Notifications, Dark Mode, Etalase, Logout */}
          <div className="flex items-center gap-2">
            {/* Owner Operational Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Operasional Toko"
              className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
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
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-5 w-px bg-stone-700 mx-1 hidden sm:block" />

            {/* Ke Etalase Toko */}
            <button
              onClick={onReturnToStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700 transition-colors cursor-pointer"
              title="Buka tampilan etalase toko untuk pelanggan"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>Etalase Toko</span>
            </button>

            {/* Kunci & Keluar (Logout Owner) */}
            <button
              onClick={onLogoutOwner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-all cursor-pointer"
              title="Kunci konsol pemilik dan keluar"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Kunci &amp; Keluar</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-300 hover:bg-stone-800 border border-stone-700/60 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Owner Workspace */}
        {mobileOpen && (
          <div className="xl:hidden py-3 border-t border-stone-800 space-y-1 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              {navItems.map(item => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-800 flex gap-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onReturnToStore();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-stone-800 text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Etalase Toko</span>
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onLogoutOwner();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci &amp; Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
