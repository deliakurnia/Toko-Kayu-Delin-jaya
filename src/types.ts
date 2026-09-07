/**
 * Types definition for Kayu Nusantara
 * PRD: Pengadaan & Custom Furniture Kayu
 * Database schema matches MongoDB / Golang BSON structure
 */

export interface WoodCharacteristics {
  kekerasan: string;      // e.g. "1.155 lbf (Janka Scale - Sangat Keras)"
  warna: string;          // e.g. "Cokelat Keemasan dengan Urat Gelap"
  ketahanan: string;      // e.g. "Kelas I-II (Anti Rayap & Tahan Cuaca)"
  kegunaan: string[];     // e.g. ["Furniture Mewah", "Kusen", "Lantai Parquet"]
  kadarAir: string;       // e.g. "10% - 12% (Kiln Dried Standar Ekspor)"
  massaJenis: string;     // e.g. "670 - 750 kg/m³"
}

export type WoodStockStatus = 'ready' | 'low_stock' | 'out_of_stock' | 'pre_order';

export interface WoodType {
  id: string;             // MongoDB ObjectID hex string
  name: string;           // "Jati", "Eboni", "Sonokeling", "Gaharu"
  botanicalName: string;  // "Tectona grandis", "Diospyros celebica", etc.
  slug: string;
  description: string;
  characteristics: WoodCharacteristics;
  images: string[];
  priceRangeEstimate: string; // e.g. "Rp 18.000.000 - Rp 35.000.000 / m³"
  origin: string;         // e.g. "Blora, Jawa Tengah"
  textureColorHex: string;// Color hex for 3D shader
  roughness: number;      // 3D material roughness
  metalness: number;      // 3D material sheen
  isActive: boolean;
  stockStatus: WoodStockStatus;
  stockVolumeM3: number;   // Volume in m³
  stockSlabsCount: number; // Number of available raw slab units
  restockEstimate?: string;// e.g. "Ready Siap Kirim" or "Proses Oven Kiln-Dry (2–3 Minggu)"
  lastStockUpdate?: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;           // "Buffet", "Lemari", "Meja", "Bangku", "Hiasan", "Lainnya"
  slug: string;
  description: string;
  referenceImages: string[];
  typicalDimensions: string;
  estimatedCraftTime: string;
  isActive: boolean;
}

export interface Customer {
  id: string;             // MongoDB ObjectID hex string
  whatsappNumber: string; // Unique identifier (+62...)
  name: string;
  city: string;
  email?: string;
  totalOrders: number;    // Order count (detect repeat customer)
  isLoyalCustomer: boolean; // Computed or flagged >= 2 orders
  firstOrderAt: string;
  lastOrderAt: string;
  notes?: string;
}

export type OrderType = 'raw_wood' | 'custom_furniture';

export type InquiryStatus = 'new' | 'awaiting_payment' | 'dp_paid' | 'in_production' | 'processing' | 'ready_to_ship' | 'shipped' | 'done' | 'cancelled';

export interface CostBreakdown {
  rawWoodCost: number;       // Biaya bahan baku kayu log/slab
  kilnDryCost: number;       // Biaya pengeringan oven kiln-dry
  craftsmanshipCost: number; // Biaya jasa pertukangan / pahatan
  finishingCost: number;     // Biaya finishing (matte/natural oil)
  shippingCost: number;      // Ongkos kargo truk ekspedisi
  finalPrice: number;        // Total penawaran harga resmi (HPP + Margin)
  notes?: string;
  quotedAt: string;
}

export type PaymentPlanType = 'full' | 'dp_50';
export type PaymentMethodType = 'qris' | 'bca_va' | 'mandiri_va' | 'bni_va' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'dp_paid' | 'settled' | 'expired';

export interface PaymentRecord {
  id: string;
  inquiryId: string;
  inquiryNumber: string;
  paymentPlan: PaymentPlanType; // 'full' (Lunas 100%) vs 'dp_50' (DP 50%)
  method: PaymentMethodType;    // 'qris', 'bca_va', etc.
  totalAmount: number;          // Total nilai transaksi (Rp)
  dpAmount: number;             // Nominal DP 50%
  remainingAmount: number;      // Sisa tagihan pelunasan
  settlementDueDate?: string;   // Tanggal janji pelunasan user (Klausul Anti-Kabur)
  isDpPaid: boolean;
  dpPaidAt?: string;
  isSettled: boolean;           // Wajib true sebelum barang boleh dimuat ke truk
  settledAt?: string;
  virtualAccountNumber?: string;
  qrisPayload?: string;
  uniqueCode: number;           // 3 digit kode verifikasi
  transferProofUrl?: string;    // Foto struk transfer bank
  status: PaymentStatus;
  verifiedByOwner: boolean;
  verifiedAt?: string;
}

