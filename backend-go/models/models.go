package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WoodCharacteristics karakteristik fisik kayu
type WoodCharacteristics struct {
	Kekerasan  string   `bson:"kekerasan" json:"kekerasan"`
	Warna      string   `bson:"warna" json:"warna"`
	Ketahanan  string   `bson:"ketahanan" json:"ketahanan"`
	KadarAir   string   `bson:"kadar_air" json:"kadarAir"`
	MassaJenis string   `bson:"massa_jenis" json:"massaJenis"`
	Kegunaan   []string `bson:"kegunaan" json:"kegunaan"`
}

// WoodType model jenis kayu (Jati, Eboni, Sonokeling, Gaharu)
type WoodType struct {
	ID                 primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Name               string              `bson:"name" json:"name"`
	BotanicalName      string              `bson:"botanical_name" json:"botanicalName"`
	Slug               string              `bson:"slug" json:"slug"`
	Description        string              `bson:"description" json:"description"`
	Characteristics    WoodCharacteristics `bson:"characteristics" json:"characteristics"`
	Images             []string            `bson:"images" json:"images"`
	PriceRangeEstimate string              `bson:"price_range_estimate" json:"priceRangeEstimate"`
	Origin             string              `bson:"origin" json:"origin"`
	TextureColorHex    string              `bson:"texture_color_hex" json:"textureColorHex"`
	Roughness          float64             `bson:"roughness" json:"roughness"`
	Metalness          float64             `bson:"metalness" json:"metalness"`
	IsActive           bool                `bson:"is_active" json:"isActive"`
	StockStatus        string              `bson:"stock_status" json:"stockStatus"` // ready, low_stock, out_of_stock, pre_order
	StockVolumeM3      float64             `bson:"stock_volume_m3" json:"stockVolumeM3"`
	StockSlabsCount    int                 `bson:"stock_slabs_count" json:"stockSlabsCount"`
	RestockEstimate    string              `bson:"restock_estimate,omitempty" json:"restockEstimate,omitempty"`
	LastStockUpdate    time.Time           `bson:"last_stock_update,omitempty" json:"lastStockUpdate,omitempty"`
	CreatedAt          time.Time           `bson:"created_at" json:"createdAt"`
}

// WoodStockUpdateRequest payload update stok cepat
type WoodStockUpdateRequest struct {
	StockStatus     string  `json:"stockStatus"`
	StockVolumeM3   float64 `json:"stockVolumeM3"`
	StockSlabsCount int     `json:"stockSlabsCount"`
	RestockEstimate string  `json:"restockEstimate"`
}

// ProductCategory kategori furniture kustom
type ProductCategory struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name               string             `bson:"name" json:"name"`
	Slug               string             `bson:"slug" json:"slug"`
	Description        string             `bson:"description" json:"description"`
	ReferenceImages    []string           `bson:"reference_images" json:"referenceImages"`
	TypicalDimensions  string             `bson:"typical_dimensions" json:"typicalDimensions"`
	EstimatedCraftTime string             `bson:"estimated_craft_time" json:"estimatedCraftTime"`
	IsActive           bool               `bson:"is_active" json:"isActive"`
}

// Customer data pelanggan & pencatatan loyalitas (PRD 6.3)
type Customer struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WhatsAppNumber  string             `bson:"whatsapp_number" json:"whatsappNumber"` // Unique identifier
	Name            string             `bson:"name" json:"name"`
	City            string             `bson:"city" json:"city"`
	Email           string             `bson:"email,omitempty" json:"email,omitempty"`
	TotalOrders     int                `bson:"total_orders" json:"totalOrders"` // Increment per order
	IsLoyalCustomer bool               `bson:"is_loyal_customer" json:"isLoyalCustomer"`
	FirstOrderAt    time.Time          `bson:"first_order_at" json:"firstOrderAt"`
	LastOrderAt     time.Time          `bson:"last_order_at" json:"lastOrderAt"`
	Notes           string             `bson:"notes,omitempty" json:"notes,omitempty"`
}

// UserAccount model akun pemesan/pelanggan terdaftar di MongoDB Atlas & Local Store
type UserAccount struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name           string             `bson:"name" json:"name"`
	WhatsAppNumber string             `bson:"whatsapp_number" json:"whatsappNumber"` // 62...
	Email          string             `bson:"email" json:"email"`
	City           string             `bson:"city" json:"city"`
	Address        string             `bson:"address,omitempty" json:"address,omitempty"`
	Role           string             `bson:"role" json:"role"` // "customer"
	CreatedAt      time.Time          `bson:"created_at" json:"createdAt"`
	LastLoginAt    time.Time          `bson:"last_login_at" json:"lastLoginAt"`
}

