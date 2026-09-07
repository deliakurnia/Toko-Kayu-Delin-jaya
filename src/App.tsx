import React, { useState, useEffect } from 'react';
import { dbService } from './services/dbService';
import {
  WoodType,
  ProductCategory,
  Inquiry,
  Customer,
  BackupRecord,
  NotificationItem,
  UserAccount,
  SavedItem
} from './types';
import { Navbar } from './components/Navbar';
import { OwnerNavbar } from './components/OwnerNavbar';
import { HeroSection } from './components/HeroSection';
import { ThreeDVisualizer } from './components/ThreeDVisualizer';
import { WoodCatalog } from './components/WoodCatalog';
import { FurnitureCatalog } from './components/FurnitureCatalog';
import { OrderForm } from './components/OrderForm';
import { OwnerDashboard } from './components/OwnerDashboard';
import { UserDashboard } from './components/UserDashboard';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { OwnerAuthGate } from './components/OwnerAuthGate';
import { UserAuthModal } from './components/UserAuthModal';
import { SavedItemsModal } from './components/SavedItemsModal';
import { CommandBarModal } from './components/CommandBarModal';
import { BackupManager } from './components/BackupManager';
import { ApiDocsGuide } from './components/ApiDocsGuide';
import { NotificationCenter } from './components/NotificationCenter';
import { Footer } from './components/Footer';
import { MessageSquare, Box, ArrowRight, ShieldAlert, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Theme state: dark / light (Default: Dark Atelier)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kn_theme');
      if (saved) return saved === 'dark';
      return true;
    }
    return true;
  });

  // Helper to determine if current browser URL targets the owner atelier
  const checkIsOwnerPath = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/owner-atelier' ||
      path === '/portal-pemilik' ||
      path === '/admin' ||
      hash === '#owner-atelier' ||
      hash === '#portal-pemilik' ||
      hash === '#admin' ||
      search.includes('portal=owner')
    );
  };

  // Helper to determine initial active tab from pathname/hash
  const checkInitialTab = (): string => {
    if (typeof window === 'undefined') return 'home';
    if (checkIsOwnerPath()) return 'admin';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/login' || hash === '#login') return 'login';
    if (path === '/register' || hash === '#register') return 'register';
    if (path === '/user-dashboard' || hash === '#user-dashboard') return 'user-dashboard';
    return 'home';
  };

  // Navigation tab state (defaults to 'home', 'login', 'register', or 'admin')
  const [activeTab, setActiveTab] = useState<string>(() => checkInitialTab());

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => dbService.getCurrentUser());
  const [isOwnerAuth, setIsOwnerAuth] = useState<boolean>(() => dbService.isOwnerAuthenticated());
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState<boolean>(false);

  // Application Data States
  const [woods, setWoods] = useState<WoodType[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => dbService.getSavedItems());
  const [isSavedItemsOpen, setIsSavedItemsOpen] = useState<boolean>(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K to toggle Command Bar (Khusus mode pengguna/toko)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (activeTab === 'admin') return; // Owner console does not use search bar
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab]);

  // Selection states for cross-component workflows
  const [selectedWoodFor3D, setSelectedWoodFor3D] = useState<WoodType | null>(null);
  const [prefilledOrderWood, setPrefilledOrderWood] = useState<WoodType | null>(null);
  const [prefilledCategory, setPrefilledCategory] = useState<ProductCategory | null>(null);
  const [prefilledOrderType, setPrefilledOrderType] = useState<'raw_wood' | 'custom_furniture' | null>(null);

  // Sync Dark Mode class to HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('kn_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('kn_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data from simulated database
  const refreshAppData = () => {
    const allWoods = dbService.getWoods() || [];
    const allCats = dbService.getCategories() || [];
    const allInquiries = dbService.getInquiries() || [];
    const allCustomers = dbService.getCustomers() || [];
    const allBackups = dbService.getBackups() || [];
    // Sync auth states first
    const activeOwner = dbService.isOwnerAuthenticated();
    const activeUser = dbService.getCurrentUser();
    setIsOwnerAuth(activeOwner);
    setCurrentUser(activeUser);
    const allSaved = activeOwner ? [] : (dbService.getSavedItems(activeUser) || []);

    // Segmentasi Notifikasi Berdasarkan Hak Akses:
    // - Pemilik Toko: hanya melihat event operasional toko & backup cloud
    // - Pelanggan Aktif: hanya melihat notifikasi pembaruan pesanannya sendiri
    // - Pengunjung / Tamu: tidak melihat notifikasi operasional toko
    let activeNotifs: NotificationItem[] = [];
    if (activeOwner) {
      activeNotifs = dbService.getOwnerNotifications();
    } else if (activeUser) {
      activeNotifs = dbService.getCustomerNotifications(activeUser);
    } else {
      activeNotifs = [];
    }

    setWoods(allWoods);
    setCategories(allCats);
    setInquiries(allInquiries);
    setCustomers(allCustomers);
    setBackups(allBackups);
    setNotifications(activeNotifs);
    setSavedItems(allSaved);

    if (!selectedWoodFor3D && allWoods.length > 0) {
      setSelectedWoodFor3D(allWoods[0]);
    }
  };

  useEffect(() => {
    refreshAppData();

    // Subscribe to DB real-time updates
    const unsubscribe = dbService.subscribe(() => {
      refreshAppData();
    });

    return () => unsubscribe();
  }, []);

  // Secret Route & Hotkey Listener (Ctrl + Shift + O)
  useEffect(() => {
    const handleUrlRoute = () => {
      if (checkIsOwnerPath()) {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl + Shift + O or Cmd + Shift + O
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setActiveTab('admin');
        window.history.pushState({}, '', '/owner-atelier');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Workflow Handlers
  const handleSelectWoodFor3D = (wood: WoodType) => {
    setSelectedWoodFor3D(wood);
    setActiveTab('visualizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderFromCatalog = (wood: WoodType) => {
    setPrefilledOrderWood(wood);
    setPrefilledOrderType('raw_wood');
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCategory = (cat: ProductCategory) => {
    setPrefilledCategory(cat);
    setPrefilledOrderType('custom_furniture');
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderFrom3D = (wood: WoodType) => {
    setPrefilledOrderWood(wood);
    setPrefilledOrderType('raw_wood');
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Owner Secret Navigation Handlers
  const handleOpenOwnerPortal = () => {
    setActiveTab('admin');
    window.history.pushState({}, '', '/owner-atelier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToStore = () => {
    setActiveTab('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutOwner = () => {
    dbService.ownerLogout();
    setIsOwnerAuth(false);
    handleReturnToStore();
    refreshAppData();
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(checkInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsUserAuthModalOpen(false);
    setActiveTab('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshAppData();
  };

  const handleLogoutUser = () => {
    dbService.userLogout();
    setCurrentUser(null);
    setActiveTab('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshAppData();
  };

  const handleOrderSavedItem = (item: SavedItem) => {
    if (item.itemType === 'wood') {
      const targetWood = woods.find(w => w.id === item.referenceId);
      if (targetWood) {
        handleOrderFromCatalog(targetWood);
        return;
      }
    } else if (item.itemType === 'furniture') {
      const targetCat = categories.find(c => c.id === item.referenceId);
      if (targetCat) {
        handleOrderCategory(targetCat);
        return;
      }
    }
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    // Strict Privacy Guard: If owner session is active, owner CANNOT navigate to user profile/dashboard/auth
    if (isOwnerAuth && (tab === 'user-dashboard' || tab === 'login' || tab === 'register')) {
      setActiveTab('admin');
      window.history.pushState({}, '', '/owner-atelier');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveTab(tab);
    if (tab === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (tab === 'register') {
      window.history.pushState({}, '', '/register');
    } else if (tab === 'user-dashboard') {
      window.history.pushState({}, '', '/user-dashboard');
    } else if (tab === 'home') {
      window.history.pushState({}, '', '/');
    } else if (tab === 'admin') {
      window.history.pushState({}, '', '/owner-atelier');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-stone-100 transition-colors duration-200 font-sans">
      {/* Top Navigation: Dedicated Konsol Pemilik vs Etalase Pelanggan */}
      {activeTab === 'admin' ? (
        <OwnerNavbar
          unreadCount={notifications.filter(n => !n.isRead).length}
          pendingInquiriesCount={inquiries.filter(i => i.status === 'new').length}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onReturnToStore={handleReturnToStore}
          onLogoutOwner={handleLogoutOwner}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleTheme}
        />
      ) : (
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleTheme}
          unreadCount={notifications.filter(n => !n.isRead).length}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          pendingInquiriesCount={inquiries.filter(i => i.status === 'new').length}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsUserAuthModalOpen(true)}
          onLogoutUser={handleLogoutUser}
          isOwnerAuth={isOwnerAuth}
          savedItemsCount={savedItems.length}
          onOpenSavedItems={() => setIsSavedItemsOpen(true)}
          onOpenCommandBar={() => setIsCommandBarOpen(true)}
        />
      )}

      {/* Main Content Area with Page Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* 1. HOME VIEW */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <HeroSection
                onStartOrder={() => setActiveTab('order')}
                onExplore3D={() => setActiveTab('visualizer')}
                onViewCatalog={() => setActiveTab('woods')}
                woods={woods}
              />

              {/* Featured 3D Teaser Section */}
              <section className="py-12 bg-white dark:bg-[#16191f] border-y border-slate-200 dark:border-stone-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Box className="w-3.5 h-3.5" />
                        <span>WebGL 3D Studio Engine</span>
                      </div>
                      <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-stone-100">
                        Inspeksi Serat &amp; Dimensi Secara Tiga Dimensi
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 leading-relaxed">
                        Rasakan tekstur guratan kayu Jati, Eboni, Sonokeling, dan Gaharu dalam simulasi material fisik (PBR). Anda dapat memutar sudut 360°, beralih bentuk balok/papan slab, serta memeriksa parameter kadar air langsung di layar.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => setActiveTab('visualizer')}
                        className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102 cursor-pointer"
                      >
                        <Box className="w-4 h-4" />
                        <span>Buka Studio 3D Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Wood Catalog Teaser */}
              <WoodCatalog
                woods={woods}
                onSelectFor3D={handleSelectWoodFor3D}
                onOrderWood={handleOrderFromCatalog}
              />

              {/* Furniture Catalog Teaser */}
              <div className="bg-stone-50 dark:bg-[#0f1115] border-t border-slate-200 dark:border-stone-800">
                <FurnitureCatalog
                  categories={categories}
                  onOrderCategory={handleOrderCategory}
                />
              </div>
            </motion.div>
          )}

          {/* 2. 3D VISUALIZER VIEW */}
          {activeTab === 'visualizer' && (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ThreeDVisualizer
                woods={woods}
                initialWood={selectedWoodFor3D || woods[0]}
                onOrderSelectedWood={handleOrderFrom3D}
              />
            </motion.div>
          )}

          {/* 3. WOODS CATALOG VIEW */}
          {activeTab === 'woods' && (
            <motion.div
              key="woods"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WoodCatalog
                woods={woods}
                onSelectFor3D={handleSelectWoodFor3D}
                onOrderWood={handleOrderFromCatalog}
              />
            </motion.div>
          )}

          {/* 4. CUSTOM FURNITURE CATALOG VIEW */}
          {activeTab === 'furniture' && (
            <motion.div
              key="furniture"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <FurnitureCatalog
                categories={categories}
                onOrderCategory={handleOrderCategory}
              />
            </motion.div>
          )}

          {/* 5. ORDER FORM WIZARD */}
          {activeTab === 'order' && (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <OrderForm
                woods={woods}
                categories={categories}
                preselectedWood={prefilledOrderWood}
                preselectedCategory={prefilledCategory}
                preselectedOrderType={prefilledOrderType}
                onOrderCompleted={() => {
                  refreshAppData();
                }}
                onNavigateToDashboard={() => {
                  if (isOwnerAuth) {
                    setActiveTab('admin');
                  } else {
                    setActiveTab('user-dashboard');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* 6. USER DASHBOARD (DASHBOARD PEMESAN) */}
          {activeTab === 'user-dashboard' && (
            <motion.div
              key="user-dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {isOwnerAuth ? (
                /* PRIVACY SHIELD: Akses Profil User Dibatasi untuk Sesi Pemilik demi Privasi Pelanggan */
                <div className="max-w-md mx-auto py-16 px-4 text-center">
                  <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                        Privasi Pelanggan Dilindungi
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                        Anda saat ini berada dalam sesi <strong>Pemilik Atelier</strong>. Demi menjaga privasi dan kerahasiaan data pembeli, konsol pemilik tidak dapat mengakses akun atau riwayat personal pelanggan.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Kembali ke Konsol Pemilik (Atelier)
                      </button>
                      <button
                        onClick={() => setActiveTab('home')}
                        className="w-full py-2.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium cursor-pointer"
                      >
                        Ke Etalase Toko
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentUser ? (
                <UserDashboard
                  currentUser={currentUser}
                  onNavigateToOrder={() => {
                    setActiveTab('order');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onLogout={handleLogoutUser}
                  onBrowseCatalog={() => {
                    setActiveTab('woods');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOrderSavedItem={handleOrderSavedItem}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 px-4 text-center">
                  <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                        Login Diperlukan
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Silakan daftar atau login dengan email dan nomor WhatsApp aktif Anda untuk mengakses riwayat berkas PDF dan layanan lapor pesanan.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => handleTabChange('login')}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Buka Halaman Masuk / Daftar
                      </button>
                      <button
                        onClick={() => handleTabChange('home')}
                        className="w-full py-2.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium cursor-pointer"
                      >
                        Kembali ke Beranda
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 7. DEDICATED LOGIN PAGE */}
          {activeTab === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LoginPage
                onSuccess={handleAuthSuccess}
                onNavigateToRegister={() => handleTabChange('register')}
                onNavigateToHome={() => handleTabChange('home')}
              />
            </motion.div>
          )}

          {/* 8. DEDICATED REGISTER PAGE */}
          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <RegisterPage
                onSuccess={handleAuthSuccess}
                onNavigateToLogin={() => handleTabChange('login')}
                onNavigateToHome={() => handleTabChange('home')}
              />
            </motion.div>
          )}

          {/* 9. ADMIN / OWNER DASHBOARD (SECURE GATE) */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {isOwnerAuth ? (
                <OwnerDashboard
                  inquiries={inquiries}
                  customers={customers}
                  onRefreshData={refreshAppData}
                  onLogoutOwner={handleLogoutOwner}
                  onReturnToStore={handleReturnToStore}
                />
              ) : (
                <OwnerAuthGate
                  onSuccess={() => {
                    setIsOwnerAuth(true);
                    refreshAppData();
                  }}
                  onCancel={handleReturnToStore}
                />
              )}
            </motion.div>
          )}

          {/* 10. CLOUD BACKUPS (FREE TIER M0) */}
          {activeTab === 'backups' && (
            <motion.div
              key="backups"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <BackupManager
                backups={backups}
                onBackupCompleted={refreshAppData}
              />
            </motion.div>
          )}

          {/* 11. API DOCS & GOLANG INTEGRATION */}
          {activeTab === 'api-docs' && (
            <motion.div
              key="api-docs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ApiDocsGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global User Authentication Modal */}
      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Command Palette Spotlight (Ctrl + K) */}
      <CommandBarModal
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onSelectTab={(tab) => {
          handleTabChange(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        woods={woods}
        onSelectWood={(wood) => {
          setActiveTab('woods');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOwnerAuth={isOwnerAuth}
        currentUser={currentUser}
        onOpenSavedItems={() => setIsSavedItemsOpen(true)}
        onOpenAuthModal={() => setIsUserAuthModalOpen(true)}
      />

      {/* Saved Items / Wishlist Modal */}
      <SavedItemsModal
        isOpen={isSavedItemsOpen}
        onClose={() => setIsSavedItemsOpen(false)}
        savedItems={savedItems}
        onOrderSavedItem={handleOrderSavedItem}
        onBrowseCatalog={() => {
          setActiveTab('woods');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Real-time Event Stream & Simulator Component */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        isOwnerAuth={isOwnerAuth}
        currentUser={currentUser}
        onViewInquiry={() => {
          setIsNotificationOpen(false);
          if (isOwnerAuth) {
            setActiveTab('admin');
          } else {
            setActiveTab('user-dashboard');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Floating Quick Action Button for Direct WhatsApp Inquiry (Customer only) */}
      {activeTab !== 'admin' && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
            title="Ajukan Pesanan Cepat"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Pesan via WhatsApp</span>
          </button>
        </div>
      )}

      {/* Footer (Customer / Public only) */}
      {activeTab !== 'admin' && (
        <Footer onOpenOwnerPortal={handleOpenOwnerPortal} />
      )}
    </div>
  );
}