export type ProductionStage = 
  | 'raw_log_selection' // 1. Pemilihan Log Kayu
  | 'sawmill_cutting'   // 2. Pembelahan Slab
  | 'kiln_dry'          // 3. Pengeringan Oven (MC 10-12%)
  | 'woodworking'       // 4. Konstruksi & Perakitan
  | 'finishing'         // 5. Finishing Natural Oil
  | 'quality_control'   // 6. Uji Kualitas Akhir
  | 'ready_to_ship';    // 7. Siap Muat Truk (Hanya jika lunas)

export interface ProductionMilestone {
  id: string;
  inquiryId: string;
  stage: ProductionStage;
  title: string;
  description: string;
  photos: string[];
  moistureContentMC?: string; // e.g. "11.2%"
  recordedAt: string;
  updatedBy: string;
}

export interface SVLKCertificate {
  certificateNumber: string;   // Nomor registrasi legalitas kayu
  originForestLocation: string;// Titik asal tebang Perhutani
  vLegalDocUrl?: string;
  verifiedDate: string;
}

export interface ShipmentWaybill {
  inquiryId: string;
  carrierName: string;         // Ekspedisi kargo truk kayu
  truckPlateNumber: string;    // Plat nomor truk (e.g. K 1892 DA)
  driverName?: string;
  driverPhone?: string;
  waybillNumber: string;       // Nomor resi kargo
  shippedAt?: string;
  estimatedArrival?: string;
  shippingProofPhoto?: string;
  isDelivered: boolean;
}

export interface StockLedgerEntry {
  id: string;
  woodId: string;
  woodName: string;
  type: 'inflow' | 'outflow';
  volumeM3: number;
  slabsCount: number;
  referenceId: string;
  description: string;
  timestamp: string;
}

export interface CashLedgerEntry {
  id: string;
  inquiryNumber: string;
  type: 'income_dp' | 'income_settlement' | 'operational_expense';
  amount: number;
  description: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  inquiryNumber: string;  // e.g. "INQ-20260905-001"
  sessionNumber: string;  // Unique security session identifier e.g. "SES-20260905-8821"
  customerId: string;
  customerName: string;
  whatsappNumber: string;
  customerEmail?: string;
  city: string;
  orderType: OrderType;
  woodTypeId: string;
  woodTypeName: string;
  categoryId?: string;
  categoryName?: string;
  sizeEstimate: string;
  referenceNote: string;
  referenceImageUrl?: string;
  status: InquiryStatus;
  estimatedBudget?: string;
  isRepeatCustomer: boolean;
  repeatOrderCount: number;
  
  // Modul Interkoneksi Bisnis & Finansial
  quotation?: CostBreakdown;
  paymentRecord?: PaymentRecord;
  productionMilestones?: ProductionMilestone[];
  svlkCertificate?: SVLKCertificate;
  shipmentWaybill?: ShipmentWaybill;
  
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  city: string;
  address?: string;
  registeredAt?: string;
  createdAt?: string;
  lastLoginAt: string;
  role: 'user' | 'owner' | 'customer';
}

export type IssueType = 'belum_sampai' | 'keterlambatan_ekspedisi' | 'status_stuck' | 'kerusakan' | 'lainnya';

export interface OrderReport {
  id: string;
  reportNumber: string; // e.g. "RPT-20260905-102"
  inquiryId: string;
  inquiryNumber: string;
  sessionNumber: string;
  customerName: string;
  whatsappNumber: string;
  email: string;
  issueType: IssueType;
  description: string;
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionNote?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: 'owner_login_success' | 'owner_login_failed' | 'admin_login_success' | 'admin_login_failed' | 'user_register' | 'user_login' | 'db_backup' | 'db_restore' | 'unauthorized_attempt' | 'order_report_filed';
  ipOrSource: string;
  details: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'inquiry' | 'customer' | 'backup' | 'system';
  isRead: boolean;
  inquiryId?: string;
  priority?: 'normal' | 'high';
  // Segmentasi Penerima & Privasi Data
  targetAudience?: 'owner' | 'customer' | 'all';
  recipientUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  totalRecords: {
    woods: number;
    categories: number;
    customers: number;
    inquiries: number;
  };
  sizeKb: number;
  checksum: string;
  timestamp: string;
  autoScheduled: boolean;
  status: 'completed' | 'verified';
}

export interface ThreeAnnotation {
  id: string;
  label: string;
  sublabel: string;
  position: [number, number, number]; // [x, y, z] in ThreeJS world space
  description: string;
}

export interface SavedItem {
  id: string;
  itemType: 'wood' | 'furniture';
  referenceId: string;
  name: string;
  image: string;
  priceEstimate: string;
  subtitle?: string;
  savedAt: string;
}
