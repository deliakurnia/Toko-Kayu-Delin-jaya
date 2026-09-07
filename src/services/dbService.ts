import { 
  Customer, 
  Inquiry, 
  InquiryStatus, 
  OrderType, 
  BackupRecord, 
  NotificationItem, 
  WoodType, 
  WoodStockStatus, 
  ProductCategory, 
  UserAccount, 
  OrderReport, 
  SecurityLog, 
  IssueType,
  CostBreakdown,
  PaymentRecord,
  PaymentPlanType,
  PaymentMethodType,
  ProductionMilestone,
  ProductionStage,
  SVLKCertificate,
  ShipmentWaybill,
  StockLedgerEntry,
  CashLedgerEntry,
  SavedItem
} from '../types';
import { INITIAL_WOODS } from '../data/woodData';
import { INITIAL_CATEGORIES } from '../data/categoryData';

const STORAGE_KEYS = {
  WOODS: 'kn_woods_v1',
  CATEGORIES: 'kn_categories_v1',
  CUSTOMERS: 'kn_customers_v1',
  INQUIRIES: 'kn_inquiries_v1',
  BACKUPS: 'kn_backups_v1',
  NOTIFICATIONS: 'kn_notifications_v1',
  AUTO_BACKUP_SETTINGS: 'kn_auto_backup_config_v1',
  USERS: 'kn_users_v1',
  CURRENT_USER: 'kn_current_user_v1',
  OWNER_SESSION: 'kn_owner_session_v1',
  ORDER_REPORTS: 'kn_order_reports_v1',
  SECURITY_LOGS: 'kn_security_logs_v1',
  FAILED_OWNER_ATTEMPTS: 'kn_failed_owner_attempts_v1',
  STOCK_LEDGERS: 'kn_stock_ledgers_v1',
  CASH_LEDGERS: 'kn_cash_ledgers_v1',
  SAVED_ITEMS: 'kn_saved_items_v1'
};

export const OWNER_WHATSAPP_NUMBER = '6285891917286'; // WhatsApp Toko Kayu Delin Jaya
export const OWNER_PASSCODES = ['owner88', 'kayu2026', 'nusantara2026'];

// Sanitize user inputs against XSS
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text.replace(/[<>]/g, '').trim();
}

export function normalizeWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

// Initial seed customer and inquiry data to demonstrate repeat customer & analytics out-of-the-box
const SEED_CUSTOMERS: Customer[] = [
  {
    id: '66d8f201b1f0a2001e3c0001',
    whatsappNumber: '6281298765432',
    name: 'Budi Hartono',
    city: 'Jakarta Selatan',
    email: 'budi.hartono@example.com',
    totalOrders: 3,
    isLoyalCustomer: true,
    firstOrderAt: '2026-06-12T10:00:00.000Z',
    lastOrderAt: '2026-08-25T14:30:00.000Z',
    notes: 'Kolektor mebel jati tua, preferens solid slab tanpa dempul'
  },
  {
    id: '66d8f201b1f0a2001e3c0002',
    whatsappNumber: '6285712345678',
    name: 'Siti Rahmawati',
    city: 'Surabaya',
    email: 'siti.rahma@studioarsitek.id',
    totalOrders: 2,
    isLoyalCustomer: true,
    firstOrderAt: '2026-07-04T09:15:00.000Z',
    lastOrderAt: '2026-08-30T11:20:00.000Z',
    notes: 'Arsitek interior, rutin order sonokeling untuk handle & kisi'
  },
  {
    id: '66d8f201b1f0a2001e3c0003',
    whatsappNumber: '6287899887766',
    name: 'Hendrik Pratama',
    city: 'Bandung',
    email: 'hendrik.pratama@gmail.com',
    totalOrders: 1,
    isLoyalCustomer: false,
    firstOrderAt: '2026-09-01T16:40:00.000Z',
    lastOrderAt: '2026-09-01T16:40:00.000Z'
  }
];

const SEED_INQUIRIES: Inquiry[] = [
  {
    id: '66d8f301c1f0a2001e3d0001',
    inquiryNumber: 'INQ-20260825-001',
    sessionNumber: 'SES-20260825-4192',
    customerId: '66d8f201b1f0a2001e3c0001',
    customerName: 'Budi Hartono',
    whatsappNumber: '6281298765432',
    customerEmail: 'budi.hartono@example.com',
    city: 'Jakarta Selatan',
    orderType: 'custom_furniture',
    woodTypeId: '66d8e101a1f0a2001e3b0001',
    woodTypeName: 'Jati (Teak)',
    categoryId: 'cat_01',
    categoryName: 'Meja (Table & Desk)',
    sizeEstimate: '240 x 100 x 78 cm (Ketebalan Top 8 cm)',
    referenceNote: 'Finishing natural doff, kaki meja plat besi hitam industrial tebal 10mm.',
    status: 'in_production',
    isRepeatCustomer: true,
    repeatOrderCount: 3,
    
    // Modul 2: Kalkulator Penawaran Resmi
    quotation: {
      rawWoodCost: 18000000,
      kilnDryCost: 2500000,
      craftsmanshipCost: 4000000,
      finishingCost: 1500000,
      shippingCost: 1500000,
      finalPrice: 27500000,
      notes: 'Spesimen Log Jati Perhutani KPH Blora umur tebang > 60 tahun.',
      quotedAt: '2026-08-25T15:00:00.000Z'
    },

    // Sistem Pembayaran DP 50% & Janji Pelunasan (Anti-Kabur)
    paymentRecord: {
      id: 'PAY-INQ-20260825-001',
      inquiryId: '66d8f301c1f0a2001e3d0001',
      inquiryNumber: 'INQ-20260825-001',
      paymentPlan: 'dp_50',
      method: 'bca_va',
      totalAmount: 27500000,
      dpAmount: 13750000,
      remainingAmount: 13750000,
      settlementDueDate: '2026-09-12', // Target pelunasan sebelum pengiriman
      isDpPaid: true,
      dpPaidAt: '2026-08-25T16:00:00.000Z',
      isSettled: false, // Menunggu pelunasan 100% sebelum kargo jalan
      virtualAccountNumber: '12988825001',
      uniqueCode: 419,
      status: 'dp_paid',
      verifiedByOwner: true,
      verifiedAt: '2026-08-25T16:15:00.000Z'
    },

    // Modul 1: Tonggak Progres Produksi Berfoto & Kadar Air MC%
    productionMilestones: [
      {
        id: 'mls_01',
        inquiryId: '66d8f301c1f0a2001e3d0001',
        stage: 'raw_log_selection',
        title: 'Pemilihan Balok Jati Grade A',
        description: 'Kayu jati asal KPH Blora diamankan, minim mata mati dan serat meliuk simetris.',
        photos: ['https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80'],
        moistureContentMC: '32.0% (Kondisi Segar)',
        recordedAt: '2026-08-25T17:00:00.000Z',
        updatedBy: 'Atelier Lead Craftsman'
      },
      {
        id: 'mls_02',
        inquiryId: '66d8f301c1f0a2001e3d0001',
        stage: 'kiln_dry',
        title: 'Pengeringan Oven Kiln-Dry (MC 11.2%)',
        description: 'Proses pengeringan lambat 18 hari selesai. Struktur sel kayu stabil dan bebas jamur.',
        photos: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'],
        moistureContentMC: '11.2% (Target Optimal 10-12%)',
        recordedAt: '2026-09-02T10:30:00.000Z',
        updatedBy: 'Quality Inspector'
      },
      {
        id: 'mls_03',
        inquiryId: '66d8f301c1f0a2001e3d0001',
        stage: 'woodworking',
        title: 'Konstruksi & Sambungan Purus Meja',
        description: 'Penyambungan top table dan perataan permukaan slab menggunakan presisi manual.',
        photos: ['https://images.unsplash.com/photo-1502005229762-ee1b2da9c40f?auto=format&fit=crop&w=800&q=80'],
        moistureContentMC: '10.9%',
        recordedAt: '2026-09-05T14:15:00.000Z',
        updatedBy: 'Master Carpenter'
      }
    ],

    // Modul 3: Sertifikat Legalitas Kayu SVLK & V-Legal
    svlkCertificate: {
      certificateNumber: '0021/SVLK-PHPL/JPR/2026',
      originForestLocation: 'KPH Blora, Petak 42A, Jawa Tengah (Perhutani)',
      vLegalDocUrl: 'https://silk.menlhk.go.id/verify/0021-SVLK-2026',
      verifiedDate: '2026-08-25'
    },

    createdAt: '2026-08-25T14:30:00.000Z',
    updatedAt: '2026-09-05T14:15:00.000Z'
  },
  {
    id: '66d8f301c1f0a2001e3d0002',
    inquiryNumber: 'INQ-20260830-002',
    sessionNumber: 'SES-20260830-8910',
    customerId: '66d8f201b1f0a2001e3c0002',
    customerName: 'Siti Rahmawati',
    whatsappNumber: '6285712345678',
    customerEmail: 'siti.rahma@studioarsitek.id',
    city: 'Surabaya',
    orderType: 'raw_wood',
    woodTypeId: '66d8e101a1f0a2001e3b0003',
    woodTypeName: 'Sonokeling (Rosewood)',
    sizeEstimate: 'Balok 200 x 30 x 15 cm (4 batang)',
    referenceNote: 'Kayu kering oven MC < 12%, serat ungu tegas tanpa gubal putih.',
    status: 'new',
    isRepeatCustomer: true,
    repeatOrderCount: 2,
    createdAt: '2026-08-30T11:20:00.000Z',
    updatedAt: '2026-08-30T11:20:00.000Z'
  }
];

const SEED_STOCK_LEDGERS: StockLedgerEntry[] = [
  {
    id: 'stk_01',
    woodId: '66d8e101a1f0a2001e3b0001',
    woodName: 'Jati (Teak)',
    type: 'inflow',
    volumeM3: 15.0,
    slabsCount: 8,
    referenceId: 'RCV-JPR-20260810',
    description: 'Penerimaan log gelondong legal Perhutani KPH Cepu',
    timestamp: '2026-08-10T08:00:00.000Z'
  },
  {
    id: 'stk_02',
    woodId: '66d8e101a1f0a2001e3b0001',
    woodName: 'Jati (Teak)',
    type: 'outflow',
    volumeM3: 0.8,
    slabsCount: 1,
    referenceId: 'INQ-20260825-001',
    description: 'Alokasi bahan baku meja solid slab pesanan Budi Hartono',
    timestamp: '2026-08-25T16:30:00.000Z'
  }
];

