package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateReportRequest payload laporan kendala dari pelanggan
type CreateReportRequest struct {
	InquiryNumber  string `json:"inquiryNumber"`
	SessionNumber  string `json:"sessionNumber"`
	CustomerName   string `json:"customerName"`
	WhatsAppNumber string `json:"whatsappNumber"`
	Email          string `json:"email"`
	IssueType      string `json:"issueType"`
	Description    string `json:"description"`
}

// CreateReportHandler menerima dan mencatat laporan kendala baru
func CreateReportHandler(c *fiber.Ctx) error {
	var req CreateReportRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format request tidak valid"})
	}

	req.CustomerName = sanitizeInput(req.CustomerName)
	req.Description = sanitizeInput(req.Description)

	if req.CustomerName == "" || req.WhatsAppNumber == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama, No. WhatsApp, dan Deskripsi kendala wajib diisi"})
	}

	now := time.Now()
	dateTag := now.Format("20060102")
	seq := now.UnixNano() % 1000
	reportNumber := fmt.Sprintf("RPT-%s-%03d", dateTag, seq)

	report := models.OrderReport{
		ID:             primitive.NewObjectID(),
		ReportNumber:   reportNumber,
		InquiryNumber:  req.InquiryNumber,
		SessionNumber:  req.SessionNumber,
		CustomerName:   req.CustomerName,
		WhatsAppNumber: req.WhatsAppNumber,
		Email:          req.Email,
		IssueType:      req.IssueType,
		Description:    req.Description,
		Status:         "open",
		CreatedAt:      now,
	}

	if err := config.Store.SaveReport(&report); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan laporan kendala"})
	}

	_ = config.Store.SaveSecurityLog(&models.SecurityLog{
		ID:         primitive.NewObjectID(),
		EventType:  "order_report_filed",
		IPOrSource: c.IP(),
		Details:    fmt.Sprintf("Laporan kendala %s dibuat untuk pesanan %s oleh %s", reportNumber, req.InquiryNumber, req.CustomerName),
		Severity:   "warning",
		Timestamp:  now,
	})

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Laporan kendala berhasil dicatat dan diteruskan ke tim workshop",
		"report":  report,
	})
}

// GetReportsHandler mengembalikan daftar semua laporan kendala
func GetReportsHandler(c *fiber.Ctx) error {
	reports, err := config.Store.GetReports()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil laporan kendala"})
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"total":         len(reports),
		"storageEngine": config.Store.EngineName,
		"data":          reports,
	})
}

// UpdateReportStatusHandler memperbarui status penanganan laporan
func UpdateReportStatusHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID laporan wajib diisi"})
	}

	type UpdateReq struct {
		Status         string `json:"status"`
		ResolutionNote string `json:"resolutionNote"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format update tidak valid"})
	}

	req.ResolutionNote = sanitizeInput(req.ResolutionNote)

	if err := config.Store.UpdateReportStatus(id, req.Status, req.ResolutionNote); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui laporan kendala"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status laporan berhasil diperbarui",
	})
}