// RegisterUserRequest payload pendaftaran akun pemesan baru
type RegisterUserRequest struct {
	Name           string `json:"name"`
	WhatsAppNumber string `json:"whatsappNumber"`
	Email          string `json:"email"`
	City           string `json:"city"`
	Address        string `json:"address,omitempty"`
}

// LoginUserRequest payload masuk akun pemesan
type LoginUserRequest struct {
	Identifier string `json:"identifier"` // Email atau nomor WhatsApp
}

// UpdateUserProfileRequest payload pembaruan data profil pelanggan
type UpdateUserProfileRequest struct {
	Name    string `json:"name"`
	City    string `json:"city"`
	Address string `json:"address"`
}

// Inquiry pesanan / permintaan (PRD 6.2)
type Inquiry struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	InquiryNumber    string             `bson:"inquiry_number" json:"inquiryNumber"` // e.g. "INQ-20260905-001"
	CustomerID       primitive.ObjectID `bson:"customer_id" json:"customerId"`
	CustomerName     string             `bson:"customer_name" json:"customerName"`
	WhatsAppNumber   string             `bson:"whatsapp_number" json:"whatsappNumber"`
	City             string             `bson:"city" json:"city"`
	Email            string             `bson:"email,omitempty" json:"email,omitempty"`
	OrderType        string             `bson:"order_type" json:"orderType"` // 'raw_wood' / 'custom_furniture'
	WoodTypeID       primitive.ObjectID `bson:"wood_type_id" json:"woodTypeId"`
	WoodTypeName     string             `bson:"wood_type_name" json:"woodTypeName"`
	CategoryID       string             `bson:"category_id,omitempty" json:"categoryId,omitempty"`
	CategoryName     string             `bson:"category_name,omitempty" json:"categoryName,omitempty"`
	SizeEstimate     string             `bson:"size_estimate" json:"sizeEstimate"`
	ReferenceNote    string             `bson:"reference_note" json:"referenceNote"`
	ReferenceImage   string             `bson:"reference_image_url,omitempty" json:"referenceImageUrl,omitempty"`
	Status           string             `bson:"status" json:"status"` // 'new', 'processing', 'done', 'cancelled'
	IsRepeatCustomer bool               `bson:"is_repeat_customer" json:"isRepeatCustomer"`
	RepeatOrderCount int                `bson:"repeat_order_count" json:"repeatOrderCount"`
	SessionNumber    string                `bson:"session_number,omitempty" json:"sessionNumber,omitempty"`
	CreatedAt        time.Time             `bson:"created_at" json:"createdAt"`
	UpdatedAt        time.Time             `bson:"updated_at" json:"updatedAt"`

	// Modul Bisnis Interkoneksi (Quotation, Payment, Production, SVLK, Logistics)
	Quotation            *CostBreakdown        `bson:"quotation,omitempty" json:"quotation,omitempty"`
	PaymentRecord        *PaymentRecord        `bson:"payment_record,omitempty" json:"paymentRecord,omitempty"`
	ProductionMilestones []ProductionMilestone `bson:"production_milestones,omitempty" json:"productionMilestones,omitempty"`
	SVLKCertificate      *SVLKCertificate      `bson:"svlk_certificate,omitempty" json:"svlkCertificate,omitempty"`
	ShipmentWaybill      *ShipmentWaybill      `bson:"shipment_waybill,omitempty" json:"shipmentWaybill,omitempty"`
}

// CostBreakdown kalkulator penawaran harga resmi (Modul 2)
type CostBreakdown struct {
	RawWoodCost       float64   `bson:"raw_wood_cost" json:"rawWoodCost"`
	KilnDryCost       float64   `bson:"kiln_dry_cost" json:"kilnDryCost"`
	CraftsmanshipCost float64   `bson:"craftsmanship_cost" json:"craftsmanshipCost"`
	FinishingCost     float64   `bson:"finishing_cost" json:"finishingCost"`
	ShippingCost      float64   `bson:"shipping_cost" json:"shippingCost"`
	FinalPrice        float64   `bson:"final_price" json:"finalPrice"`
	Notes             string    `bson:"notes,omitempty" json:"notes,omitempty"`
	QuotedAt          time.Time `bson:"quoted_at" json:"quotedAt"`
}