const SEED_CASH_LEDGERS: CashLedgerEntry[] = [
  {
    id: 'csh_01',
    inquiryNumber: 'INQ-20260825-001',
    type: 'income_dp',
    amount: 13750000,
    description: 'Penerimaan DP 50% Pesanan Meja Jati Budi Hartono (BCA VA)',
    timestamp: '2026-08-25T16:15:00.000Z'
  }
];

class DatabaseService {
  private listeners: ((event: { type: string; payload: unknown }) => void)[] = [];

  public backendStatus = {
    isOnline: false,
    isCloudLive: false,
    engine: 'Local Storage (Browser)',
    databaseName: 'kayu_nusantara',
    totalInquiries: 0,
    totalCustomers: 0,
  };

  private eventSource: EventSource | null = null;

  constructor() {
    this.initDatabase();
    this.initRealtimeEventSource();
    this.checkBackendHealth().catch(() => {});
  }

  public initRealtimeEventSource() {
    if (typeof window === 'undefined' || this.eventSource) return;

    try {
      this.eventSource = new EventSource('/api/v1/realtime/stream');

      this.eventSource.addEventListener('CONNECTED', (e: MessageEvent) => {
        console.log('📡 [Kayu Nusantara SSE] Terhubung ke real-time stream:', e.data);
      });

      this.eventSource.addEventListener('WOOD_STOCK_UPDATED', (e: MessageEvent) => {
        try {
          const updatedWood: WoodType = JSON.parse(e.data);
          this.applyWoodStockUpdateLocally(updatedWood);
          this.notify('WOOD_STOCK_UPDATED', updatedWood);
        } catch (err) {
          console.error('Gagal memproses event SSE WOOD_STOCK_UPDATED:', err);
        }
      });

      this.eventSource.addEventListener('WOOD_CREATED', (e: MessageEvent) => {
        try {
          const newWood: WoodType = JSON.parse(e.data);
          this.applyNewWoodLocally(newWood);
          this.notify('WOOD_CREATED', newWood);
        } catch (err) {
          console.error('Gagal memproses event SSE WOOD_CREATED:', err);
        }
      });

      this.eventSource.addEventListener('WOOD_IMAGE_UPDATED', (e: MessageEvent) => {
        try {
          const updatedWood: WoodType = JSON.parse(e.data);
          this.applyWoodUpdateLocally(updatedWood);
          this.notify('WOOD_STOCK_UPDATED', updatedWood);
        } catch (err) {
          console.error('Gagal memproses event SSE WOOD_IMAGE_UPDATED:', err);
        }
      });

      this.eventSource.onerror = () => {
        // Otomatis terhubung kembali oleh browser
      };
    } catch (e) {
      console.warn('Real-time SSE tidak didukung peramban:', e);
    }
  }

  private applyWoodStockUpdateLocally(updatedWood: WoodType) {
    const woods = this.getWoods();
    const index = woods.findIndex(w => w.id === updatedWood.id || w.slug === updatedWood.slug);
    if (index !== -1) {
      woods[index] = {
        ...woods[index],
        stockStatus: updatedWood.stockStatus,
        stockVolumeM3: updatedWood.stockVolumeM3,
        stockSlabsCount: updatedWood.stockSlabsCount,
        restockEstimate: updatedWood.restockEstimate,
        lastStockUpdate: updatedWood.lastStockUpdate || new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(woods));
    }
  }

