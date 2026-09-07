package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
)

// AddMilestoneHandler menambahkan dokumentasi progres produksi berfoto & kadar air (Modul 1)
func AddMilestoneHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	var milestone models.ProductionMilestone
	if err := c.BodyParser(&milestone); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format payload tahapan produksi tidak valid",
		})
	}

	if milestone.RecordedAt.IsZero() {
		milestone.RecordedAt = time.Now()
	}

	updated, err := config.Store.AddProductionMilestone(inquiryID, &milestone)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tahapan progres produksi berhasil didokumentasikan dan disinkronkan ke portal pemesan",
		"data":    updated,
	})
}

// UpdateSVLKHandler memperbarui sertifikat legalitas kayu SVLK / V-Legal (Modul 3)
func UpdateSVLKHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	var cert models.SVLKCertificate
	if err := c.BodyParser(&cert); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format payload sertifikat SVLK tidak valid",
		})
	}

	if cert.VerifiedDate == "" {
		cert.VerifiedDate = time.Now().Format("2006-01-02")
	}

	updated, err := config.Store.UpdateSVLKCertificate(inquiryID, &cert)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data sertifikasi legalitas SVLK berhasil diperbarui",
		"data":    updated,
	})
}

// UpdateShipmentHandler menerbitkan surat jalan kargo truk dan nomor resi (Modul 4)
// PENEGAKAN LOGIKA ANTI-KABUR: Pengiriman ditolak jika status pembayaran masih DP dan belum dilunasi 100%!
func UpdateShipmentHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	var waybill models.ShipmentWaybill
	if err := c.BodyParser(&waybill); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format payload surat jalan kargo tidak valid",
		})
	}

	updated, err := config.Store.UpdateShipmentWaybill(inquiryID, &waybill)
	if err != nil {
		// Mengembalikan error klausul anti-kabur jika belum lunas
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Surat jalan kargo truk dan nomor resi berhasil diterbitkan! Kayu resmi dalam perjalanan.",
		"data":    updated,
	})
}
