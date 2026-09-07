package handlers

import (
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateInquiryRequest payload request dari frontend
type CreateInquiryRequest struct {
	CustomerName   string `json:"customerName"`
	WhatsAppNumber string `json:"whatsappNumber"`
	City           string `json:"city"`
	Email          string `json:"email"`
	OrderType      string `json:"orderType"` // 'raw_wood' / 'custom_furniture'
	WoodTypeID     string `json:"woodTypeId"`
	WoodTypeName   string `json:"woodTypeName"`
	CategoryID     string `json:"categoryId"`
	CategoryName   string `json:"categoryName"`
	SizeEstimate   string `json:"sizeEstimate"`
	ReferenceNote  string `json:"referenceNote"`
	ReferenceImage string `json:"referenceImageUrl"`
	SessionNumber  string `json:"sessionNumber"`
}

// sanitizeInput membersihkan string dari tag HTML untuk mencegah XSS
func sanitizeInput(s string) string {
	r := strings.NewReplacer("<", "", ">", "", "\"", "&quot;", "'", "&#39;")
	return strings.TrimSpace(r.Replace(s))
}

// CreateInquiryHandler memproses order baru, mengecek nomor WA pelanggan, dan menghasilkan deep link WhatsApp
func CreateInquiryHandler(c *fiber.Ctx) error {
	var req CreateInquiryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format request tidak valid"})
	}

	req.CustomerName = sanitizeInput(req.CustomerName)
	req.City = sanitizeInput(req.City)
	req.Email = sanitizeInput(req.Email)
	req.SizeEstimate = sanitizeInput(req.SizeEstimate)
	req.ReferenceNote = sanitizeInput(req.ReferenceNote)
	req.WoodTypeName = sanitizeInput(req.WoodTypeName)
	req.CategoryName = sanitizeInput(req.CategoryName)

	if req.CustomerName == "" || req.WhatsAppNumber == "" || req.City == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama, No. WhatsApp, dan Kota wajib diisi"})
	}

	// Normalisasi nomor telepon
	reg := regexp.MustCompile(`[^0-9]`)
	cleanPhone := reg.ReplaceAllString(req.WhatsAppNumber, "")
	if len(cleanPhone) > 0 && cleanPhone[0] == '0' {
		cleanPhone = "62" + cleanPhone[1:]
	} else if len(cleanPhone) > 5 && !strings.HasPrefix(cleanPhone, "62") {
		cleanPhone = "62" + cleanPhone
	}

	now := time.Now()
	isRepeat := false
	repeatCount := 1

	// Cek apakah customer sudah pernah order sebelumnya via StorageEngine (PRD 6.3)
	existingCustomer, err := config.Store.GetCustomerByPhone(cleanPhone)
	var customerID primitive.ObjectID

	if err == nil && existingCustomer != nil {
		isRepeat = true
		repeatCount = existingCustomer.TotalOrders + 1
		existingCustomer.TotalOrders = repeatCount
		existingCustomer.IsLoyalCustomer = repeatCount >= 2
		existingCustomer.LastOrderAt = now
		existingCustomer.City = req.City
		if req.Email != "" {
			existingCustomer.Email = req.Email
		}
		customerID = existingCustomer.ID
		_ = config.Store.SaveCustomer(existingCustomer)
	} else {
		customerID = primitive.NewObjectID()
		newCust := &models.Customer{
			ID:              customerID,
			WhatsAppNumber:  cleanPhone,
			Name:            req.CustomerName,
			City:            req.City,
			Email:           req.Email,
			TotalOrders:     1,
			IsLoyalCustomer: false,
			FirstOrderAt:    now,
			LastOrderAt:     now,
		}
		_ = config.Store.SaveCustomer(newCust)
	}

	// Generate Nomor Inquiry unik
	dateTag := now.Format("20060102")
	seq := now.UnixNano() % 1000
	inquiryNumber := fmt.Sprintf("INQ-%s-%03d", dateTag, seq)

	woodOID, _ := primitive.ObjectIDFromHex(req.WoodTypeID)

	sessionNum := req.SessionNumber
	if sessionNum == "" {
		sessionNum = fmt.Sprintf("SES-%d-%04d", now.Unix(), seq)
	}

	inquiry := models.Inquiry{
		ID:               primitive.NewObjectID(),
		InquiryNumber:    inquiryNumber,
		CustomerID:       customerID,
		CustomerName:     req.CustomerName,
		WhatsAppNumber:   cleanPhone,
		City:             req.City,
		Email:            req.Email,
		OrderType:        req.OrderType,
		WoodTypeID:       woodOID,
		WoodTypeName:     req.WoodTypeName,
		CategoryID:       req.CategoryID,
		CategoryName:     req.CategoryName,
		SizeEstimate:     req.SizeEstimate,
		ReferenceNote:    req.ReferenceNote,
		ReferenceImage:   req.ReferenceImage,
		Status:           "new",
		IsRepeatCustomer: isRepeat,
		RepeatOrderCount: repeatCount,
		SessionNumber:    sessionNum,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	// Kunci ketersediaan stok kayu secara atomik (Anti-Race Condition saat lonjakan pembeli simultan)
	woodReservationMsg := "Pesanan dikonfirmasi dalam antrean workshop."
	if req.WoodTypeID != "" || req.WoodTypeName != "" {
		targetWoodKey := req.WoodTypeID
		if targetWoodKey == "" {
			targetWoodKey = req.WoodTypeName
		}

		isReserved, reserveMsg, w, _ := config.Store.ReserveWoodStockAtomic(targetWoodKey, 1, 0.5)
		woodReservationMsg = reserveMsg
		if isReserved && w != nil {
			// Siarkan sisa stok terbaru seketika ke seluruh pengunjung aktif
			GlobalBroker.Broadcast("WOOD_STOCK_UPDATED", w)
		} else if !isReserved {
			inquiry.Status = "pre_order"
		}
	}

	if err := config.Store.SaveInquiry(&inquiry); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan inquiry ke basis data"})
	}

	// Siarkan pesanan baru secara real-time ke konsol Atelier Pemilik
	GlobalBroker.Broadcast("NEW_INQUIRY", inquiry)

	// Log audit keamanan
	_ = config.Store.SaveSecurityLog(&models.SecurityLog{
		ID:         primitive.NewObjectID(),
		EventType:  "inquiry_created",
		IPOrSource: c.IP(),
		Details:    fmt.Sprintf("Pesanan %s (%s) dibuat oleh %s (%s). %s", inquiryNumber, inquiry.Status, req.CustomerName, cleanPhone, woodReservationMsg),
		Severity:   "info",
		Timestamp:  now,
	})

	// Format pesan WhatsApp terenkripsi aman
	orderTypeStr := "Kayu Mentah (Slab/Balok)"
	if req.OrderType == "custom_furniture" {
		orderTypeStr = "Custom Furniture Jadi"
	}

	waMessage := fmt.Sprintf("🌳 *PESANAN BARU — TOKO KAYU DELIN JAYA*\n\n"+
		"*No. Referensi:* %s\n"+
		"*No. Sesi:* %s\n"+
		"*Nama Pemesan:* %s\n"+
		"*No. WhatsApp:* %s\n"+
		"*Kota Tujuan:* %s\n\n"+
		"*Jenis Pesanan:* %s\n"+
		"*Jenis Kayu:* %s\n",
		inquiryNumber, sessionNum, req.CustomerName, cleanPhone, req.City, orderTypeStr, req.WoodTypeName)

	if req.OrderType == "custom_furniture" && req.CategoryName != "" {
		waMessage += fmt.Sprintf("*Kategori Produk:* %s\n", req.CategoryName)
	}

	waMessage += fmt.Sprintf("*Estimasi Dimensi:* %s\n*Catatan Khusus:* %s\n", req.SizeEstimate, req.ReferenceNote)

	if isRepeat {
		waMessage += fmt.Sprintf("\n⭐ *Status Pelanggan:* Pelanggan Setia (Pesanan ke-%d)\n", repeatCount)
	}

	waMessage += "\n_Pesan otomatis dari website resmi Toko Kayu Delin Jaya._"

	ownerWA := os.Getenv("OWNER_WHATSAPP")
	if ownerWA == "" {
		ownerWA = "6285891917286"
	}
	whatsappURL := fmt.Sprintf("https://wa.me/%s?text=%s", ownerWA, url.QueryEscape(waMessage))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success":          true,
		"inquiry":          inquiry,
		"isRepeatCustomer": isRepeat,
		"repeatOrderCount": repeatCount,
		"whatsappUrl":      whatsappURL,
		"reservationNote":  woodReservationMsg,
		"storageEngine":    config.Store.EngineName,
	})
}

