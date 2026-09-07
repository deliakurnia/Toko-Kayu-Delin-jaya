import React, { useState } from 'react';
import { NotificationItem, UserAccount } from '../types';
import { dbService } from '../services/dbService';
import { soundService } from '../services/soundService';
import { Bell, Check, Volume2, VolumeX, Sparkles, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications?: NotificationItem[];
  isOpen?: boolean;
  onClose?: () => void;
  onViewInquiry?: (inquiryId: string) => void;
  isOwnerAuth?: boolean;
  currentUser?: UserAccount | null;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  isOpen = false,
  onClose = () => {},
  onViewInquiry,
  isOwnerAuth = false,
  currentUser = null
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());
  const [filterType, setFilterType] = useState<string>('all');

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
  };

  const handleSimulateFirebaseEvent = () => {
    const randomWoods = ['Jati (Teak)', 'Eboni (Macassar Ebony)', 'Sonokeling (Rosewood)', 'Gaharu (Agarwood)'];
    const randomCities = ['Jakarta Selatan', 'Surabaya', 'Denpasar', 'Yogyakarta', 'Medan', 'Semarang'];
    const randomNames = ['Dewi Lestari', 'Agus Wijaya', 'Bambang Pamungkas', 'Nadia Safitri', 'Reza Rahadian'];

    const chosenWood = randomWoods[Math.floor(Math.random() * randomWoods.length)];
    const chosenCity = randomCities[Math.floor(Math.random() * randomCities.length)];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const isRepeat = Math.random() > 0.5;
    const orderCount = isRepeat ? Math.floor(Math.random() * 4) + 2 : 1;

    soundService.playLoyaltyChime();

    // Notifikasi simulasi khusus untuk konsol Owner
    dbService.addNotification({
      title: isRepeat ? `⭐ Repeat Order #${orderCount}: ${chosenName}` : `Inquiry Baru: ${chosenName}`,
      message: `${chosenName} (${chosenCity}) mengajukan inquiry pesanan ${chosenWood} via WhatsApp.`,
      type: isRepeat ? 'customer' : 'inquiry',
      priority: isRepeat ? 'high' : 'normal',
      targetAudience: 'owner'
    });
  };

  const filtered = safeNotifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          />

          {/* Drawer / Flyout */}
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white dark:bg-[#16191f] text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800/80 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#16191f]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                    Pusat Notifikasi
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isOwnerAuth 
                      ? 'Konsol Pemilik Toko (Atelier Studio)' 
                      : currentUser 
                        ? `Pembaruan Pesanan (${currentUser.name})` 
                        : 'Pembaruan Layanan & Status Pesanan'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Mute button */}
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? 'Nyalakan Chime Kayu' : 'Bisukan Suara'}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c212a] transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </button>

                <button
                  onClick={onClose}
                  className="px-2.5 py-1 text-xs rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c212a] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Simulated Live Event Banner - HANYA UNTUK SESI PEMILIK AKTIF */}
            {isOwnerAuth && (
              <div className="p-3 bg-slate-50 dark:bg-[#0f1115] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulasi Event Inquiry:</span>
                </div>
                <button
                  onClick={handleSimulateFirebaseEvent}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  + Picu Event Uji Coba
                </button>
              </div>
            )}

            {/* Filter Tabs & Bulk Actions - Segmented between Owner & Customer */}
            <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1">
                {(isOwnerAuth
                  ? [
                      { id: 'all', label: 'Semua' },
                      { id: 'inquiry', label: 'Inquiry' },
                      { id: 'customer', label: 'Pelanggan' },
                      { id: 'backup', label: 'Backup' }
                    ]
                  : [
                      { id: 'all', label: 'Semua' },
                      { id: 'inquiry', label: 'Pesanan Saya' },
                      { id: 'system', label: 'Layanan' }
                    ]
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      filterType === tab.id
                        ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c212a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {safeNotifications.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => {
                      if (isOwnerAuth) {
                        dbService.markAllNotificationsAsReadForRole('owner');
                      } else {
                        dbService.markAllNotificationsAsReadForRole('customer', currentUser);
                      }
                    }}
                    title="Tandai Semua Sudah Dibaca"
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    <Check className="w-3 h-3" />
                    <span>Baca</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isOwnerAuth) {
                        dbService.clearNotificationsForRole('owner');
                      } else {
                        dbService.clearNotificationsForRole('customer', currentUser);
                      }
                    }}
                    title="Hapus Semua Notifikasi Sesi Ini"
                    className="flex items-center gap-1 text-rose-500 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Belum ada notifikasi baru</p>
                  <p className="text-xs mt-1">
                    {isOwnerAuth
                      ? 'Aktivitas pesanan baru masuk dan sistem atelier akan tercatat di sini.'
                      : 'Pembaruan progres pengerjaan dan status pengiriman pesanan Anda akan tercatat di sini.'}
                  </p>
                </div>
              ) : (
                filtered.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      dbService.markNotificationAsRead(notif.id);
                      if (notif.inquiryId && onViewInquiry) {
                        onViewInquiry(notif.inquiryId);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      !notif.isRead
                        ? 'bg-white dark:bg-[#1c212a] border-emerald-500/40 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-[#0f1115]/70 border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {notif.priority === 'high' ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.type === 'inquiry' && notif.inquiryId && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span>Buka detail pesanan</span>
                        <span>→</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Status */}
            <div className="p-3 bg-slate-50 dark:bg-[#0f1115] border-t border-slate-200 dark:border-slate-800 text-[11px] text-center text-slate-500 dark:text-slate-400">
              <span>
                {isOwnerAuth
                  ? 'Saluran Notifikasi Internal Atelier • Sinkronisasi Aktif'
                  : 'Pembaruan Real-Time Terproteksi • Kayu Nusantara'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
