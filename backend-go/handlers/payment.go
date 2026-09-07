package handlers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
)

// SaveQuotationHandler membuat atau memperbarui penawaran harga resmi (Modul 2)
func SaveQuotationHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	var quote models.CostBreakdown
	if err := c.BodyParser(&quote); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format payload penawaran tidak valid",
		})
	}

	if quote.FinalPrice <= 0 {
		quote.FinalPrice = quote.RawWoodCost + quote.KilnDryCost + quote.CraftsmanshipCost + quote.FinishingCost + quote.ShippingCost
	}
	quote.QuotedAt = time.Now()

	updated, err := config.Store.SaveQuotation(inquiryID, &quote)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Penawaran harga resmi berhasil disimpan dan siap ditagihkan ke pelanggan",
		"data":    updated,
	})
}

// SavePaymentIntentHandler menyimpan pemilihan skema bayar (DP 50% vs Lunas 100%) dan metode (QRIS/VA)
func SavePaymentIntentHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	var payment models.PaymentRecord
	if err := c.BodyParser(&payment); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format payload pembayaran tidak valid",
		})
	}

	// Validasi Klausul Anti-Kabur
	if payment.PaymentPlan == "dp_50" && strings.TrimSpace(payment.SettlementDueDate) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Untuk skema Down Payment (DP 50%), wajib memilih Target Tanggal Pelunasan sebelum pengiriman.",
		})
	}

	updated, err := config.Store.SavePaymentRecord(inquiryID, &payment)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tagihan pembayaran berhasil dipersiapkan",
		"data":    updated,
	})
}

// VerifyPaymentHandler memverifikasi pembayaran DP atau Pelunasan
func VerifyPaymentHandler(c *fiber.Ctx) error {
	inquiryID := c.Params("id")
	if inquiryID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID atau Nomor Inquiry wajib diisi",
		})
	}

	type VerifyReq struct {
		IsSettlement bool `json:"isSettlement"`
	}
	var req VerifyReq
	_ = c.BodyParser(&req)

	updated, err := config.Store.VerifyPayment(inquiryID, req.IsSettlement)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	statusMsg := "DP 50% berhasil diverifikasi. Pesanan masuk antrean pengerjaan workshop."
	if req.IsSettlement || updated.PaymentRecord.IsSettled {
		statusMsg = "Pelunasan 100% lunas terverifikasi! Kayu siap dimuat ke kargo truk pengiriman."
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": statusMsg,
		"data":    updated,
	})
}

// MidtransWebhookHandler menerima notifikasi HTTP webhook dari Midtrans Sandbox/Production
func MidtransWebhookHandler(c *fiber.Ctx) error {
	type MidtransPayload struct {
		OrderID           string `json:"order_id"`
		TransactionStatus string `json:"transaction_status"`
		FraudStatus       string `json:"fraud_status"`
		PaymentType       string `json:"payment_type"`
		GrossAmount       string `json:"gross_amount"`
	}

	var payload MidtransPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Payload webhook tidak valid",
		})
	}

	// Midtrans status: "settlement" atau "capture" (jika credit card & fraud status accept)
	isSuccess := payload.TransactionStatus == "settlement" ||
		(payload.TransactionStatus == "capture" && payload.FraudStatus == "accept")

	if isSuccess && payload.OrderID != "" {
		// Ekstrak nomor inquiry dari order_id (format: INQ-xxx atau INQ-xxx-DP / INQ-xxx-FULL)
		cleanInquiry := payload.OrderID
		isSettlement := strings.Contains(cleanInquiry, "-FULL") || strings.Contains(cleanInquiry, "-SETTLE")
		cleanInquiry = strings.ReplaceAll(cleanInquiry, "-DP", "")
		cleanInquiry = strings.ReplaceAll(cleanInquiry, "-FULL", "")
		cleanInquiry = strings.ReplaceAll(cleanInquiry, "-SETTLE", "")

		_, err := config.Store.VerifyPayment(cleanInquiry, isSettlement)
		if err != nil {
			return c.Status(fiber.StatusOK).JSON(fiber.Map{
				"status":  "received_with_note",
				"warning": err.Error(),
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "ok",
		"message": "Webhook Midtrans berhasil diproses",
	})
}

// GetLedgersHandler mengambil buku kas dan mutasi stok
func GetLedgersHandler(c *fiber.Ctx) error {
	stock, cash, err := config.Store.GetLedgers()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success":      true,
		"stockLedgers": stock,
		"cashLedgers":  cash,
	})
}