// GetInquiriesHandler mengambil list pesanan dengan filter status
func GetInquiriesHandler(c *fiber.Ctx) error {
	status := c.Query("status", "all")
	inquiries, err := config.Store.GetInquiries(status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data pesanan"})
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"total":         len(inquiries),
		"storageEngine": config.Store.EngineName,
		"data":          inquiries,
	})
}

// UpdateInquiryStatusHandler memperbarui status inquiry ('new', 'processing', 'done', 'cancelled')
func UpdateInquiryStatusHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID pesanan wajib diisi"})
	}

	type StatusReq struct {
		Status string `json:"status"`
	}
	var req StatusReq
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Status baru wajib ditentukan"})
	}

	validStatuses := map[string]bool{"new": true, "processing": true, "done": true, "cancelled": true}
	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Status tidak valid (pilihan: new, processing, done, cancelled)"})
	}

	if err := config.Store.UpdateInquiryStatus(id, req.Status); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui status pesanan"})
	}

	_ = config.Store.SaveSecurityLog(&models.SecurityLog{
		ID:         primitive.NewObjectID(),
		EventType:  "inquiry_status_updated",
		IPOrSource: c.IP(),
		Details:    fmt.Sprintf("Pesanan %s diubah statusnya menjadi %s", id, req.Status),
		Severity:   "info",
		Timestamp:  time.Now(),
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Status pesanan %s berhasil diubah ke '%s'", id, req.Status),
	})
}
