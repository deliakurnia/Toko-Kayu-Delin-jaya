package config

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/widanasgpw4/kayu-nusantara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// StorageEngine interface seragam untuk operasi MongoDB maupun Local Store
type StorageEngine struct {
	IsCloudLive bool
	EngineName  string
	DatabaseName string
	MongoClient *mongo.Client
	MongoDb     *mongo.Database

	// Local In-Memory & File-backed Store
	mu           sync.RWMutex
	localFilePath string
	localData    LocalDatabase
}

// LocalDatabase struktur data berkas JSON lokal
type LocalDatabase struct {
	Woods        []models.WoodType          `json:"woods"`
	Categories   []models.ProductCategory   `json:"categories"`
	Customers    []models.Customer          `json:"customers"`
	Inquiries    []models.Inquiry           `json:"inquiries"`
	Reports      []models.OrderReport       `json:"reports"`
	Backups      []models.BackupSnapshot    `json:"backups"`
	SecurityLogs []models.SecurityLog       `json:"securityLogs"`
	StockLedgers []models.StockLedgerEntry  `json:"stockLedgers"`
	CashLedgers  []models.CashLedgerEntry   `json:"cashLedgers"`
}

var Store *StorageEngine
var StartTime time.Time

func init() {
	StartTime = time.Now()
}

// ConnectDB menginisialisasi engine penyimpanan ganda (MongoDB Atlas M0 atau Local Fallback)
func ConnectDB() (*StorageEngine, error) {
	engine := &StorageEngine{
		IsCloudLive:   false,
		EngineName:    "Local Embedded Resilient Engine",
		DatabaseName:  "kayu_nusantara",
		localFilePath: filepath.Join("data", "local_db.json"),
	}

	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "kayu_nusantara"
	}
	engine.DatabaseName = dbName

	// 1. Coba koneksi ke MongoDB Atlas jika URI disediakan
	if mongoURI != "" && mongoURI != "mongodb+srv://user:password@cluster0.mongodb.net/kayu_nusantara?retryWrites=true&w=majority" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		clientOptions := options.Client().
			ApplyURI(mongoURI).
			SetMaxPoolSize(10).
			SetMinPoolSize(2).
			SetMaxConnIdleTime(5 * time.Minute)

		client, err := mongo.Connect(ctx, clientOptions)
		if err == nil {
			if pingErr := client.Ping(ctx, readpref.Primary()); pingErr == nil {
				engine.IsCloudLive = true
				engine.EngineName = "MongoDB Atlas M0 Free Tier"
				engine.MongoClient = client
				engine.MongoDb = client.Database(dbName)
				log.Printf(" Terhubung sukses ke Cloud MongoDB Atlas [%s]", dbName)

				// Inisialisasi indeks unik
				engine.initIndexes(ctx)
			} else {
				log.Printf("⚠️ Ping MongoDB Atlas gagal (%v). Beralih ke Local Resilient Engine.", pingErr)
			}
		} else {
			log.Printf("⚠️ Koneksi MongoDB Atlas gagal (%v). Beralih ke Local Resilient Engine.", err)
		}
	} else {
		log.Println("ℹ️ MONGO_URI belum diatur atau masih default. Mengaktifkan Local Embedded Resilient Engine.")
	}

	// 2. Siapkan penyimpanan lokal (untuk fallback atau operasi hybrid)
	if err := engine.initLocalStorage(); err != nil {
		log.Printf("⚠️ Gagal memuat local storage: %v", err)
	}

	Store = engine
	return Store, nil
}

func (s *StorageEngine) initIndexes(ctx context.Context) {
	if !s.IsCloudLive || s.MongoDb == nil {
		return
	}

	// Unique index untuk nomor WhatsApp customer
	_, _ = s.MongoDb.Collection("customers").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "whatsapp_number", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	// Unique index untuk nomor Inquiry
	_, _ = s.MongoDb.Collection("inquiries").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "inquiry_number", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	// Index pencarian waktu untuk inquiries
	_, _ = s.MongoDb.Collection("inquiries").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "created_at", Value: -1}},
	})
}