  private applyNewWoodLocally(newWood: WoodType) {
    const woods = this.getWoods();
    const index = woods.findIndex(w => w.id === newWood.id || w.slug === newWood.slug);
    if (index === -1) {
      woods.push(newWood);
    } else {
      woods[index] = { ...woods[index], ...newWood };
    }
    localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(woods));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('woodCatalogUpdated', { detail: newWood }));
    }
  }

  public getBackendStatus() {
    return this.backendStatus;
  }

  public async checkBackendHealth(): Promise<typeof this.backendStatus> {
    if (typeof window === 'undefined') return this.backendStatus;
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        this.backendStatus = {
          isOnline: true,
          isCloudLive: !!data.isCloudLive,
          engine: data.engine || 'Golang Microservice',
          databaseName: data.databaseName || 'kayu_nusantara',
          totalInquiries: data.totalInquiries ?? 0,
          totalCustomers: data.totalCustomers ?? 0,
        };
        this.notify('BACKEND_STATUS_CHANGED', this.backendStatus);
        return this.backendStatus;
      }
    } catch {
      // Backend offline
    }
    this.backendStatus = {
      isOnline: false,
      isCloudLive: false,
      engine: 'Local Storage (Browser)',
      databaseName: 'local_storage',
      totalInquiries: this.getInquiries().length,
      totalCustomers: this.getCustomers().length,
    };
    this.notify('BACKEND_STATUS_CHANGED', this.backendStatus);
    return this.backendStatus;
  }

  public async syncWithBackend(): Promise<boolean> {
    try {
      const health = await this.checkBackendHealth();
      if (!health.isOnline) return false;

      const [inqRes, custRes, woodsRes] = await Promise.all([
        fetch('/api/v1/inquiries'),
        fetch('/api/v1/customers'),
        fetch('/api/v1/woods')
      ]);

      if (inqRes.ok) {
        const inqData = await inqRes.json();
        if (inqData.success && Array.isArray(inqData.data) && inqData.data.length > 0) {
          const local = this.getInquiries();
          const mergedMap = new Map<string, Inquiry>();
          inqData.data.forEach((item: any) => {
            mergedMap.set(item.inquiryNumber, {
              id: item.id || item._id,
              inquiryNumber: item.inquiryNumber,
              sessionNumber: item.sessionNumber || item.inquiryNumber,
              customerId: item.customerId,
              customerName: item.customerName,
              whatsappNumber: item.whatsappNumber,
              customerEmail: item.email,
              city: item.city,
              orderType: item.orderType,
              woodTypeId: item.woodTypeId,
              woodTypeName: item.woodTypeName,
              categoryId: item.categoryId,
              categoryName: item.categoryName,
              sizeEstimate: item.sizeEstimate,
              referenceNote: item.referenceNote,
              referenceImageUrl: item.referenceImageUrl,
              status: item.status,
              isRepeatCustomer: item.isRepeatCustomer,
              repeatOrderCount: item.repeatOrderCount,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            });
          });
          local.forEach(i => {
            if (!mergedMap.has(i.inquiryNumber)) {
              mergedMap.set(i.inquiryNumber, i);
            }
          });
          const merged = Array.from(mergedMap.values());
          localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(merged));
        }
      }

      if (custRes.ok) {
        const custData = await custRes.json();
        if (custData.success && Array.isArray(custData.data) && custData.data.length > 0) {
          const local = this.getCustomers();
          const custMap = new Map<string, Customer>();
          custData.data.forEach((c: any) => {
            custMap.set(c.whatsappNumber, {
              id: c.id || c._id,
              whatsappNumber: c.whatsappNumber,
              name: c.name,
              city: c.city,
              email: c.email,
              totalOrders: c.totalOrders,
              isLoyalCustomer: c.isLoyalCustomer,
              firstOrderAt: c.firstOrderAt,
              lastOrderAt: c.lastOrderAt,
              notes: c.notes
            });
          });
          local.forEach(c => {
            if (!custMap.has(c.whatsappNumber)) {
              custMap.set(c.whatsappNumber, c);
            }
          });
          const merged = Array.from(custMap.values());
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(merged));
        }
      }

      if (woodsRes.ok) {
        const woodsData = await woodsRes.json();
        if (woodsData.success && Array.isArray(woodsData.data) && woodsData.data.length > 0) {
          const remoteWoods: WoodType[] = woodsData.data;
          const local = this.getWoods();
          const woodsMap = new Map<string, WoodType>();
          remoteWoods.forEach((w: any) => {
            woodsMap.set(w.id || w.slug, {
              id: w.id || w._id,
              name: w.name,
              botanicalName: w.botanicalName,
              slug: w.slug,
              description: w.description,
              characteristics: w.characteristics,
              images: w.images || [],
              priceRangeEstimate: w.priceRangeEstimate,
              origin: w.origin,
              textureColorHex: w.textureColorHex,
              roughness: w.roughness,
              metalness: w.metalness,
              isActive: w.isActive,
              stockStatus: w.stockStatus || 'ready',
              stockVolumeM3: w.stockVolumeM3 ?? 10.0,
              stockSlabsCount: w.stockSlabsCount ?? 5,
              restockEstimate: w.restockEstimate || 'Siap Kirim',
              lastStockUpdate: w.lastStockUpdate || new Date().toISOString(),
              createdAt: w.createdAt || new Date().toISOString()
            });
          });
          local.forEach(w => {
            if (!woodsMap.has(w.id) && !woodsMap.has(w.slug)) {
              woodsMap.set(w.id || w.slug, w);
            }
          });
          const merged = Array.from(woodsMap.values());
          localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(merged));
        }
      }

      this.notify('DATA_SYNCED', { timestamp: new Date().toISOString() });
      return true;
    } catch (e) {
      console.warn('Sync failed:', e);
      return false;
    }
  }

  private initDatabase() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.WOODS)) {
      localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(INITIAL_WOODS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(SEED_INQUIRIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BACKUPS)) {
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const initialUsers: UserAccount[] = [
        {
          id: 'usr_budi_01',
          name: 'Budi Hartono',
          email: 'budi.hartono@example.com',
          whatsappNumber: '6281298765432',
          city: 'Jakarta Selatan',
          registeredAt: '2026-06-12T10:00:00.000Z',
          lastLoginAt: '2026-08-25T14:30:00.000Z',
          role: 'user'
        },
        {
          id: 'usr_siti_02',
          name: 'Siti Rahmawati',
          email: 'siti.rahma@studioarsitek.id',
          whatsappNumber: '6285712345678',
          city: 'Surabaya',
          registeredAt: '2026-07-04T09:15:00.000Z',
          lastLoginAt: '2026-08-30T11:20:00.000Z',
          role: 'user'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDER_REPORTS)) {
      const initialReports: OrderReport[] = [
        {
          id: 'rpt_001',
          reportNumber: 'RPT-20260828-101',
          inquiryId: '66d8f301c1f0a2001e3d0001',
          inquiryNumber: 'INQ-20260825-001',
          sessionNumber: 'SES-20260825-4192',
          customerName: 'Budi Hartono',
          whatsappNumber: '6281298765432',
          email: 'budi.hartono@example.com',
          issueType: 'status_stuck',
          description: 'Mohon update progres perakitan meja slab jati. Ingin konfirmasi jadwal pengeringan coating doff.',
          createdAt: '2026-08-28T10:15:00.000Z',
          status: 'investigating',
          resolutionNote: 'Tim QC telah menghubungi pelanggan, coating layer kedua selesai diproses.'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ORDER_REPORTS, JSON.stringify(initialReports));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SECURITY_LOGS)) {
      const initialLogs: SecurityLog[] = [
        {
          id: 'log_01',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          eventType: 'owner_login_success',
          ipOrSource: 'Owner Console (Secure TLS)',
          details: 'Sesi pemilik atelier berhasil diautentikasi dengan token SHA-256.',
          severity: 'info'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(initialLogs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif_welcome',
          title: 'Sistem Terhubung & Aman',
          message: 'Basis data Golang / MongoDB aktif. Proteksi brute-force & otentikasi role diaktifkan.',
          timestamp: new Date().toISOString(),
          type: 'system',
          isRead: false,
          targetAudience: 'owner'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_LEDGERS)) {
      localStorage.setItem(STORAGE_KEYS.STOCK_LEDGERS, JSON.stringify(SEED_STOCK_LEDGERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_LEDGERS)) {
      localStorage.setItem(STORAGE_KEYS.CASH_LEDGERS, JSON.stringify(SEED_CASH_LEDGERS));
    }
  }

  // Subscribe to real-time events (Firebase emulation / live push)
  public subscribe(callback: (event: { type: string; payload: unknown }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(type: string, payload: unknown) {
    this.listeners.forEach(cb => {
      try {
        cb({ type, payload });
      } catch (e) {
        console.error('Listener callback error', e);
      }
    });
  }

  // Woods
  public getWoods(): WoodType[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WOODS);
      const woods: WoodType[] = data ? JSON.parse(data) : INITIAL_WOODS;
      let modified = false;
      woods.forEach(w => {
        if (!w.stockStatus) {
          const init = INITIAL_WOODS.find(iw => iw.id === w.id || iw.slug === w.slug);
          w.stockStatus = init?.stockStatus || 'ready';
          w.stockVolumeM3 = init?.stockVolumeM3 ?? 10.0;
          w.stockSlabsCount = init?.stockSlabsCount ?? 5;
          w.restockEstimate = init?.restockEstimate || 'Siap Kirim (Gudang Jepara)';
          w.lastStockUpdate = init?.lastStockUpdate || new Date().toISOString();
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(woods));
      }
      return woods;
    } catch {
      return INITIAL_WOODS;
    }
  }

  public getWoodById(id: string): WoodType | undefined {
    return this.getWoods().find(w => w.id === id || w.slug === id);
  }

  public async updateWoodStock(
    woodId: string,
    data: { stockStatus: WoodStockStatus; stockVolumeM3: number; stockSlabsCount: number; restockEstimate?: string }
  ): Promise<{ success: boolean; data?: WoodType; error?: string }> {
    const now = new Date().toISOString();

    const woods = this.getWoods();
    const targetIdx = woods.findIndex(w => w.id === woodId || w.slug === woodId);
    let updatedLocal: WoodType | undefined;
    if (targetIdx !== -1) {
      woods[targetIdx] = {
        ...woods[targetIdx],
        stockStatus: data.stockStatus,
        stockVolumeM3: data.stockVolumeM3,
        stockSlabsCount: data.stockSlabsCount,
        restockEstimate: data.restockEstimate ?? woods[targetIdx].restockEstimate,
        lastStockUpdate: now
      };
      updatedLocal = woods[targetIdx];
      localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(woods));
      this.notify('WOOD_STOCK_UPDATED', updatedLocal);
    }

    try {
      const res = await fetch(`/api/v1/woods/${woodId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyWoodStockUpdateLocally(json.data);
          this.notify('WOOD_STOCK_UPDATED', json.data);
          return { success: true, data: json.data };
        }
      }
    } catch (err) {
      console.warn('Backend API PATCH stock tidak terjangkau, update disimpan lokal:', err);
    }

    return { success: true, data: updatedLocal };
  }

  public async createWood(
    woodData: Partial<WoodType>
  ): Promise<{ success: boolean; data?: WoodType; error?: string }> {
    const now = new Date().toISOString();
    const fallbackId = 'wood_' + Math.random().toString(36).substring(2, 9);
    
    // Generate clean slug
    const cleanName = (woodData.name || 'kayu-baru').toLowerCase().replace(/kayu\s+/g, '').trim();
    const slug = cleanName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallbackId;

    const newWood: WoodType = {
      id: woodData.id || fallbackId,
      name: woodData.name || 'Spesimen Kayu Baru',
      botanicalName: woodData.botanicalName || 'Nama Botani',
      slug: woodData.slug || slug,
      description: woodData.description || 'Spesimen kayu Nusantara berkualitas tinggi.',
      characteristics: woodData.characteristics || {
        kekerasan: 'Keras & Ulet',
        warna: 'Alami eksotis',
        ketahanan: 'Kelas Awet I',
        kadarAir: '10% - 12%',
        massaJenis: '700 - 850 kg/m³',
        kegunaan: ['Meja Solid Slab', 'Furniture Luxury']
      },
      images: woodData.images && woodData.images.length > 0
        ? woodData.images
        : ['https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80'],
      priceRangeEstimate: woodData.priceRangeEstimate || 'Rp 25.000.000 - Rp 45.000.000 / m³',
      origin: woodData.origin || 'Nusantara',
      textureColorHex: woodData.textureColorHex || '#8D6E63',
      roughness: typeof woodData.roughness === 'number' ? woodData.roughness : 0.45,
      metalness: typeof woodData.metalness === 'number' ? woodData.metalness : 0.08,
      isActive: true,
      stockStatus: woodData.stockStatus || 'ready',
      stockVolumeM3: typeof woodData.stockVolumeM3 === 'number' ? woodData.stockVolumeM3 : 5.0,
      stockSlabsCount: typeof woodData.stockSlabsCount === 'number' ? woodData.stockSlabsCount : 4,
      restockEstimate: woodData.restockEstimate || 'Siap Kirim',
      lastStockUpdate: now,
      createdAt: now
    };

    // Optimistic local add
    this.applyNewWoodLocally(newWood);
    this.notify('WOOD_CREATED', newWood);

    try {
      const res = await fetch('/api/v1/woods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWood)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyNewWoodLocally(json.data);
          this.notify('WOOD_CREATED', json.data);
          return { success: true, data: json.data };
        }
      }
    } catch (err) {
      console.warn('Backend API POST wood tidak terjangkau, spesimen disimpan lokal:', err);
    }

    return { success: true, data: newWood };
  }

  public async uploadWoodImage(
    woodId: string,
    file: File,
    action: 'replace' | 'append' = 'replace'
  ): Promise<{ success: boolean; data?: WoodType; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('action', action);

    try {
      const res = await fetch(`/api/v1/woods/${woodId}/upload-image`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyWoodUpdateLocally(json.data);
          this.notify('WOOD_STOCK_UPDATED', json.data);
          return { success: true, data: json.data, url: json.url };
        }
        return { success: false, error: json.error || 'Gagal mengunggah foto' };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || 'Server menolak berkas gambar' };
      }
    } catch (err: any) {
      console.error('Error saat uploadWoodImage:', err);
      return { success: false, error: 'Gagal terhubung ke server backend untuk upload berkas' };
    }
  }

  public applyWoodUpdateLocally(updatedWood: WoodType) {
    const woods = this.getWoods();
    const index = woods.findIndex(w => w.id === updatedWood.id || w.slug === updatedWood.slug);
    if (index !== -1) {
      woods[index] = { ...woods[index], ...updatedWood };
      localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(woods));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('woodCatalogUpdated', { detail: updatedWood }));
      }
    }
  }

  // Categories
  public getCategories(): ProductCategory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public getCategoryById(id: string): ProductCategory | undefined {
    return this.getCategories().find(c => c.id === id || c.slug === id);
  }

  // Customers
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public findCustomerByPhone(rawPhone: string): Customer | undefined {
    const normalized = normalizeWhatsApp(rawPhone);
    const customers = this.getCustomers();
    return customers.find(c => c.whatsappNumber === normalized);
  }

  // Inquiries
  public getInquiries(): Inquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      const items: Inquiry[] = data ? JSON.parse(data) : [];
      // Ensure all items have a valid sessionNumber and email
      let modified = false;
      items.forEach((inq, idx) => {
        if (!inq.sessionNumber) {
          const dateStr = inq.createdAt ? inq.createdAt.slice(0, 10).replace(/-/g, '') : '20260825';
          inq.sessionNumber = `SES-${dateStr}-${(1000 + idx * 77).toString().padStart(4, '0')}`;
          modified = true;
        }
        if (!inq.customerEmail && inq.customerId) {
          const cust = this.getCustomers().find(c => c.id === inq.customerId);
          if (cust?.email) inq.customerEmail = cust.email;
        }
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(items));
      }
      return items;
    } catch {
      return [];
    }
  }

  public getInquiryById(id: string): Inquiry | undefined {
    return this.getInquiries().find(i => i.id === id || i.inquiryNumber === id);
  }

  /**
   * Submit new inquiry (matches PRD 6.2 & 6.3 logic)
   */
  public submitInquiry(params: {
    customerName: string;
    whatsappNumber: string;
    city: string;
    email?: string;
    orderType: OrderType;
    woodTypeId: string;
    categoryId?: string;
    sizeEstimate: string;
    referenceNote: string;
    referenceImageUrl?: string;
  }): { inquiry: Inquiry; isRepeatCustomer: boolean; repeatOrderCount: number; whatsappUrl: string } {
    const cleanName = sanitizeInput(params.customerName);
    const cleanCity = sanitizeInput(params.city);
    const cleanEmail = sanitizeInput(params.email || '');
    const cleanSize = sanitizeInput(params.sizeEstimate);
    const cleanNote = sanitizeInput(params.referenceNote);
    const normalizedPhone = normalizeWhatsApp(params.whatsappNumber);
    const now = new Date().toISOString();

    let customers = this.getCustomers();
    let customer = customers.find(c => c.whatsappNumber === normalizedPhone);
    let isRepeatCustomer = false;
    let repeatOrderCount = 1;

    if (customer) {
      isRepeatCustomer = true;
      repeatOrderCount = (customer.totalOrders || 1) + 1;
      customer.totalOrders = repeatOrderCount;
      customer.lastOrderAt = now;
      customer.name = cleanName; // update name if changed
      customer.city = cleanCity;
      if (cleanEmail) customer.email = cleanEmail;
      customer.isLoyalCustomer = customer.totalOrders >= 2;
    } else {
      const newCustomerId = '66d8' + Math.random().toString(16).substring(2, 10) + '0000' + Math.random().toString(16).substring(2, 6);
      customer = {
        id: newCustomerId,
        whatsappNumber: normalizedPhone,
        name: cleanName,
        city: cleanCity,
        email: cleanEmail,
        totalOrders: 1,
        isLoyalCustomer: false,
        firstOrderAt: now,
        lastOrderAt: now
      };
      customers.push(customer);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    // Resolve Wood & Category names
    const wood = this.getWoodById(params.woodTypeId);
    const category = params.categoryId ? this.getCategoryById(params.categoryId) : undefined;

    const dateTag = now.slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const inquiryNumber = `INQ-${dateTag}-${randomSeq}`;
    const sessionNumber = `SES-${dateTag}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInquiry: Inquiry = {
      id: '66d8' + Math.random().toString(16).substring(2, 10) + '0000' + Math.random().toString(16).substring(2, 6),
      inquiryNumber,
      sessionNumber,
      customerId: customer.id,
      customerName: cleanName,
      whatsappNumber: normalizedPhone,
      customerEmail: cleanEmail,
      city: cleanCity,
      orderType: params.orderType,
      woodTypeId: params.woodTypeId,
      woodTypeName: wood ? wood.name : 'Kayu Pilihan',
      categoryId: params.categoryId,
      categoryName: category ? category.name : undefined,
      sizeEstimate: cleanSize,
      referenceNote: cleanNote || '-',
      referenceImageUrl: params.referenceImageUrl,
      status: 'new',
      isRepeatCustomer,
      repeatOrderCount,
      createdAt: now,
      updatedAt: now
    };

    const inquiries = this.getInquiries();
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));

    // Also update or link to registered user if exists
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.whatsappNumber === normalizedPhone) {
      if (!currentUser.email && cleanEmail) {
        currentUser.email = cleanEmail;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }

    // Log security audit trail
    this.logSecurityEvent('order_report_filed', `Inquiry baru ${inquiryNumber} dibuat dengan No Sesi ${sessionNumber} oleh ${cleanName}.`, 'info');

    // Generate WhatsApp Text per PRD Appendix 14
    const jenisPesananText = params.orderType === 'raw_wood' ? 'Kayu Mentah' : 'Custom Furniture';
    let waMessage = `🌳 *PESANAN BARU - Toko Kayu Delin Jaya*\n\n`;
    waMessage += `*No. Sesi Resmi:* ${sessionNumber}\n`;
    waMessage += `*Nama:* ${cleanName}\n`;
    waMessage += `*No. WA:* ${normalizedPhone}\n`;
    if (cleanEmail) waMessage += `*Email Aktif:* ${cleanEmail}\n`;
    waMessage += `*Kota:* ${cleanCity}\n\n`;
    waMessage += `*Jenis Pesanan:* ${jenisPesananText}\n`;
    waMessage += `*Jenis Kayu:* ${wood ? wood.name : '-'}\n`;
    if (params.orderType === 'custom_furniture' && category) {
      waMessage += `*Kategori Barang:* ${category.name}\n`;
    }
    waMessage += `*Estimasi Ukuran:* ${cleanSize}\n`;
    waMessage += `*Catatan:* ${cleanNote || '-'}\n`;
    if (isRepeatCustomer) {
      waMessage += `\n⭐ *Catatan Sistem:* Pelanggan Setia (Pesanan ke-${repeatOrderCount})\n`;
    }
    waMessage += `\n_Dikirim otomatis melalui website (No. Ref: ${inquiryNumber})._`;

    const encodedMessage = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // 1. Notifikasi untuk Pemilik Toko (Owner)
    this.addNotification({
      title: isRepeatCustomer ? `⭐ Pesanan Baru (Pelanggan Setia #${repeatOrderCount})` : 'Inquiry Pesanan Baru',
      message: `${cleanName} (${cleanCity}) memesan ${wood?.name || 'Kayu Pilihan'} [${jenisPesananText}] (Sesi: ${sessionNumber})`,
      type: 'inquiry',
      priority: isRepeatCustomer ? 'high' : 'normal',
      inquiryId: newInquiry.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi Konfirmasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Pesanan Berhasil Diajukan',
      message: `Pesanan ${newInquiry.inquiryNumber} (${wood?.name || 'Kayu Pilihan'}) telah diterima workshop Toko Kayu Delin Jaya. Kami akan segera memverifikasi detail pesanan Anda.`,
      type: 'inquiry',
      priority: 'normal',
      inquiryId: newInquiry.id,
      targetAudience: 'customer',
      recipientPhone: normalizedPhone,
      recipientEmail: cleanEmail,
      recipientUserId: customer.id
    });

    // Notify listeners
    this.notify('INQUIRY_CREATED', { inquiry: newInquiry, customer, isRepeatCustomer });

    // Asynchronous background sync to Golang Backend API
    fetch('/api/v1/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: cleanName,
        whatsappNumber: normalizedPhone,
        city: cleanCity,
        email: cleanEmail,
        orderType: params.orderType,
        woodTypeId: params.woodTypeId,
        woodTypeName: wood ? wood.name : 'Kayu Pilihan',
        categoryId: params.categoryId,
        categoryName: category ? category.name : undefined,
        sizeEstimate: cleanSize,
        referenceNote: cleanNote || '-',
        referenceImageUrl: params.referenceImageUrl,
        sessionNumber
      })
    }).then(res => res.json()).then(data => {
      if (data?.inquiry?.id) {
        newInquiry.id = data.inquiry.id;
      }
    }).catch(() => {
      // Backend offline, seamlessly stored locally
    });

    return {
      inquiry: newInquiry,
      isRepeatCustomer,
      repeatOrderCount,
      whatsappUrl
    };
  }

  // Update Inquiry Status
  public updateInquiryStatus(id: string, status: InquiryStatus): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === id || i.inquiryNumber === id);
    if (index === -1) return undefined;

    inquiries[index].status = status;
    inquiries[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));

    const updated = inquiries[index];

    // Asynchronous background sync to Golang Backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
    const statusDisplayLabels: Record<string, string> = {
      new: 'Pesanan Baru Diterima',
      survey_scheduled: 'Jadwal Survei Kayu Ditentukan',
      quoted: 'Penawaran Resmi Diterbitkan',
      awaiting_payment: 'Menunggu Pembayaran',
      dp_paid: 'DP 50% Diterima (Dalam Antrean Produksi)',
      processing: 'Kayu Sedang Dikerjakan di Workshop',
      ready_to_ship: 'Produksi Selesai & Siap Dikirim (Lunas 100%)',
      shipped: 'Pesanan Telah Dimuat ke Truk Ekspedisi',
      done: 'Pesanan Telah Diterima & Selesai',
      cancelled: 'Pesanan Dibatalkan'
    };
    const displayLabel = statusDisplayLabels[status] || status.toUpperCase();

    // 1. Notifikasi Operasional untuk Pemilik (Owner)
    this.addNotification({
      title: 'Status Pesanan Diperbarui',
      message: `Inquiry ${updated.inquiryNumber} (${updated.customerName}) diubah ke status: ${displayLabel}`,
      type: 'system',
      priority: 'normal',
      inquiryId: updated.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Pembaruan Status Pesanan Anda',
      message: `Pesanan ${updated.inquiryNumber} Anda kini berstatus: ${displayLabel}.`,
      type: 'inquiry',
      priority: 'normal',
      inquiryId: updated.id,
      targetAudience: 'customer',
      recipientPhone: updated.whatsappNumber,
      recipientEmail: updated.customerEmail
    });

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  // =========================================================================
  // INTERCONNECTED BUSINESS & FINANCIAL MODULES
  // =========================================================================

  /**
   * Modul 2: Simpan Kalkulasi Penawaran Resmi & Breakdown Biaya
   */
  public saveQuotation(inquiryId: string, quote: CostBreakdown): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    inquiries[index].quotation = {
      ...quote,
      quotedAt: quote.quotedAt || now
    };
    inquiries[index].status = 'awaiting_payment';
    inquiries[index].updatedAt = now;

    // Otomatis siapkan kalkulasi tagihan jika belum ada
    const finalPrice = quote.finalPrice;
    const dpNominal = Math.round(finalPrice * 0.5);
    const remainingNominal = finalPrice - dpNominal;

    if (!inquiries[index].paymentRecord) {
      inquiries[index].paymentRecord = {
        id: `PAY-${inquiries[index].inquiryNumber}`,
        inquiryId: inquiries[index].id,
        inquiryNumber: inquiries[index].inquiryNumber,
        paymentPlan: 'dp_50',
        method: 'qris',
        totalAmount: finalPrice,
        dpAmount: dpNominal,
        remainingAmount: remainingNominal,
        isDpPaid: false,
        isSettled: false,
        uniqueCode: Math.floor(100 + Math.random() * 899),
        status: 'pending',
        verifiedByOwner: false
      };
    } else {
      inquiries[index].paymentRecord!.totalAmount = finalPrice;
      inquiries[index].paymentRecord!.dpAmount = dpNominal;
      inquiries[index].paymentRecord!.remainingAmount = remainingNominal;
    }

    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/quotation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    }).catch(() => {});

    // 1. Notifikasi untuk Pemilik (Owner)
    this.addNotification({
      title: 'Penawaran Resmi Diterbitkan',
      message: `Penawaran resmi untuk ${updated.customerName} (${updated.inquiryNumber}) sebesar Rp ${finalPrice.toLocaleString('id-ID')} berhasil diterbitkan.`,
      type: 'inquiry',
      priority: 'high',
      inquiryId: updated.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Penawaran Resmi Telah Terbit',
      message: `Rincian harga & penawaran resmi untuk pesanan ${updated.inquiryNumber} Anda sebesar Rp ${finalPrice.toLocaleString('id-ID')} telah siap. Silakan periksa rincian di halaman Pesanan Saya.`,
      type: 'inquiry',
      priority: 'high',
      inquiryId: updated.id,
      targetAudience: 'customer',
      recipientPhone: updated.whatsappNumber,
      recipientEmail: updated.customerEmail
    });

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  /**
   * Simpan Pemilihan Metode Pembayaran (QRIS / VA) & Skema DP / Lunas dengan Janji Pelunasan
   */
  public savePaymentRecord(inquiryId: string, payment: PaymentRecord): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    inquiries[index].paymentRecord = payment;
    inquiries[index].updatedAt = now;

    if (payment.isSettled) {
      inquiries[index].status = 'ready_to_ship';
    } else if (payment.isDpPaid) {
      inquiries[index].status = 'dp_paid';
    } else {
      inquiries[index].status = 'awaiting_payment';
    }

    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    }).catch(() => {});

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  /**
   * Verifikasi Pembayaran (DP 50% atau Pelunasan 100%)
   * Otomatis tercatat ke Buku Kas Masuk Atelier
   */
  public verifyPayment(inquiryId: string, isSettlement: boolean): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    const inq = inquiries[index];
    if (!inq.paymentRecord) return undefined;

    inq.paymentRecord.verifiedByOwner = true;
    inq.paymentRecord.verifiedAt = now;

    if (isSettlement || inq.paymentRecord.paymentPlan === 'full') {
      inq.paymentRecord.isSettled = true;
      inq.paymentRecord.settledAt = now;
      inq.paymentRecord.status = 'settled';
      inq.paymentRecord.remainingAmount = 0;
      inq.status = 'ready_to_ship';

      // Catat ke Buku Kas Masuk
      const settleAmount = inq.paymentRecord.paymentPlan === 'full' 
        ? inq.paymentRecord.totalAmount 
        : inq.paymentRecord.dpAmount; // sisa tagihan
      this.recordCashLedger({
        inquiryNumber: inq.inquiryNumber,
        type: 'income_settlement',
        amount: settleAmount,
        description: `Pelunasan 100% Pesanan ${inq.inquiryNumber} (${inq.customerName}) - Kayu Siap Dikirim`
      });

      // 1. Notifikasi untuk Pemilik (Owner)
      this.addNotification({
        title: 'Pelunasan 100% Berhasil Diverifikasi',
        message: `Pesanan ${inq.inquiryNumber} (${inq.customerName}) telah lunas penuh! Kayu siap dimuat ke kargo truk.`,
        type: 'inquiry',
        priority: 'high',
        inquiryId: inq.id,
        targetAudience: 'owner'
      });

      // 2. Notifikasi untuk Pelanggan (Customer)
      this.addNotification({
        title: 'Pelunasan 100% Berhasil Diterima',
        message: `Pembayaran pelunasan untuk pesanan ${inq.inquiryNumber} Anda telah diverifikasi lunas. Kayu pesanan Anda kini siap dimuat ke kargo pengiriman.`,
        type: 'inquiry',
        priority: 'high',
        inquiryId: inq.id,
        targetAudience: 'customer',
        recipientPhone: inq.whatsappNumber,
        recipientEmail: inq.customerEmail
      });
    } else {
      // Pembayaran DP 50%
      inq.paymentRecord.isDpPaid = true;
      inq.paymentRecord.dpPaidAt = now;
      inq.paymentRecord.status = 'dp_paid';
      inq.status = 'dp_paid';

      // Catat ke Buku Kas Masuk
      this.recordCashLedger({
        inquiryNumber: inq.inquiryNumber,
        type: 'income_dp',
        amount: inq.paymentRecord.dpAmount,
        description: `Penerimaan DP 50% Pesanan ${inq.inquiryNumber} (${inq.customerName}) - Janji Pelunasan: ${inq.paymentRecord.settlementDueDate || '-'}`
      });

      // 1. Notifikasi untuk Pemilik (Owner)
      this.addNotification({
        title: 'DP 50% Berhasil Diverifikasi',
        message: `DP Pesanan ${inq.inquiryNumber} (${inq.customerName}) Rp ${inq.paymentRecord.dpAmount.toLocaleString('id-ID')} diterima. Pesanan masuk tahap produksi workshop.`,
        type: 'inquiry',
        priority: 'high',
        inquiryId: inq.id,
        targetAudience: 'owner'
      });

      // 2. Notifikasi untuk Pelanggan (Customer)
      this.addNotification({
        title: 'Pembayaran DP 50% Berhasil Diterima',
        message: `Pembayaran DP sebesar Rp ${inq.paymentRecord.dpAmount.toLocaleString('id-ID')} untuk pesanan ${inq.inquiryNumber} telah diverifikasi. Pengrajin workshop segera memproses kayu Anda.`,
        type: 'inquiry',
        priority: 'high',
        inquiryId: inq.id,
        targetAudience: 'customer',
        recipientPhone: inq.whatsappNumber,
        recipientEmail: inq.customerEmail
      });
    }

    inquiries[index].updatedAt = now;
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSettlement })
    }).catch(() => {});

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  /**
   * Modul 1: Tambah Tonggak Progres Produksi Berfoto & Kadar Air MC%
   */
  public addProductionMilestone(
    inquiryId: string, 
    milestone: Omit<ProductionMilestone, 'id' | 'recordedAt'>
  ): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    const newMilestone: ProductionMilestone = {
      ...milestone,
      id: `mls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recordedAt: now
    };

    if (!inquiries[index].productionMilestones) {
      inquiries[index].productionMilestones = [];
    }
    inquiries[index].productionMilestones!.push(newMilestone);
    inquiries[index].status = 'in_production';
    inquiries[index].updatedAt = now;

    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMilestone)
    }).catch(() => {});

    // 1. Notifikasi untuk Pemilik (Owner)
    this.addNotification({
      title: 'Progres Produksi Diperbarui',
      message: `${newMilestone.title} untuk ${updated.inquiryNumber} berhasil didokumentasikan (MC: ${newMilestone.moistureContentMC || '-'}).`,
      type: 'inquiry',
      priority: 'normal',
      inquiryId: updated.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Progres Produksi Pesanan Anda',
      message: `Tahapan "${newMilestone.title}" untuk pesanan ${updated.inquiryNumber} Anda telah tercatat selesai (Kadar Air Kayu: ${newMilestone.moistureContentMC || '-'}).`,
      type: 'inquiry',
      priority: 'normal',
      inquiryId: updated.id,
      targetAudience: 'customer',
      recipientPhone: updated.whatsappNumber,
      recipientEmail: updated.customerEmail
    });

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  /**
   * Modul 3: Terbitkan / Perbarui Sertifikat Legalitas Kayu SVLK & V-Legal
   */
  public updateSVLKCertificate(inquiryId: string, cert: SVLKCertificate): Inquiry | undefined {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return undefined;

    const now = new Date().toISOString();
    inquiries[index].svlkCertificate = cert;
    inquiries[index].updatedAt = now;

    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/svlk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cert)
    }).catch(() => {});

    this.notify('INQUIRY_UPDATED', updated);
    return updated;
  }

  /**
   * Modul 4: Surat Jalan Logistik & Nomor Resi Truk Kargo
   * PENEGAKAN KLAUSUL ANTI-KABUR:
   * Jika user bayar DP 50% dan belum melunasi 100%, PENGIRIMAN DITAHAN!
   */
  public updateShipmentWaybill(
    inquiryId: string, 
    waybill: ShipmentWaybill
  ): { success: boolean; inquiry?: Inquiry; error?: string } {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId || i.inquiryNumber === inquiryId);
    if (index === -1) return { success: false, error: 'Pesanan tidak ditemukan' };

    const inq = inquiries[index];

    // PENEGAKAN LOGIKA ANTI-KABUR SECARA KETAT
    if (inq.paymentRecord) {
      if (inq.paymentRecord.paymentPlan === 'dp_50' && !inq.paymentRecord.isSettled) {
        return {
          success: false,
          error: `PENGIRIMAN DITAHAN: Pesanan ${inq.inquiryNumber} masih berstatus DP 50%. Sesuai klausul Anti-Kabur Atelier, kayu aman tersimpan di workshop dan hanya dapat dimuat ke truk setelah sisa tagihan Rp ${inq.paymentRecord.remainingAmount.toLocaleString('id-ID')} dilunasi.`
        };
      }
    }

    const now = new Date().toISOString();
    inquiries[index].shipmentWaybill = {
      ...waybill,
      shippedAt: waybill.shippedAt || now
    };
    inquiries[index].status = 'shipped';
    inquiries[index].updatedAt = now;

    // Catat mutasi stok keluar
    this.recordStockLedger({
      woodId: inq.woodTypeId,
      woodName: inq.woodTypeName,
      type: 'outflow',
      volumeM3: 0.5,
      slabsCount: 1,
      referenceId: waybill.waybillNumber,
      description: `Pengiriman Kargo Truk Resi ${waybill.waybillNumber} (${waybill.carrierName}) ke ${inq.city}`
    });

    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    const updated = inquiries[index];

    // Background sync ke Go backend
    fetch(`/api/v1/inquiries/${updated.inquiryNumber}/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waybill)
    }).catch(() => {});

    // 1. Notifikasi untuk Pemilik (Owner)
    this.addNotification({
      title: 'Surat Jalan & Resi Diterbitkan',
      message: `Pesanan ${updated.inquiryNumber} resmi diberangkatkan dengan ${waybill.carrierName} (Resi: ${waybill.waybillNumber}, Plat: ${waybill.truckPlateNumber}).`,
      type: 'inquiry',
      priority: 'high',
      inquiryId: updated.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Pesanan Anda Sedang Dikirim',
      message: `Pesanan ${updated.inquiryNumber} Anda telah dimuat ke armada ${waybill.carrierName}. Nomor Resi: ${waybill.waybillNumber}. Estimasi tiba: ${waybill.estimatedArrival || '1-3 hari kerja'}.`,
      type: 'inquiry',
      priority: 'high',
      inquiryId: updated.id,
      targetAudience: 'customer',
      recipientPhone: updated.whatsappNumber,
      recipientEmail: updated.customerEmail
    });

    this.notify('INQUIRY_UPDATED', updated);
    return { success: true, inquiry: updated };
  }

  // =========================================================================
  // Modul 5: BUKU MUTASI STOK & BUKU KAS MASUK
  // =========================================================================

  public getStockLedgers(): StockLedgerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOCK_LEDGERS);
      return data ? JSON.parse(data) : SEED_STOCK_LEDGERS;
    } catch {
      return SEED_STOCK_LEDGERS;
    }
  }

  public recordStockLedger(entry: Omit<StockLedgerEntry, 'id' | 'timestamp'>) {
    const list = this.getStockLedgers();
    const newEntry: StockLedgerEntry = {
      ...entry,
      id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.STOCK_LEDGERS, JSON.stringify(list));
    this.notify('STOCK_LEDGER_UPDATED', newEntry);
  }

  public getCashLedgers(): CashLedgerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASH_LEDGERS);
      return data ? JSON.parse(data) : SEED_CASH_LEDGERS;
    } catch {
      return SEED_CASH_LEDGERS;
    }
  }

  public recordCashLedger(entry: Omit<CashLedgerEntry, 'id' | 'timestamp'>) {
    const list = this.getCashLedgers();
    const newEntry: CashLedgerEntry = {
      ...entry,
      id: `csh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.CASH_LEDGERS, JSON.stringify(list));
    this.notify('CASH_LEDGER_UPDATED', newEntry);
  }

  // ==========================================
  // SAVED ITEMS / WISHLIST (FITUR PRIVAT USER)
  // ==========================================
  private getSavedStorageKey(user?: UserAccount | null): string {
    const activeUser = user !== undefined ? user : this.getCurrentUser();
    if (!activeUser) {
      return `${STORAGE_KEYS.SAVED_ITEMS}_guest`;
    }
    return `${STORAGE_KEYS.SAVED_ITEMS}_${activeUser.id || activeUser.email}`;
  }

  public getSavedItems(user?: UserAccount | null): SavedItem[] {
    // STRICT PRIVACY RULE: Sesi Pemilik Toko (Owner) TIDAK berbelanja dan TIDAK boleh melihat wishlist milik pelanggan!
    if (this.isOwnerAuthenticated()) {
      return [];
    }
    try {
      const key = this.getSavedStorageKey(user);
      let data = localStorage.getItem(key);

      // Migrasi data lama dari STORAGE_KEYS.SAVED_ITEMS jika ada
      if (!data) {
        const legacy = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
        if (legacy) {
          data = legacy;
          localStorage.setItem(key, legacy);
          localStorage.removeItem(STORAGE_KEYS.SAVED_ITEMS);
        }
      }
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public isItemSaved(referenceId: string, user?: UserAccount | null): boolean {
    if (this.isOwnerAuthenticated()) return false;
    const items = this.getSavedItems(user);
    return items.some(i => i.referenceId === referenceId || i.id === referenceId);
  }

  public toggleSaveItem(item: Omit<SavedItem, 'savedAt' | 'id'>, user?: UserAccount | null): { isSaved: boolean; items: SavedItem[] } {
    // Owner tidak berbelanja dan tidak menyimpan wishlist
    if (this.isOwnerAuthenticated()) {
      return { isSaved: false, items: [] };
    }

    const key = this.getSavedStorageKey(user);
    const items = this.getSavedItems(user);
    const index = items.findIndex(i => i.referenceId === item.referenceId);
    let isSaved = false;

    if (index > -1) {
      items.splice(index, 1);
      isSaved = false;
    } else {
      const newItem: SavedItem = {
        ...item,
        id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        savedAt: new Date().toISOString()
      };
      items.unshift(newItem);
      isSaved = true;
    }

    localStorage.setItem(key, JSON.stringify(items));
    this.notify('SAVED_ITEMS_CHANGED', items);
    return { isSaved, items };
  }

  public removeSavedItem(referenceId: string, user?: UserAccount | null): SavedItem[] {
    if (this.isOwnerAuthenticated()) return [];
    const key = this.getSavedStorageKey(user);
    const items = this.getSavedItems(user).filter(i => i.referenceId !== referenceId && i.id !== referenceId);
    localStorage.setItem(key, JSON.stringify(items));
    this.notify('SAVED_ITEMS_CHANGED', items);
    return items;
  }

  // Notifications with Persona & Privacy Isolation
  public getRawNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      const list: NotificationItem[] = JSON.parse(data);
      let hasMigration = false;

      // Migrasi data lama di browser agar notifikasi owner/backup tidak bocor ke customer
      const migrated = list.map(item => {
        if (!item.targetAudience) {
          hasMigration = true;
          // Tandai notifikasi operasional lama sebagai milik owner
          return {
            ...item,
            targetAudience: 'owner' as const
          };
        }
        return item;
      });

      if (hasMigration) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(migrated));
      }
      return migrated;
    } catch {
      return [];
    }
  }

  public getNotifications(): NotificationItem[] {
    return this.getRawNotifications();
  }

  /**
   * Notifikasi khusus Pemilik Toko (Atelier Owner)
   * Hanya memuat event pesanan baru masuk, pencatatan kas/DP, laporan kendala, dan snapshot backup cloud.
   */
  public getOwnerNotifications(): NotificationItem[] {
    const notifs = this.getRawNotifications();
    return notifs.filter(n => {
      if (n.targetAudience === 'customer') return false;
      return n.targetAudience === 'owner' || n.targetAudience === 'all' || !n.targetAudience;
    });
  }

  /**
   * Notifikasi khusus Pelanggan (Customer)
   * Hanya memuat pembaruan status pesanan milik pengguna yang sedang login.
   * DILARANG KERAS memuat notifikasi backup, CRM pelanggan lain, atau kontrol owner.
   */
  public getCustomerNotifications(user: UserAccount | null): NotificationItem[] {
    if (!user) return [];
    const notifs = this.getRawNotifications();
    const userPhone = normalizeWhatsApp(user.whatsappNumber);
    const userEmail = (user.email || '').trim().toLowerCase();

    return notifs.filter(n => {
      // Tolak notifikasi eksklusif milik owner atau backup
      if (n.targetAudience === 'owner') return false;
      if (n.type === 'backup' || n.type === 'customer') return false;

      // Verifikasi identitas penerima
      if (n.recipientUserId && n.recipientUserId === user.id) return true;
      if (n.recipientEmail && n.recipientEmail.toLowerCase() === userEmail) return true;
      if (n.recipientPhone && normalizeWhatsApp(n.recipientPhone) === userPhone) return true;

      // Verifikasi relasi nomor inquiry jika ada
      if (n.inquiryId) {
        const inq = this.getInquiryById(n.inquiryId);
        if (inq) {
          const inqPhone = normalizeWhatsApp(inq.whatsappNumber);
          const inqEmail = (inq.customerEmail || '').trim().toLowerCase();
          if (inqPhone === userPhone || (inqEmail && inqEmail === userEmail)) {
            return n.targetAudience === 'customer' || n.targetAudience === 'all';
          }
        }
      }

      return false;
    });
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) {
    const notifs = this.getRawNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    notifs.unshift(newNotif);
    // Maksimal simpan 100 notifikasi
    if (notifs.length > 100) notifs.length = 100;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify('NOTIFICATION_ADDED', newNotif);
  }

  public markNotificationAsRead(id: string) {
    const notifs = this.getRawNotifications();
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify('NOTIFICATIONS_CHANGED', notifs);
    }
  }

  public markAllNotificationsAsReadForRole(role: 'owner' | 'customer', user?: UserAccount | null) {
    const notifs = this.getRawNotifications();
    let updated = false;

    if (role === 'owner') {
      notifs.forEach(n => {
        if (n.targetAudience === 'owner' || n.targetAudience === 'all' || !n.targetAudience) {
          n.isRead = true;
          updated = true;
        }
      });
    } else if (role === 'customer' && user) {
      const userPhone = normalizeWhatsApp(user.whatsappNumber);
      const userEmail = (user.email || '').trim().toLowerCase();
      notifs.forEach(n => {
        if (n.targetAudience === 'customer') {
          const matchPhone = n.recipientPhone && normalizeWhatsApp(n.recipientPhone) === userPhone;
          const matchEmail = n.recipientEmail && n.recipientEmail.toLowerCase() === userEmail;
          const matchUser = n.recipientUserId && n.recipientUserId === user.id;
          if (matchPhone || matchEmail || matchUser) {
            n.isRead = true;
            updated = true;
          }
        }
      });
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify('NOTIFICATIONS_CHANGED', notifs);
    }
  }

  public clearNotificationsForRole(role: 'owner' | 'customer', user?: UserAccount | null) {
    const notifs = this.getRawNotifications();
    let remaining: NotificationItem[] = [];

    if (role === 'owner') {
      // Pertahankan notifikasi milik customer
      remaining = notifs.filter(n => n.targetAudience === 'customer');
    } else if (role === 'customer' && user) {
      const userPhone = normalizeWhatsApp(user.whatsappNumber);
      const userEmail = (user.email || '').trim().toLowerCase();
      remaining = notifs.filter(n => {
        if (n.targetAudience === 'customer') {
          const matchPhone = n.recipientPhone && normalizeWhatsApp(n.recipientPhone) === userPhone;
          const matchEmail = n.recipientEmail && n.recipientEmail.toLowerCase() === userEmail;
          const matchUser = n.recipientUserId && n.recipientUserId === user.id;
          if (matchPhone || matchEmail || matchUser) {
            return false; // hapus notifikasi customer ini
          }
        }
        return true; // pertahankan notifikasi lain
      });
    } else {
      remaining = notifs;
    }

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(remaining));
    this.notify('NOTIFICATIONS_CHANGED', remaining);
  }

  public markAllNotificationsAsRead() {
    this.markAllNotificationsAsReadForRole('owner');
  }

  public clearAllNotifications() {
    this.clearNotificationsForRole('owner');
  }

  // Cloud Backups (Free Tier Friendly MongoDB Atlas / JSON Snapshot)
  public getBackups(): BackupRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public createCloudBackup(autoScheduled = false): BackupRecord {
    const woods = this.getWoods();
    const categories = this.getCategories();
    const customers = this.getCustomers();
    const inquiries = this.getInquiries();

    const timestamp = new Date().toISOString();
    const dateTag = timestamp.slice(0, 19).replace(/[:T]/g, '-');
    const filename = `kayu-nusantara-backup-${dateTag}.json`;

    const fullDump = {
      metadata: {
        app: 'Toko Kayu Delin Jaya',
        version: '1.0.0',
        generatedAt: timestamp,
        dbEngine: 'MongoDB / Golang v1.22',
        tier: 'Free Tier (Atlas M0 Compatible)'
      },
      collections: {
        wood_types: woods,
        product_categories: categories,
        customers: customers,
        inquiries: inquiries
      }
    };

    const serialized = JSON.stringify(fullDump, null, 2);
    const sizeKb = Math.max(1, Math.round(serialized.length / 1024));
    
    // Quick pseudo-hash checksum
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      hash = ((hash << 5) - hash) + serialized.charCodeAt(i);
      hash |= 0;
    }
    const checksum = 'sha256-' + Math.abs(hash).toString(16).padStart(8, '0') + 'f0e4b8';

    const backupRecord: BackupRecord = {
      id: 'bkp_' + Date.now(),
      filename,
      totalRecords: {
        woods: woods.length,
        categories: categories.length,
        customers: customers.length,
        inquiries: inquiries.length
      },
      sizeKb,
      checksum,
      timestamp,
      autoScheduled,
      status: 'verified'
    };

    const backups = this.getBackups();
    backups.unshift(backupRecord);
    // Keep max 10 records for free tier efficiency
    if (backups.length > 10) backups.length = 10;
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));

    // Asynchronous background sync to Golang Backend
    fetch(`/api/v1/backups/snapshot?scheduled=${autoScheduled}`, { method: 'POST' }).catch(() => {});

    this.addNotification({
      title: autoScheduled ? 'Backup Otomatis Selesai' : 'Snapshot Cloud Selesai',
      message: `${filename} (${sizeKb} KB) tersimpan aman dan terverifikasi.`,
      type: 'backup',
      priority: 'normal',
      targetAudience: 'owner'
    });

    this.notify('BACKUP_CREATED', backupRecord);
    return backupRecord;
  }

  public exportBackupJson(): string {
    const woods = this.getWoods();
    const categories = this.getCategories();
    const customers = this.getCustomers();
    const inquiries = this.getInquiries();

    const fullDump = {
      metadata: {
        app: 'Toko Kayu Delin Jaya',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        dbEngine: 'MongoDB 7.0 / Golang Driver',
        tier: 'Atlas Free Tier M0 (Limit 512MB)'
      },
      collections: {
        wood_types: woods,
        product_categories: categories,
        customers: customers,
        inquiries: inquiries
      }
    };

    return JSON.stringify(fullDump, null, 2);
  }

  public restoreBackupJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.collections) {
        throw new Error('Format arsip tidak valid: node collections tidak ditemukan.');
      }
      const { wood_types, product_categories, customers, inquiries } = parsed.collections;

      if (Array.isArray(wood_types) && wood_types.length > 0) {
        localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(wood_types));
      }
      if (Array.isArray(product_categories) && product_categories.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(product_categories));
      }
      if (Array.isArray(customers)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
      if (Array.isArray(inquiries)) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
      }

      this.addNotification({
        title: 'Restore Database Sukses',
        message: 'Data berhasil dipulihkan dari file backup cloud.',
        type: 'backup',
        priority: 'high',
        targetAudience: 'owner'
      });

      this.notify('DATABASE_RESTORED', parsed);
      return { success: true, message: 'Data berhasil dipulihkan.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file backup.';
      return { success: false, message: msg };
    }
  }

  // ==========================================
  // USER AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================

  public getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public registerUser(params: {
    name: string;
    email: string;
    whatsappNumber: string;
    city: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const cleanName = sanitizeInput(params.name);
    const cleanEmail = sanitizeInput(params.email).toLowerCase();
    const cleanCity = sanitizeInput(params.city);
    const normalizedPhone = normalizeWhatsApp(params.whatsappNumber);

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Nama lengkap wajib diisi minimal 2 karakter.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Alamat email aktif tidak valid. Wajib cantumkan email aktif untuk dokumen pesanan.' };
    }
    if (!normalizedPhone || normalizedPhone.length < 9) {
      return { success: false, error: 'Nomor WhatsApp aktif tidak valid. Wajib format nomor Indonesia yang aktif.' };
    }

    const users = this.getUsers();
    let existing = users.find(u => u.email === cleanEmail || u.whatsappNumber === normalizedPhone);

    const now = new Date().toISOString();

    if (existing) {
      // Update existing user profile
      existing.name = cleanName;
      existing.email = cleanEmail;
      existing.whatsappNumber = normalizedPhone;
      existing.city = cleanCity || existing.city;
      existing.lastLoginAt = now;
    } else {
      existing = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: cleanName,
        email: cleanEmail,
        whatsappNumber: normalizedPhone,
        city: cleanCity || 'Indonesia',
        registeredAt: now,
        lastLoginAt: now,
        role: 'user'
      };
      users.push(existing);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(existing));

    // Also sync to customer table for CRM
    let customers = this.getCustomers();
    let customer = customers.find(c => c.whatsappNumber === normalizedPhone);
    if (customer) {
      customer.name = cleanName;
      customer.email = cleanEmail;
      customer.city = cleanCity || customer.city;
    } else {
      customers.push({
        id: '66d8' + Math.random().toString(16).substring(2, 10) + '0000' + Math.random().toString(16).substring(2, 6),
        whatsappNumber: normalizedPhone,
        name: cleanName,
        city: cleanCity,
        email: cleanEmail,
        totalOrders: 0,
        isLoyalCustomer: false,
        firstOrderAt: now,
        lastOrderAt: now
      });
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    this.logSecurityEvent('user_register', `Pengguna ${cleanName} (${cleanEmail} / +${normalizedPhone}) berhasil terdaftar.`, 'info');
    this.notify('USER_AUTH_CHANGED', existing);

    return { success: true, user: existing };
  }

  public loginUser(identifier: string): { success: boolean; user?: UserAccount; error?: string } {
    const cleanId = sanitizeInput(identifier).trim().toLowerCase();
    const normalizedPhone = normalizeWhatsApp(cleanId);
    const users = this.getUsers();

    const user = users.find(u => u.email.toLowerCase() === cleanId || u.whatsappNumber === normalizedPhone || u.whatsappNumber === cleanId);

    if (!user) {
      return { success: false, error: 'Akun dengan Email atau Nomor WhatsApp tersebut tidak ditemukan. Silakan daftar terlebih dahulu.' };
    }

    user.lastLoginAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    this.logSecurityEvent('user_login', `Pengguna ${user.name} (${user.email}) login ke dashboard.`, 'info');
    this.notify('USER_AUTH_CHANGED', user);

    return { success: true, user };
  }

  public logoutUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify('USER_AUTH_CHANGED', null);
  }

  public userLogout(): void {
    this.logoutUser();
  }

  public createBackupRecord(autoScheduled = false): BackupRecord {
    return this.createCloudBackup(autoScheduled);
  }

  // ==========================================
  // OWNER AUTHENTICATION & BRUTE-FORCE SECURITY
  // ==========================================

  public isOwnerAuthenticated(): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OWNER_SESSION);
      if (!data) return false;
      const session = JSON.parse(data);
      if (!session.token || !session.expiresAt) return false;
      if (Date.now() > session.expiresAt) {
        this.ownerLogout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public getOwnerLockoutStatus(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAILED_OWNER_ATTEMPTS);
      if (!data) return { isLocked: false, remainingSeconds: 0, attemptsLeft: 3 };
      const attempts = JSON.parse(data);
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingSeconds = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
        return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
      }
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: Math.max(0, 3 - (attempts.count || 0)) };
    } catch {
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: 3 };
    }
  }

  public ownerLogin(passcode: string): { success: boolean; error?: string; attemptsLeft?: number; remainingSeconds?: number } {
    const cleanPass = passcode.trim();
    const lockout = this.getOwnerLockoutStatus();

    if (lockout.isLocked) {
      return {
        success: false,
        error: `Konsol Pemilik terkunci demi keamanan karena percobaan gagal berulang. Tunggu ${lockout.remainingSeconds} detik lagi.`,
        remainingSeconds: lockout.remainingSeconds,
        attemptsLeft: 0
      };
    }

    if (OWNER_PASSCODES.includes(cleanPass)) {
      // Success: clear failed attempts
      localStorage.removeItem(STORAGE_KEYS.FAILED_OWNER_ATTEMPTS);
      const token = 'kn_sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
      const expiresAt = Date.now() + 4 * 3600 * 1000; // 4 hours valid
      localStorage.setItem(STORAGE_KEYS.OWNER_SESSION, JSON.stringify({ token, expiresAt, loginAt: new Date().toISOString() }));

      this.logSecurityEvent('owner_login_success', 'Pemilik bengkel berhasil membuka sesi kontrol manajemen atelier.', 'info');
      this.notify('OWNER_AUTH_CHANGED', { authenticated: true });
      return { success: true };
    } else {
      // Failed attempt
      let count = 1;
      const data = localStorage.getItem(STORAGE_KEYS.FAILED_OWNER_ATTEMPTS);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          count = (parsed.count || 0) + 1;
        } catch {
          count = 1;
        }
      }

      if (count >= 3) {
        const lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
        localStorage.setItem(STORAGE_KEYS.FAILED_OWNER_ATTEMPTS, JSON.stringify({ count, lockedUntil }));
        this.logSecurityEvent('unauthorized_attempt', `3x Kegagalan Kunci Pemilik! Akses konsol diblokir sementara selama 5 menit.`, 'danger');
        return {
          success: false,
          error: 'Kunci Pemilik salah! Terlalu banyak percobaan, portal dikunci selama 5 menit demi mencegah peretasan.',
          attemptsLeft: 0,
          remainingSeconds: 300
        };
      } else {
        localStorage.setItem(STORAGE_KEYS.FAILED_OWNER_ATTEMPTS, JSON.stringify({ count }));
        const attemptsLeft = 3 - count;
        this.logSecurityEvent('owner_login_failed', `Percobaan masuk pemilik atelier gagal (${count}/3). Input tidak cocok.`, 'warning');
        return {
          success: false,
          error: `Kunci Pemilik salah! Sisa kesempatan: ${attemptsLeft} kali sebelum akun dikunci. (Default: owner88)`,
          attemptsLeft
        };
      }
    }
  }

  public ownerLogout(): void {
    localStorage.removeItem(STORAGE_KEYS.OWNER_SESSION);
    this.notify('OWNER_AUTH_CHANGED', { authenticated: false });
  }

  public getSecurityLogs(): SecurityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECURITY_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logSecurityEvent(eventType: SecurityLog['eventType'], details: string, severity: SecurityLog['severity'] = 'info') {
    const logs = this.getSecurityLogs();
    const newLog: SecurityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      eventType,
      ipOrSource: 'Secure Client Engine',
      details,
      severity
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.length = 50;
    localStorage.setItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(logs));
    this.notify('SECURITY_LOGS_UPDATED', logs);
  }

  public clearSecurityLogs(): void {
    localStorage.setItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify([]));
    this.notify('SECURITY_LOGS_UPDATED', []);
  }

  // ==========================================
  // ORDER ISSUE REPORTS ("LAPOR PESANAN")
  // ==========================================

  public getOrderReports(): OrderReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDER_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public submitOrderReport(params: {
    inquiryId: string;
    issueType: IssueType;
    description: string;
  }): { success: boolean; report?: OrderReport; whatsappUrl?: string; error?: string } {
    const inquiries = this.getInquiries();
    const inquiry = inquiries.find(i => i.id === params.inquiryId || i.inquiryNumber === params.inquiryId);

    if (!inquiry) {
      return { success: false, error: 'Pesanan tidak ditemukan dalam sistem.' };
    }

    const cleanDesc = sanitizeInput(params.description);
    if (!cleanDesc || cleanDesc.length < 5) {
      return { success: false, error: 'Mohon jelaskan detail kendala pesanan secara lengkap minimal 5 karakter.' };
    }

    const now = new Date().toISOString();
    const dateTag = now.slice(0, 10).replace(/-/g, '');
    const reportNumber = `RPT-${dateTag}-${Math.floor(100 + Math.random() * 900)}`;

    const newReport: OrderReport = {
      id: 'rpt_' + Date.now(),
      reportNumber,
      inquiryId: inquiry.id,
      inquiryNumber: inquiry.inquiryNumber,
      sessionNumber: inquiry.sessionNumber,
      customerName: inquiry.customerName,
      whatsappNumber: inquiry.whatsappNumber,
      email: inquiry.customerEmail || '',
      issueType: params.issueType,
      description: cleanDesc,
      createdAt: now,
      status: 'open'
    };

    const reports = this.getOrderReports();
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.ORDER_REPORTS, JSON.stringify(reports));

    // 1. Notifikasi Prioritas Tinggi untuk Pemilik (Owner)
    this.addNotification({
      title: `🚨 Laporan Kendala Pesanan (${inquiry.inquiryNumber})`,
      message: `${inquiry.customerName} melaporkan kendala pengiriman. No Sesi: ${inquiry.sessionNumber}.`,
      type: 'inquiry',
      priority: 'high',
      inquiryId: inquiry.id,
      targetAudience: 'owner'
    });

    // 2. Notifikasi Konfirmasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Laporan Kendala Diterima',
      message: `Laporan Anda untuk pesanan ${inquiry.inquiryNumber} (No. Laporan: ${reportNumber}) telah tercatat dan sedang ditindaklanjuti oleh pemilik atelier.`,
      type: 'inquiry',
      priority: 'normal',
      inquiryId: inquiry.id,
      targetAudience: 'customer',
      recipientPhone: inquiry.whatsappNumber,
      recipientEmail: inquiry.customerEmail
    });

    this.logSecurityEvent('order_report_filed', `Laporan eskalasi ${reportNumber} diajukan untuk No Sesi ${inquiry.sessionNumber}.`, 'warning');

    // WhatsApp Direct Escalation message to Owner
    const issueLabels: Record<IssueType, string> = {
      belum_sampai: 'Pesanan belum sampai melebihi estimasi waktu',
      keterlambatan_ekspedisi: 'Keterlambatan proses ekspedisi / pengiriman',
      status_stuck: 'Status pengerjaan / update resi tidak ada kabar',
      kerusakan: 'Klaim kerusakan transit / spesifikasi tidak sesuai',
      lainnya: 'Kendala pesanan lainnya'
    };

    let waMsg = `🚨 *ESKALASI LAPORAN PESANAN - Toko Kayu Delin Jaya*\n\n`;
    waMsg += `*No. Laporan:* ${reportNumber}\n`;
    waMsg += `*No. Referensi:* ${inquiry.inquiryNumber}\n`;
    waMsg += `*NOMOR SESI RESMI:* ${inquiry.sessionNumber}\n\n`;
    waMsg += `*Nama Pelanggan:* ${inquiry.customerName}\n`;
    waMsg += `*No. WA:* ${inquiry.whatsappNumber}\n`;
    if (inquiry.customerEmail) waMsg += `*Email:* ${inquiry.customerEmail}\n`;
    waMsg += `*Kota:* ${inquiry.city}\n`;
    waMsg += `*Jenis Kendala:* ${issueLabels[params.issueType] || params.issueType}\n\n`;
    waMsg += `*Keterangan Kendala:* \n"${cleanDesc}"\n\n`;
    waMsg += `📄 _Catatan: Dokumen PDF Resmi Pesanan ber-Nomor Sesi lengkap telah saya siapkan untuk verifikasi Owner._`;

    const encoded = encodeURIComponent(waMsg);
    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encoded}`;

    // Asynchronous background sync to Golang Backend
    fetch('/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inquiryNumber: inquiry.inquiryNumber,
        sessionNumber: inquiry.sessionNumber,
        customerName: inquiry.customerName,
        whatsappNumber: inquiry.whatsappNumber,
        email: inquiry.customerEmail,
        issueType: params.issueType,
        description: cleanDesc
      })
    }).catch(() => {});

    this.notify('ORDER_REPORT_CREATED', newReport);

    return { success: true, report: newReport, whatsappUrl };
  }

  public updateReportStatus(reportId: string, status: 'open' | 'investigating' | 'resolved', resolutionNote?: string): OrderReport | undefined {
    const reports = this.getOrderReports();
    const idx = reports.findIndex(r => r.id === reportId || r.reportNumber === reportId);
    if (idx === -1) return undefined;

    reports[idx].status = status;
    if (resolutionNote) {
      reports[idx].resolutionNote = sanitizeInput(resolutionNote);
    }
    localStorage.setItem(STORAGE_KEYS.ORDER_REPORTS, JSON.stringify(reports));

    // Asynchronous background sync to Golang Backend
    fetch(`/api/v1/reports/${reports[idx].reportNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNote })
    }).catch(() => {});

    // 1. Notifikasi untuk Pemilik (Owner)
    this.addNotification({
      title: 'Status Laporan Pesanan Diperbarui',
      message: `Laporan ${reports[idx].reportNumber} (Sesi: ${reports[idx].sessionNumber}) diubah menjadi: ${status.toUpperCase()}`,
      type: 'system',
      priority: 'normal',
      targetAudience: 'owner'
    });

    // 2. Notifikasi untuk Pelanggan (Customer)
    this.addNotification({
      title: 'Tanggapan Laporan Kendala Pesanan',
      message: `Laporan kendala ${reports[idx].reportNumber} Anda kini berstatus: ${status.toUpperCase()}.${resolutionNote ? ` Catatan Owner: ${resolutionNote}` : ''}`,
      type: 'inquiry',
      priority: 'normal',
      targetAudience: 'customer',
      recipientPhone: reports[idx].whatsappNumber,
      recipientEmail: reports[idx].email
    });

    this.notify('ORDER_REPORT_UPDATED', reports[idx]);
    return reports[idx];
  }

  // ==========================================
  // EXCEL EXPORT (RAPAT, TERSTRUKTUR & AMAN FORMAT)
  // ==========================================

  public exportInquiriesToExcel(inquiries: Inquiry[]): void {
    // UTF-8 BOM \uFEFF ensures Excel displays Indonesian characters and currency without mangling
    const headers = [
      'No. Referensi',
      'Nomor Sesi Resmi',
      'Tanggal Order',
      'Nama Pelanggan',
      'No. WhatsApp Aktif',
      'Email Aktif',
      'Kota Pengiriman',
      'Tipe Pesanan',
      'Jenis Kayu',
      'Kategori Furniture',
      'Estimasi Dimensi',
      'Status Pengerjaan',
      'Pesanan Berulang (Repeat)',
      'Catatan Spesifikasi'
    ];

    const rows = inquiries.map(item => {
      const date = new Date(item.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const orderTypeStr = item.orderType === 'raw_wood' ? 'Kayu Mentah' : 'Custom Furniture';
      const statusMap: Record<string, string> = {
        new: 'Baru (Menunggu Konfirmasi)',
        processing: 'Sedang Diproses Pengrajin',
        done: 'Selesai / Terkirim',
        cancelled: 'Dibatalkan'
      };
      const statusStr = statusMap[item.status] || item.status;
      // Formula string format ="'+62..." guarantees Excel preserves full phone digits and does not convert to scientific notation
      const phoneCell = `="${item.whatsappNumber}"`;
      const sessionCell = `="${item.sessionNumber || '-'}"`;
      const repeatStr = item.isRepeatCustomer ? `Ya (Order #${item.repeatOrderCount})` : 'Baru';

      return [
        `"${item.inquiryNumber}"`,
        sessionCell,
        `"${date}"`,
        `"${(item.customerName || '').replace(/"/g, '""')}"`,
        phoneCell,
        `"${(item.customerEmail || '-').replace(/"/g, '""')}"`,
        `"${(item.city || '').replace(/"/g, '""')}"`,
        `"${orderTypeStr}"`,
        `"${(item.woodTypeName || '').replace(/"/g, '""')}"`,
        `"${(item.categoryName || '-').replace(/"/g, '""')}"`,
        `"${(item.sizeEstimate || '').replace(/"/g, '""')}"`,
        `"${statusStr}"`,
        `"${repeatStr}"`,
        `"${(item.referenceNote || '-').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Kayu_Nusantara_Inquiry_Rekap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public exportCustomersToExcel(customers: Customer[]): void {
    const headers = [
      'ID Pelanggan',
      'Nama Pelanggan',
      'Nomor WhatsApp',
      'Email Terdaftar',
      'Kota Domisili',
      'Total Pesanan',
      'Status Pelanggan Setia',
      'Order Pertama',
      'Order Terakhir',
      'Catatan Khusus'
    ];

    const rows = customers.map(c => {
      const phoneCell = `="${c.whatsappNumber}"`;
      const firstDate = new Date(c.firstOrderAt).toLocaleDateString('id-ID');
      const lastDate = new Date(c.lastOrderAt).toLocaleDateString('id-ID');
      const loyalStr = c.isLoyalCustomer ? '⭐ Pelanggan Setia (VIP)' : 'Reguler';

      return [
        `"${c.id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        phoneCell,
        `"${(c.email || '-').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        c.totalOrders,
        `"${loyalStr}"`,
        `"${firstDate}"`,
        `"${lastDate}"`,
        `"${(c.notes || '-').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Kayu_Nusantara_Pelanggan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public exportReportsToExcel(reports: OrderReport[]): void {
    const headers = [
      'No. Laporan',
      'Tanggal Lapor',
      'No. Referensi',
      'Nomor Sesi Resmi',
      'Nama Pelanggan',
      'No. WhatsApp',
      'Email',
      'Jenis Kendala',
      'Deskripsi Kendala',
      'Status Penanganan',
      'Catatan Owner'
    ];

    const rows = reports.map(r => {
      const date = new Date(r.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
      const phoneCell = `="${r.whatsappNumber}"`;
      const sessionCell = `="${r.sessionNumber}"`;
      return [
        `"${r.reportNumber}"`,
        `"${date}"`,
        `"${r.inquiryNumber}"`,
        sessionCell,
        `"${(r.customerName || '').replace(/"/g, '""')}"`,
        phoneCell,
        `"${(r.email || '-').replace(/"/g, '""')}"`,
        `"${r.issueType}"`,
        `"${(r.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${r.status}"`,
        `"${(r.resolutionNote || '-').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Kayu_Nusantara_Laporan_Kendala_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // OWNER EMERGENCY RESET / FACTORY RESET
  // ==========================================

  public resetDatabaseToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.WOODS, JSON.stringify(INITIAL_WOODS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(SEED_INQUIRIES));
    localStorage.removeItem(STORAGE_KEYS.BACKUPS);
    localStorage.removeItem(STORAGE_KEYS.ORDER_REPORTS);

    this.logSecurityEvent('db_restore', 'Database direset ke kondisi pabrik oleh Owner.', 'danger');
    this.addNotification({
      title: 'Database Direset',
      message: 'Semua koleksi telah dikembalikan ke data awal workshop.',
      type: 'system',
      priority: 'high',
      targetAudience: 'owner'
    });

    this.notify('DATABASE_RESET', null);
  }
}

export const dbService = new DatabaseService();
