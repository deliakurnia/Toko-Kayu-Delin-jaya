package handlers

import (
	"regexp"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
)

// GetCustomersHandler mengambil seluruh data pelanggan untuk rekap admin
func GetCustomersHandler(c *fiber.Ctx) error {
	customers, err := config.Store.GetCustomers()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data pelanggan"})
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"total":         len(customers),
		"storageEngine": config.Store.EngineName,
		"data":          customers,
	})
}

// GetCustomerByPhoneHandler memeriksa profil pelanggan berdasarkan nomor WhatsApp (Repeat Customer Detection)
func GetCustomerByPhoneHandler(c *fiber.Ctx) error {
	phone := c.Params("phone")
	if phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nomor WhatsApp wajib diisi"})
	}

	reg := regexp.MustCompile(`[^0-9]`)
	cleanPhone := reg.ReplaceAllString(phone, "")
	if len(cleanPhone) > 0 && cleanPhone[0] == '0' {
		cleanPhone = "62" + cleanPhone[1:]
	}

	customer, err := config.Store.GetCustomerByPhone(cleanPhone)
	if err != nil || customer == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"found":   false,
			"message": "Pelanggan baru (belum memiliki riwayat pesanan sebelumnya)",
		})
	}

	return c.JSON(fiber.Map{
		"success":          true,
		"found":            true,
		"customer":         customer,
		"isRepeatCustomer": customer.TotalOrders >= 1,
		"totalOrders":      customer.TotalOrders,
	})
}