// Inisialisasi berkas JSON lokal dengan data awal
func (s *StorageEngine) initLocalStorage() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	_ = os.MkdirAll(filepath.Dir(s.localFilePath), 0755)

	if _, err := os.Stat(s.localFilePath); os.IsNotExist(err) {
		// Isi data seed default
		now := time.Now()
		s.localData = LocalDatabase{
			Woods: []models.WoodType{
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Kayu Jati (Teak Wood)",
					BotanicalName:      "Tectona grandis",
					Slug:               "kayu-jati",
					Description:        "Raja kayu Nusantara dari hutan Perhutani Jawa. Kaya akan minyak alami yang membuatnya kebal terhadap rayap, jamur, dan cuaca tropis.",
					PriceRangeEstimate: "Rp 18.000.000 - Rp 35.000.000 / m³",
					Origin:             "Jawa Tengah & Jawa Timur (Hutan Perhutani)",
					TextureColorHex:    "#9e6738",
					Roughness:          0.65,
					Metalness:          0.05,
					IsActive:           true,
					StockStatus:        "ready",
					StockVolumeM3:      18.5,
					StockSlabsCount:    12,
					RestockEstimate:    "Siap Kirim (Gudang Jepara)",
					LastStockUpdate:    now,
					CreatedAt:          now,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Kayu Eboni Makassar",
					BotanicalName:      "Diospyros celebica",
					Slug:               "kayu-eboni",
					Description:        "Kayu mewah eksotis endemik Sulawesi. Memiliki serat dramatis corak hitam pekat dengan strip kemerahan cokelat tua.",
					PriceRangeEstimate: "Rp 65.000.000 - Rp 120.000.000 / m³",
					Origin:             "Sulawesi Tengah & Selatan",
					TextureColorHex:    "#2b1d14",
					Roughness:          0.45,
					Metalness:          0.10,
					IsActive:           true,
					StockStatus:        "low_stock",
					StockVolumeM3:      3.2,
					StockSlabsCount:    3,
					RestockEstimate:    "Sisa 3 Slab Utuh (Sulawesi)",
					LastStockUpdate:    now,
					CreatedAt:          now,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Kayu Sonokeling (Rosewood)",
					BotanicalName:      "Dalbergia latifolia",
					Slug:               "kayu-sonokeling",
					Description:        "Kayu eksotis dengan pola serat ungu kehitaman bertekstur sangat halus. Sangat populer untuk furniture mewah dan alat musik akustik.",
					PriceRangeEstimate: "Rp 32.000.000 - Rp 55.000.000 / m³",
					Origin:             "Jawa Tengah & Jawa Timur",
					TextureColorHex:    "#3d2b24",
					Roughness:          0.50,
					Metalness:          0.05,
					IsActive:           true,
					StockStatus:        "ready",
					StockVolumeM3:      9.0,
					StockSlabsCount:    8,
					RestockEstimate:    "Siap Kirim (Gudang Blora)",
					LastStockUpdate:    now,
					CreatedAt:          now,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Kayu Gaharu (Agarwood)",
					BotanicalName:      "Aquilaria malaccensis",
					Slug:               "kayu-gaharu",
					Description:        "Kayu beraroma surgawi dengan kandungan resin wangi khas. Simbol prestise tinggi untuk dupa mewah, ukiran pusaka, dan ornamen eksklusif.",
					PriceRangeEstimate: "Rp 80.000.000 - Rp 250.000.000 / kg (Grade Super)",
					Origin:             "Kalimantan & Sumatera",
					TextureColorHex:    "#4a3928",
					Roughness:          0.70,
					Metalness:          0.02,
					IsActive:           true,
					StockStatus:        "pre_order",
					StockVolumeM3:      1.5,
					StockSlabsCount:    2,
					RestockEstimate:    "Proses Oven Kiln-Dry (2–3 Minggu)",
					LastStockUpdate:    now,
					CreatedAt:          now,
				},
			},
			Categories: []models.ProductCategory{
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Meja Makan & Meja Kerja",
					Slug:               "meja",
					Description:        "Meja solid slab utuh tanpa sambungan atau desain ergonomis minimalis modern.",
					TypicalDimensions:  "180 x 90 x 75 cm / 240 x 100 x 75 cm",
					EstimatedCraftTime: "2-4 Minggu",
					IsActive:           true,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Lemari & Wardrobe",
					Slug:               "lemari",
					Description:        "Penyimpanan pakaian dan dokumen dengan sistem engsel soft-close dan konstruksi purus kokoh.",
					TypicalDimensions:  "120 x 60 x 200 cm",
					EstimatedCraftTime: "3-5 Minggu",
					IsActive:           true,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Buffet & Credenza TV",
					Slug:               "buffet",
					Description:        "Kabinet audio visual minimalis dengan kisi-kisi kayu estetik dan aksen kuningan.",
					TypicalDimensions:  "180 x 45 x 65 cm",
					EstimatedCraftTime: "2-3 Minggu",
					IsActive:           true,
				},
				{
					ID:                 primitive.NewObjectID(),
					Name:               "Bangku & Kursi Santai",
					Slug:               "bangku",
					Description:        "Kursi lounge santai berkontur alami kayu solid dengan bantalan linen premium.",
					TypicalDimensions:  "65 x 75 x 78 cm",
					EstimatedCraftTime: "1-2 Minggu",
					IsActive:           true,
				},
			},
			Customers: []models.Customer{
				{
					ID:              primitive.NewObjectID(),
					WhatsAppNumber:  "6281298765432",
					Name:            "Budi Hartono",
					City:            "Jakarta Selatan",
					Email:           "budi.hartono@example.com",
					TotalOrders:     3,
					IsLoyalCustomer: true,
					FirstOrderAt:    now.AddDate(0, -3, 0),
					LastOrderAt:     now.AddDate(0, 0, -10),
					Notes:           "Kolektor mebel jati tua, preferens solid slab tanpa dempul",
				},
				{
					ID:              primitive.NewObjectID(),
					WhatsAppNumber:  "6285712345678",
					Name:            "Siti Rahmawati",
					City:            "Surabaya",
					Email:           "siti.rahma@studioarsitek.id",
					TotalOrders:     2,
					IsLoyalCustomer: true,
					FirstOrderAt:    now.AddDate(0, -2, 0),
					LastOrderAt:     now.AddDate(0, 0, -20),
					Notes:           "Prinsipal Studio Arsitek, rutin order material kayu sonokeling untuk proyek villa",
				},
			},
			Inquiries:    []models.Inquiry{},
			Reports:      []models.OrderReport{},
			Backups:      []models.BackupSnapshot{},
			SecurityLogs: []models.SecurityLog{},
		}
		return s.flushLocalFileLocked()
	}

	// Baca berkas yang ada
	bytes, err := os.ReadFile(s.localFilePath)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, &s.localData)
}