// PaymentRecord pencatatan transaksi pembayaran DP & pelunasan
type PaymentRecord struct {
	ID                   string     `bson:"id" json:"id"`
	InquiryID            string     `bson:"inquiry_id" json:"inquiryId"`
	InquiryNumber        string     `bson:"inquiry_number" json:"inquiryNumber"`
	PaymentPlan          string     `bson:"payment_plan" json:"paymentPlan"` // 'full' vs 'dp_50'
	Method               string     `bson:"method" json:"method"`             // 'qris', 'bca_va', 'mandiri_va', 'bni_va', 'bank_transfer'
	TotalAmount          float64    `bson:"total_amount" json:"totalAmount"`
	DpAmount             float64    `bson:"dp_amount" json:"dpAmount"`
	RemainingAmount      float64    `bson:"remaining_amount" json:"remainingAmount"`
	SettlementDueDate    string     `bson:"settlement_due_date,omitempty" json:"settlementDueDate,omitempty"` // Klausul Anti-Kabur
	IsDpPaid             bool       `bson:"is_dp_paid" json:"isDpPaid"`
	DpPaidAt             *time.Time `bson:"dp_paid_at,omitempty" json:"dpPaidAt,omitempty"`
	IsSettled            bool       `bson:"is_settled" json:"isSettled"` // Wajib true sebelum barang boleh dimuat ke kargo
	SettledAt            *time.Time `bson:"settled_at,omitempty" json:"settledAt,omitempty"`
	VirtualAccountNumber string     `bson:"virtual_account_number,omitempty" json:"virtualAccountNumber,omitempty"`
	QrisPayload          string     `bson:"qris_payload,omitempty" json:"qrisPayload,omitempty"`
	UniqueCode           int        `bson:"unique_code" json:"uniqueCode"`
	TransferProofURL     string     `bson:"transfer_proof_url,omitempty" json:"transferProofUrl,omitempty"`
	Status               string     `bson:"status" json:"status"` // 'pending', 'dp_paid', 'settled', 'expired'
	VerifiedByOwner      bool       `bson:"verified_by_owner" json:"verifiedByOwner"`
	VerifiedAt           *time.Time `bson:"verified_at,omitempty" json:"verifiedAt,omitempty"`
}

// ProductionMilestone tonggak progres produksi berfoto & kadar air MC%
type ProductionMilestone struct {
	ID                string    `bson:"id" json:"id"`
	InquiryID         string    `bson:"inquiry_id" json:"inquiryId"`
	Stage             string    `bson:"stage" json:"stage"` // 'raw_log_selection', 'sawmill_cutting', 'kiln_dry', 'woodworking', 'finishing', 'quality_control', 'ready_to_ship'
	Title             string    `bson:"title" json:"title"`
	Description       string    `bson:"description" json:"description"`
	Photos            []string  `bson:"photos" json:"photos"`
	MoistureContentMC string    `bson:"moisture_content_mc,omitempty" json:"moistureContentMC,omitempty"`
	RecordedAt        time.Time `bson:"recorded_at" json:"recordedAt"`
	UpdatedBy         string    `bson:"updated_by" json:"updatedBy"`
}

// SVLKCertificate sertifikat legalitas kayu & verifikasi asal hutan
type SVLKCertificate struct {
	CertificateNumber    string `bson:"certificate_number" json:"certificateNumber"`
	OriginForestLocation string `bson:"origin_forest_location" json:"originForestLocation"`
	VLegalDocURL         string `bson:"v_legal_doc_url,omitempty" json:"vLegalDocUrl,omitempty"`
	VerifiedDate         string `bson:"verified_date" json:"verifiedDate"`
}

// ShipmentWaybill surat jalan kargo truk & resi ekspedisi
type ShipmentWaybill struct {
	InquiryID          string     `bson:"inquiry_id" json:"inquiryId"`
	CarrierName        string     `bson:"carrier_name" json:"carrierName"`
	TruckPlateNumber   string     `bson:"truck_plate_number" json:"truckPlateNumber"`
	DriverName         string     `bson:"driver_name,omitempty" json:"driverName,omitempty"`
	DriverPhone        string     `bson:"driver_phone,omitempty" json:"driverPhone,omitempty"`
	WaybillNumber      string     `bson:"waybill_number" json:"waybillNumber"`
	ShippedAt          *time.Time `bson:"shipped_at,omitempty" json:"shippedAt,omitempty"`
	EstimatedArrival   string     `bson:"estimated_arrival,omitempty" json:"estimatedArrival,omitempty"`
	ShippingProofPhoto string     `bson:"shipping_proof_photo,omitempty" json:"shippingProofPhoto,omitempty"`
	IsDelivered        bool       `bson:"is_delivered" json:"isDelivered"`
}