func (s *StorageEngine) flushLocalFileLocked() error {
	data, err := json.MarshalIndent(s.localData, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.localFilePath, data, 0644)
}

// =========================================================================
// CUSTOMER OPERATIONS
// =========================================================================

func (s *StorageEngine) GetCustomerByPhone(phone string) (*models.Customer, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		var customer models.Customer
		err := s.MongoDb.Collection("customers").FindOne(ctx, bson.M{"whatsapp_number": phone}).Decode(&customer)
		if err == nil {
			return &customer, nil
		}
	}

	// Local fallback
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, c := range s.localData.Customers {
		if c.WhatsAppNumber == phone {
			return &c, nil
		}
	}
	return nil, fmt.Errorf("customer tidak ditemukan")
}

func (s *StorageEngine) SaveCustomer(c *models.Customer) error {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		opts := options.Update().SetUpsert(true)
		_, err := s.MongoDb.Collection("customers").UpdateOne(ctx, bson.M{"whatsapp_number": c.WhatsAppNumber}, bson.M{
			"$set": c,
		}, opts)
		if err != nil {
			log.Printf("⚠️ Gagal simpan customer ke MongoDB: %v", err)
		}
	}

	// Selalu perbarui local cache
	s.mu.Lock()
	defer s.mu.Unlock()
	found := false
	for i, item := range s.localData.Customers {
		if item.WhatsAppNumber == c.WhatsAppNumber {
			s.localData.Customers[i] = *c
			found = true
			break
		}
	}
	if !found {
		s.localData.Customers = append(s.localData.Customers, *c)
	}
	return s.flushLocalFileLocked()
}

func (s *StorageEngine) GetCustomers() ([]models.Customer, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("customers").Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "last_order_at", Value: -1}}))
		if err == nil {
			var list []models.Customer
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.Customers, nil
}

// =========================================================================
// INQUIRY OPERATIONS
// =========================================================================

func (s *StorageEngine) SaveInquiry(inq *models.Inquiry) error {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := s.MongoDb.Collection("inquiries").InsertOne(ctx, inq)
		if err != nil {
			log.Printf("⚠️ Gagal simpan inquiry ke MongoDB: %v", err)
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.localData.Inquiries = append([]models.Inquiry{*inq}, s.localData.Inquiries...)
	return s.flushLocalFileLocked()
}

func (s *StorageEngine) GetInquiries(status string) ([]models.Inquiry, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		filter := bson.M{}
		if status != "" && status != "all" {
			filter["status"] = status
		}

		findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(100)
		cursor, err := s.MongoDb.Collection("inquiries").Find(ctx, filter, findOptions)
		if err == nil {
			var list []models.Inquiry
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.Inquiry
	for _, item := range s.localData.Inquiries {
		if status == "" || status == "all" || item.Status == status {
			result = append(result, item)
		}
	}
	return result, nil
}

func (s *StorageEngine) UpdateInquiryStatus(idStr string, newStatus string) error {
	now := time.Now()
	oid, _ := primitive.ObjectIDFromHex(idStr)

	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		filter := bson.M{"$or": []bson.M{
			{"_id": oid},
			{"inquiry_number": idStr},
		}}
		_, _ = s.MongoDb.Collection("inquiries").UpdateOne(ctx, filter, bson.M{
			"$set": bson.M{
				"status":     newStatus,
				"updated_at": now,
			},
		})
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	for i, item := range s.localData.Inquiries {
		if item.ID.Hex() == idStr || item.InquiryNumber == idStr {
			s.localData.Inquiries[i].Status = newStatus
			s.localData.Inquiries[i].UpdatedAt = now
			break
		}
	}
	return s.flushLocalFileLocked()
}

// =========================================================================
// WOOD CATALOG & CATEGORIES OPERATIONS
// =========================================================================

func (s *StorageEngine) GetWoods() ([]models.WoodType, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("woods").Find(ctx, bson.M{"is_active": true})
		if err == nil {
			var list []models.WoodType
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				for i := range list {
					if list[i].StockStatus == "" {
						list[i].StockStatus = "ready"
						list[i].StockVolumeM3 = 10.0
						list[i].StockSlabsCount = 5
					}
				}
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	woods := make([]models.WoodType, len(s.localData.Woods))
	copy(woods, s.localData.Woods)
	for i := range woods {
		if woods[i].StockStatus == "" {
			woods[i].StockStatus = "ready"
			woods[i].StockVolumeM3 = 10.0
			woods[i].StockSlabsCount = 5
		}
	}
	return woods, nil
}

// CreateWood menambahkan spesimen kayu baru ke database dan local storage
func (s *StorageEngine) CreateWood(w *models.WoodType) (*models.WoodType, error) {
	now := time.Now()
	if w.ID.IsZero() {
		w.ID = primitive.NewObjectID()
	}
	if w.CreatedAt.IsZero() {
		w.CreatedAt = now
	}
	w.LastStockUpdate = now
	w.IsActive = true

	if w.StockStatus == "" {
		w.StockStatus = "ready"
	}
	if w.TextureColorHex == "" {
		w.TextureColorHex = "#8D6E63"
	}
	if w.Roughness == 0 {
		w.Roughness = 0.45
	}

	// Buat slug jika belum ada
	if w.Slug == "" {
		cleanName := strings.ToLower(strings.TrimSpace(w.Name))
		cleanName = strings.ReplaceAll(cleanName, "kayu ", "")
		var slugParts []string
		for _, part := range strings.Fields(cleanName) {
			cleanPart := strings.Map(func(r rune) rune {
				if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
					return r
				}
				return -1
			}, part)
			if cleanPart != "" {
				slugParts = append(slugParts, cleanPart)
			}
		}
		if len(slugParts) > 0 {
			w.Slug = strings.Join(slugParts, "-")
		} else {
			w.Slug = fmt.Sprintf("wood-%s", w.ID.Hex()[:6])
		}
	}

	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := s.MongoDb.Collection("woods").InsertOne(ctx, w)
		if err != nil {
			log.Printf("⚠️ Gagal insert spesimen kayu ke MongoDB Atlas: %v", err)
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.localData.Woods = append(s.localData.Woods, *w)
	if err := s.flushLocalFileLocked(); err != nil {
		return w, err
	}

	return w, nil
}

func (s *StorageEngine) UpdateWood(idStr string, w *models.WoodType) error {
	oid, _ := primitive.ObjectIDFromHex(idStr)

	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		_, _ = s.MongoDb.Collection("woods").UpdateOne(ctx, bson.M{"_id": oid}, bson.M{"$set": w})
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	for i, item := range s.localData.Woods {
		if item.ID.Hex() == idStr || item.Slug == idStr {
			s.localData.Woods[i] = *w
			break
		}
	}
	return s.flushLocalFileLocked()
}

// UpdateWoodStock memperbarui status stok kayu secara cepat dan thread-safe
func (s *StorageEngine) UpdateWoodStock(idStr string, req *models.WoodStockUpdateRequest) (*models.WoodType, error) {
	now := time.Now()
	oid, _ := primitive.ObjectIDFromHex(idStr)

	var updated *models.WoodType

	s.mu.Lock()
	defer s.mu.Unlock()
	for i, item := range s.localData.Woods {
		idLower := strings.ToLower(idStr)
		itemSlugLower := strings.ToLower(item.Slug)
		itemNameLower := strings.ToLower(item.Name)

		matched := item.ID.Hex() == idStr ||
			item.Slug == idStr ||
			item.Name == idStr ||
			strings.Contains(itemSlugLower, idLower) ||
			strings.Contains(idLower, itemSlugLower) ||
			strings.Contains(itemNameLower, idLower) ||
			(strings.HasSuffix(idStr, "0001") && strings.Contains(itemSlugLower, "jati")) ||
			(strings.HasSuffix(idStr, "0002") && strings.Contains(itemSlugLower, "eboni")) ||
			(strings.HasSuffix(idStr, "0003") && strings.Contains(itemSlugLower, "sonokeling")) ||
			(strings.HasSuffix(idStr, "0004") && strings.Contains(itemSlugLower, "gaharu"))

		if matched {
			if req.StockStatus != "" {
				s.localData.Woods[i].StockStatus = req.StockStatus
			}
			s.localData.Woods[i].StockVolumeM3 = req.StockVolumeM3
			s.localData.Woods[i].StockSlabsCount = req.StockSlabsCount
			if req.RestockEstimate != "" {
				s.localData.Woods[i].RestockEstimate = req.RestockEstimate
			}
			s.localData.Woods[i].LastStockUpdate = now
			copyWood := s.localData.Woods[i]
			updated = &copyWood
			break
		}
	}

	if s.IsCloudLive && s.MongoDb != nil && updated != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		updateFields := bson.M{
			"stock_status":      updated.StockStatus,
			"stock_volume_m3":   updated.StockVolumeM3,
			"stock_slabs_count": updated.StockSlabsCount,
			"restock_estimate":  updated.RestockEstimate,
			"last_stock_update": updated.LastStockUpdate,
		}
		_, _ = s.MongoDb.Collection("woods").UpdateOne(ctx, bson.M{"$or": []bson.M{{"_id": oid}, {"slug": updated.Slug}}}, bson.M{"$set": updateFields})
	}

	if err := s.flushLocalFileLocked(); err != nil {
		return updated, err
	}
	return updated, nil
}

// UpdateWoodImages memperbarui URL foto spesimen kayu (replace foto utama atau tambah ke galeri)
func (s *StorageEngine) UpdateWoodImages(idStr string, newImageUrl string, isReplace bool) (*models.WoodType, string, error) {
	now := time.Now()
	oid, _ := primitive.ObjectIDFromHex(idStr)

	var updated *models.WoodType
	var oldLocalPhotoPath string

	s.mu.Lock()
	defer s.mu.Unlock()
	for i, item := range s.localData.Woods {
		idLower := strings.ToLower(idStr)
		itemSlugLower := strings.ToLower(item.Slug)
		itemNameLower := strings.ToLower(item.Name)

		matched := item.ID.Hex() == idStr ||
			item.Slug == idStr ||
			item.Name == idStr ||
			strings.Contains(itemSlugLower, idLower) ||
			strings.Contains(idLower, itemSlugLower) ||
			strings.Contains(itemNameLower, idLower) ||
			(strings.HasSuffix(idStr, "0001") && strings.Contains(itemSlugLower, "jati")) ||
			(strings.HasSuffix(idStr, "0002") && strings.Contains(itemSlugLower, "eboni")) ||
			(strings.HasSuffix(idStr, "0003") && strings.Contains(itemSlugLower, "sonokeling")) ||
			(strings.HasSuffix(idStr, "0004") && strings.Contains(itemSlugLower, "gaharu"))

		if matched {
			var newImages []string
			if isReplace {
				if len(item.Images) > 0 {
					firstImg := item.Images[0]
					if strings.HasPrefix(firstImg, "/uploads/woods/") {
						oldLocalPhotoPath = "." + firstImg
					}
					// Ganti foto pertama, pertahankan sisa galeri jika ada
					newImages = append([]string{newImageUrl}, item.Images[1:]...)
				} else {
					newImages = []string{newImageUrl}
				}
			} else {
				newImages = append(item.Images, newImageUrl)
			}

			s.localData.Woods[i].Images = newImages
			s.localData.Woods[i].LastStockUpdate = now
			copyWood := s.localData.Woods[i]
			updated = &copyWood
			break
		}
	}

	if s.IsCloudLive && s.MongoDb != nil && updated != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		updateFields := bson.M{
			"images":            updated.Images,
			"last_stock_update": updated.LastStockUpdate,
		}
		_, _ = s.MongoDb.Collection("woods").UpdateOne(ctx, bson.M{"$or": []bson.M{{"_id": oid}, {"slug": updated.Slug}}}, bson.M{"$set": updateFields})
	}

	if err := s.flushLocalFileLocked(); err != nil {
		return updated, oldLocalPhotoPath, err
	}
	return updated, oldLocalPhotoPath, nil
}

func (s *StorageEngine) GetCategories() ([]models.ProductCategory, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("categories").Find(ctx, bson.M{"is_active": true})
		if err == nil {
			var list []models.ProductCategory
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.Categories, nil
}

// =========================================================================
// ORDER REPORTS & COMPLAINTS
// =========================================================================

func (s *StorageEngine) SaveReport(r *models.OrderReport) error {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		_, _ = s.MongoDb.Collection("reports").InsertOne(ctx, r)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.localData.Reports = append([]models.OrderReport{*r}, s.localData.Reports...)
	return s.flushLocalFileLocked()
}

func (s *StorageEngine) GetReports() ([]models.OrderReport, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("reports").Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
		if err == nil {
			var list []models.OrderReport
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.Reports, nil
}

func (s *StorageEngine) UpdateReportStatus(idStr string, status string, resolution string) error {
	now := time.Now()
	oid, _ := primitive.ObjectIDFromHex(idStr)

	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		update := bson.M{
			"status": status,
		}
		if resolution != "" {
			update["resolution_note"] = resolution
		}
		if status == "resolved" {
			update["resolved_at"] = now
		}

		_, _ = s.MongoDb.Collection("reports").UpdateOne(ctx, bson.M{
			"$or": []bson.M{{"_id": oid}, {"report_number": idStr}},
		}, bson.M{"$set": update})
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	for i, item := range s.localData.Reports {
		if item.ID.Hex() == idStr || item.ReportNumber == idStr {
			s.localData.Reports[i].Status = status
			if resolution != "" {
				s.localData.Reports[i].ResolutionNote = resolution
			}
			if status == "resolved" {
				s.localData.Reports[i].ResolvedAt = &now
			}
			break
		}
	}
	return s.flushLocalFileLocked()
}

// =========================================================================
// BACKUP & SECURITY LOGS
// =========================================================================

func (s *StorageEngine) SaveBackup(b *models.BackupSnapshot) error {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		_, _ = s.MongoDb.Collection("backups").InsertOne(ctx, b)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.localData.Backups = append([]models.BackupSnapshot{*b}, s.localData.Backups...)
	return s.flushLocalFileLocked()
}

func (s *StorageEngine) GetBackups() ([]models.BackupSnapshot, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("backups").Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
		if err == nil {
			var list []models.BackupSnapshot
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.Backups, nil
}

func (s *StorageEngine) SaveSecurityLog(l *models.SecurityLog) error {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		_, _ = s.MongoDb.Collection("security_logs").InsertOne(ctx, l)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.localData.SecurityLogs = append([]models.SecurityLog{*l}, s.localData.SecurityLogs...)
	if len(s.localData.SecurityLogs) > 200 {
		s.localData.SecurityLogs = s.localData.SecurityLogs[:200]
	}
	return s.flushLocalFileLocked()
}

func (s *StorageEngine) GetSecurityLogs() ([]models.SecurityLog, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		cursor, err := s.MongoDb.Collection("security_logs").Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(50))
		if err == nil {
			var list []models.SecurityLog
			if err := cursor.All(ctx, &list); err == nil && len(list) > 0 {
				return list, nil
			}
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.SecurityLogs, nil
}

// GetMetrics menghitung total inquiries dan customers secara real-time
func (s *StorageEngine) GetMetrics() (int64, int64, error) {
	if s.IsCloudLive && s.MongoDb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		inqCount, err1 := s.MongoDb.Collection("inquiries").CountDocuments(ctx, bson.M{})
		custCount, err2 := s.MongoDb.Collection("customers").CountDocuments(ctx, bson.M{})
		if err1 == nil && err2 == nil {
			return inqCount, custCount, nil
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	return int64(len(s.localData.Inquiries)), int64(len(s.localData.Customers)), nil
}

// ReserveWoodStockAtomic mengamankan stok kayu secara atomik saat terjadi lonjakan pembelian simultan
// Mencegah race-condition (rebutan stok) jika 2 pengguna menekan checkout di milidetik yang sama
func (s *StorageEngine) ReserveWoodStockAtomic(woodID string, slabsToDeduct int, volumeToDeduct float64) (bool, string, *models.WoodType, error) {
	if slabsToDeduct <= 0 {
		slabsToDeduct = 1
	}
	if volumeToDeduct <= 0 {
		volumeToDeduct = 0.5
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var targetWood *models.WoodType
	targetIdx := -1

	// Cari spesimen kayu berdasarkan Hex ID atau Slug
	cleanID := strings.TrimSpace(woodID)
	for i, w := range s.localData.Woods {
		if w.ID.Hex() == cleanID || w.Slug == cleanID {
			targetWood = &s.localData.Woods[i]
			targetIdx = i
			break
		}
	}

	if targetWood == nil {
		return false, "Spesimen kayu tidak ditemukan dalam katalog", nil, fmt.Errorf("wood not found")
	}

	// Periksa ketersediaan stok fisik
	if targetWood.StockStatus == "out_of_stock" || targetWood.StockSlabsCount < slabsToDeduct {
		return false, fmt.Sprintf("Stok fisik '%s' tidak mencukupi (Tersedia: %d slab). Pesanan dialihkan ke status Inden/Pre-Order.", targetWood.Name, targetWood.StockSlabsCount), targetWood, nil
	}

	// Eksekusi pemotongan stok secara atomik
	targetWood.StockSlabsCount -= slabsToDeduct
	targetWood.StockVolumeM3 -= volumeToDeduct
	if targetWood.StockVolumeM3 < 0 {
		targetWood.StockVolumeM3 = 0
	}

	now := time.Now()
	targetWood.LastStockUpdate = now

	// Jika stok habis setelah pemesanan ini, ubah status secara otomatis
	if targetWood.StockSlabsCount <= 0 || targetWood.StockVolumeM3 <= 0 {
		targetWood.StockStatus = "out_of_stock"
		targetWood.RestockEstimate = "Habis Terpesan (Inden Penebangan)"
	} else if targetWood.StockSlabsCount <= 2 {
		targetWood.StockStatus = "low_stock"
	}

	// Update slice lokal
	s.localData.Woods[targetIdx] = *targetWood
	_ = s.flushLocalFileLocked()

	// Update MongoDB Atlas jika aktif
	if s.IsCloudLive && s.MongoDb != nil {
		go func(w models.WoodType) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			filter := bson.M{"_id": w.ID}
			update := bson.M{
				"$set": bson.M{
					"stockStatus":     w.StockStatus,
					"stockVolumeM3":   w.StockVolumeM3,
					"stockSlabsCount": w.StockSlabsCount,
					"restockEstimate": w.RestockEstimate,
					"lastStockUpdate": w.LastStockUpdate,
				},
			}
			_, _ = s.MongoDb.Collection("woods").UpdateOne(ctx, filter, update)
		}(*targetWood)
	}

	// Invalidate RAM cache agar semua klien pembaca seketika mendapat data terbaru
	InvalidateWoodsCache()

	msg := fmt.Sprintf("Stok '%s' berhasil diamankan secara atomik. Sisa: %d slab (%.1f m³).", targetWood.Name, targetWood.StockSlabsCount, targetWood.StockVolumeM3)
	return true, msg, targetWood, nil
}

// =========================================================================
// INTERCONNECTED BUSINESS & FINANCIAL MODULES
// =========================================================================

// GetInquiryByID mencari inquiry berdasarkan MongoDB ObjectID atau InquiryNumber / SessionNumber
func (s *StorageEngine) GetInquiryByID(idStr string) (*models.Inquiry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cleanID := strings.TrimSpace(idStr)
	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			item := s.localData.Inquiries[i]
			return &item, nil
		}
	}
	return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
}

// SaveQuotation menyimpan kalkulasi penawaran resmi (Modul 2)
func (s *StorageEngine) SaveQuotation(idStr string, quote *models.CostBreakdown) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()
	if quote.QuotedAt.IsZero() {
		quote.QuotedAt = now
	}

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			s.localData.Inquiries[i].Quotation = quote
			s.localData.Inquiries[i].UpdatedAt = now
			s.localData.Inquiries[i].Status = "awaiting_payment"

			// Otomatis siapkan kalkulasi PaymentRecord awal jika belum ada
			if s.localData.Inquiries[i].PaymentRecord == nil {
				dpNominal := quote.FinalPrice * 0.5
				remNominal := quote.FinalPrice - dpNominal
				s.localData.Inquiries[i].PaymentRecord = &models.PaymentRecord{
					ID:              fmt.Sprintf("PAY-%s", inq.InquiryNumber),
					InquiryID:       inq.ID.Hex(),
					InquiryNumber:   inq.InquiryNumber,
					PaymentPlan:     "dp_50",
					Method:          "qris",
					TotalAmount:     quote.FinalPrice,
					DpAmount:        dpNominal,
					RemainingAmount: remNominal,
					Status:          "pending",
					UniqueCode:      100 + (len(s.localData.Inquiries) % 899),
				}
			} else {
				s.localData.Inquiries[i].PaymentRecord.TotalAmount = quote.FinalPrice
				s.localData.Inquiries[i].PaymentRecord.DpAmount = quote.FinalPrice * 0.5
				s.localData.Inquiries[i].PaymentRecord.RemainingAmount = quote.FinalPrice - s.localData.Inquiries[i].PaymentRecord.DpAmount
			}

			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// SavePaymentRecord menyimpan pemilihan metode bayar (QRIS/VA) & skema DP/Lunas beserta janji pelunasan
func (s *StorageEngine) SavePaymentRecord(idStr string, p *models.PaymentRecord) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			if p.ID == "" {
				p.ID = fmt.Sprintf("PAY-%s", inq.InquiryNumber)
			}
			p.InquiryID = inq.ID.Hex()
			p.InquiryNumber = inq.InquiryNumber

			// Hitung ulang nominal DP & sisa
			if p.PaymentPlan == "full" {
				p.DpAmount = p.TotalAmount
				p.RemainingAmount = 0
			} else {
				p.DpAmount = p.TotalAmount * 0.5
				p.RemainingAmount = p.TotalAmount - p.DpAmount
			}

			s.localData.Inquiries[i].PaymentRecord = p
			s.localData.Inquiries[i].UpdatedAt = now
			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// VerifyPayment memverifikasi pembayaran (baik DP 50% maupun Pelunasan 100%)
func (s *StorageEngine) VerifyPayment(idStr string, isSettlement bool) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			if inq.PaymentRecord == nil {
				return nil, fmt.Errorf("pesanan '%s' belum memiliki rincian tagihan pembayaran", idStr)
			}

			record := s.localData.Inquiries[i].PaymentRecord
			record.VerifiedByOwner = true
			record.VerifiedAt = &now

			if isSettlement || record.PaymentPlan == "full" {
				record.IsSettled = true
				record.SettledAt = &now
				record.Status = "settled"
				record.RemainingAmount = 0
				s.localData.Inquiries[i].Status = "ready_to_ship"

				// Catat ke Buku Kas Masuk
				settleAmount := record.RemainingAmount
				if settleAmount == 0 {
					settleAmount = record.TotalAmount
				}
				s.localData.CashLedgers = append([]models.CashLedgerEntry{{
					ID:            fmt.Sprintf("CSH-%d", time.Now().UnixNano()),
					InquiryNumber: inq.InquiryNumber,
					Type:          "income_settlement",
					Amount:        settleAmount,
					Description:   fmt.Sprintf("Pelunasan 100%% Pesanan %s (%s) - Barang Siap Kirim", inq.InquiryNumber, inq.CustomerName),
					Timestamp:     now,
				}}, s.localData.CashLedgers...)

			} else {
				// Pembayaran DP 50%
				record.IsDpPaid = true
				record.DpPaidAt = &now
				record.Status = "dp_paid"
				s.localData.Inquiries[i].Status = "dp_paid"

				// Catat ke Buku Kas Masuk
				s.localData.CashLedgers = append([]models.CashLedgerEntry{{
					ID:            fmt.Sprintf("CSH-%d", time.Now().UnixNano()),
					InquiryNumber: inq.InquiryNumber,
					Type:          "income_dp",
					Amount:        record.DpAmount,
					Description:   fmt.Sprintf("Penerimaan DP 50%% Pesanan %s (%s) - Target Pelunasan: %s", inq.InquiryNumber, inq.CustomerName, record.SettlementDueDate),
					Timestamp:     now,
				}}, s.localData.CashLedgers...)
			}

			s.localData.Inquiries[i].UpdatedAt = now
			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// AddProductionMilestone menambahkan tahapan produksi berfoto & kadar air MC% (Modul 1)
func (s *StorageEngine) AddProductionMilestone(idStr string, m *models.ProductionMilestone) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()

	if m.ID == "" {
		m.ID = fmt.Sprintf("MLS-%d", time.Now().UnixNano())
	}
	if m.RecordedAt.IsZero() {
		m.RecordedAt = now
	}

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			m.InquiryID = inq.ID.Hex()
			s.localData.Inquiries[i].ProductionMilestones = append(s.localData.Inquiries[i].ProductionMilestones, *m)
			s.localData.Inquiries[i].UpdatedAt = now
			if s.localData.Inquiries[i].Status == "dp_paid" || s.localData.Inquiries[i].Status == "new" {
				s.localData.Inquiries[i].Status = "in_production"
			}

			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// UpdateSVLKCertificate memperbarui sertifikat legalitas kayu (Modul 3)
func (s *StorageEngine) UpdateSVLKCertificate(idStr string, cert *models.SVLKCertificate) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			s.localData.Inquiries[i].SVLKCertificate = cert
			s.localData.Inquiries[i].UpdatedAt = now
			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// UpdateShipmentWaybill memperbarui surat jalan kargo truk & resi (Modul 4)
// KLAUSUL ANTI-KABUR WAJIB: Barang tidak boleh dikirim jika masih DP dan belum lunas 100%!
func (s *StorageEngine) UpdateShipmentWaybill(idStr string, waybill *models.ShipmentWaybill) (*models.Inquiry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var updated *models.Inquiry
	cleanID := strings.TrimSpace(idStr)
	now := time.Now()

	for i, inq := range s.localData.Inquiries {
		if inq.ID.Hex() == cleanID || inq.InquiryNumber == cleanID || inq.SessionNumber == cleanID {
			// VALIDASI LOGIKA ANTI-KABUR
			if inq.PaymentRecord != nil {
				if inq.PaymentRecord.PaymentPlan == "dp_50" && !inq.PaymentRecord.IsSettled {
					return nil, fmt.Errorf("PENGIRIMAN DITOLAK: Pesanan %s masih berstatus DP (Belum Lunas). Sesuai klausul Anti-Kabur Atelier, kayu aman tersimpan di workshop dan hanya dapat dimuat ke truk setelah sisa tagihan Rp %.0f dilunasi.", inq.InquiryNumber, inq.PaymentRecord.RemainingAmount)
				}
			}

			if waybill.ShippedAt == nil {
				waybill.ShippedAt = &now
			}
			waybill.InquiryID = inq.ID.Hex()

			s.localData.Inquiries[i].ShipmentWaybill = waybill
			s.localData.Inquiries[i].Status = "shipped"
			s.localData.Inquiries[i].UpdatedAt = now

			// Catat mutasi pengeluaran stok kayu
			s.localData.StockLedgers = append([]models.StockLedgerEntry{{
				ID:          fmt.Sprintf("STK-%d", time.Now().UnixNano()),
				WoodID:      inq.WoodTypeID.Hex(),
				WoodName:    inq.WoodTypeName,
				Type:        "outflow",
				VolumeM3:    0.5,
				SlabsCount:  1,
				ReferenceID: waybill.WaybillNumber,
				Description: fmt.Sprintf("Pengiriman Kargo Truk Resi %s (%s) ke %s", waybill.WaybillNumber, waybill.CarrierName, inq.City),
				Timestamp:   now,
			}}, s.localData.StockLedgers...)

			item := s.localData.Inquiries[i]
			updated = &item
			break
		}
	}

	if updated == nil {
		return nil, fmt.Errorf("inquiry '%s' tidak ditemukan", idStr)
	}

	_ = s.flushLocalFileLocked()
	return updated, nil
}

// GetLedgers mengambil data buku kas dan mutasi stok
func (s *StorageEngine) GetLedgers() ([]models.StockLedgerEntry, []models.CashLedgerEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.localData.StockLedgers, s.localData.CashLedgers, nil
}