// StockLedgerEntry buku mutasi kubikasi kayu
type StockLedgerEntry struct {
	ID          string    `bson:"id" json:"id"`
	WoodID      string    `bson:"wood_id" json:"woodId"`
	WoodName    string    `bson:"wood_name" json:"woodName"`
	Type        string    `bson:"type" json:"type"` // 'inflow', 'outflow'
	VolumeM3    float64   `bson:"volume_m3" json:"volumeM3"`
	SlabsCount  int       `bson:"slabs_count" json:"slabsCount"`
	ReferenceID string    `bson:"reference_id" json:"referenceId"`
	Description string    `bson:"description" json:"description"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
}

// CashLedgerEntry buku kas masuk/keluar keuangan atelier
type CashLedgerEntry struct {
	ID            string    `bson:"id" json:"id"`
	InquiryNumber string    `bson:"inquiry_number" json:"inquiryNumber"`
	Type          string    `bson:"type" json:"type"` // 'income_dp', 'income_settlement', 'operational_expense'
	Amount        float64   `bson:"amount" json:"amount"`
	Description   string    `bson:"description" json:"description"`
	Timestamp     time.Time `bson:"timestamp" json:"timestamp"`
}

// OrderReport laporan kendala pesanan dari pelanggan
type OrderReport struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReportNumber   string             `bson:"report_number" json:"reportNumber"` // e.g. "RPT-20260907-001"
	InquiryNumber  string             `bson:"inquiry_number" json:"inquiryNumber"`
	SessionNumber  string             `bson:"session_number" json:"sessionNumber"`
	CustomerName   string             `bson:"customer_name" json:"customerName"`
	WhatsAppNumber string             `bson:"whatsapp_number" json:"whatsappNumber"`
	Email          string             `bson:"email,omitempty" json:"email,omitempty"`
	IssueType      string             `bson:"issue_type" json:"issueType"` // 'spec_mismatch', 'shipping_delay', 'wood_defect', 'other'
	Description    string             `bson:"description" json:"description"`
	Status         string             `bson:"status" json:"status"` // 'open', 'investigating', 'resolved'
	ResolutionNote string             `bson:"resolution_note,omitempty" json:"resolutionNote,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"createdAt"`
	ResolvedAt     *time.Time         `bson:"resolved_at,omitempty" json:"resolvedAt,omitempty"`
}

// SecurityLog catatan audit aktivitas sistem
type SecurityLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	EventType  string             `bson:"event_type" json:"eventType"`
	IPOrSource string             `bson:"ip_or_source" json:"ipOrSource"`
	Details    string             `bson:"details" json:"details"`
	Severity   string             `bson:"severity" json:"severity"` // 'info', 'warning', 'danger'
	Timestamp  time.Time          `bson:"timestamp" json:"timestamp"`
}

// BackupSnapshot arsip cloud backup otomatis
type BackupSnapshot struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Filename       string             `bson:"filename" json:"filename"`
	TotalInquiries int                `bson:"total_inquiries" json:"totalInquiries"`
	TotalCustomers int                `bson:"total_customers" json:"totalCustomers"`
	TotalReports   int                `bson:"total_reports" json:"totalReports"`
	SizeKB         int64              `bson:"size_kb" json:"sizeKb"`
	Checksum       string             `bson:"checksum" json:"checksum"`
	AutoScheduled  bool               `bson:"auto_scheduled" json:"autoScheduled"`
	CreatedAt      time.Time          `bson:"created_at" json:"createdAt"`
}

// SystemHealth response status kesehatan sistem backend & database
type SystemHealth struct {
	Status        string         `json:"status"`
	App           string         `json:"app"`
	Version       string         `json:"version"`
	Engine        string         `json:"engine"` // "MongoDB Atlas M0 Free Tier" or "Local Embedded Resilient Engine"
	IsCloudLive   bool           `json:"isCloudLive"`
	DatabaseName  string         `json:"databaseName"`
	TotalInquiry  int64          `json:"totalInquiries"`
	TotalCustomer int64          `json:"totalCustomers"`
	Uptime        string         `json:"uptime"`
	Timestamp     time.Time      `json:"timestamp"`
}
