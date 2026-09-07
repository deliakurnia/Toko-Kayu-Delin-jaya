package handlers

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// normalizePhone membersihkan nomor WhatsApp dan mengubah awalan 08 / 8 ke 62
func normalizePhone(phone string) string {
	reg := regexp.MustCompile(`[^0-9]`)
	clean := reg.ReplaceAllString(phone, "")
	if strings.HasPrefix(clean, "0") {
		clean = "62" + clean[1:]
	} else if strings.HasPrefix(clean, "8") {
		clean = "62" + clean
	}
	return clean
}

// RegisterUserHandler mendaftarkan akun pemesan baru ke MongoDB Atlas & Local Store
func RegisterUserHandler(c *fiber.Ctx) error {
	var req models.RegisterUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format data request tidak valid",
		})
	}

	cleanName := sanitizeInput(req.Name)
	cleanEmail := strings.ToLower(sanitizeInput(req.Email))
	cleanCity := sanitizeInput(req.City)
	cleanAddress := sanitizeInput(req.Address)
	cleanPhone := normalizePhone(req.WhatsAppNumber)

	if len(cleanName) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Nama lengkap pemesan wajib diisi minimal 2 karakter",
		})
	}
	if !strings.Contains(cleanEmail, "@") || !strings.Contains(cleanEmail, ".") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Alamat email aktif tidak valid. Wajib cantumkan email aktif untuk penerbitan dokumen SPK resmi.",
		})
	}
	if len(cleanPhone) < 9 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Nomor WhatsApp aktif tidak valid. Wajib nomor Indonesia (contoh: 0812...)",
		})
	}
	if cleanCity == "" {
		cleanCity = "Indonesia"
	}

	now := time.Now()

	// Cek apakah akun sudah ada
	existing, _ := config.Store.GetUserByIdentifier(cleanPhone)
	if existing == nil {
		existing, _ = config.Store.GetUserByIdentifier(cleanEmail)
	}

	var user models.UserAccount
	if existing != nil {
		user = *existing
		user.Name = cleanName
		user.Email = cleanEmail
		user.WhatsAppNumber = cleanPhone
		user.City = cleanCity
		if cleanAddress != "" {
			user.Address = cleanAddress
		}
		user.LastLoginAt = now
	} else {
		user = models.UserAccount{
			ID:             primitive.NewObjectID(),
			Name:           cleanName,
			WhatsAppNumber: cleanPhone,
			Email:          cleanEmail,
			City:           cleanCity,
			Address:        cleanAddress,
			Role:           "customer",
			CreatedAt:      now,
			LastLoginAt:    now,
		}
	}

	if err := config.Store.SaveUser(&user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Gagal menyimpan akun pengguna ke basis data",
		})
	}

	// Sinkronkan juga ke koleksi customers untuk CRM & repeat customer detection
	_ = config.Store.SaveCustomer(&models.Customer{
		ID:              user.ID,
		WhatsAppNumber:  cleanPhone,
		Name:            cleanName,
		City:            cleanCity,
		Email:           cleanEmail,
		TotalOrders:     0,
		IsLoyalCustomer: false,
		FirstOrderAt:    now,
		LastOrderAt:     now,
	})

	_ = config.Store.SaveSecurityLog(&models.SecurityLog{
		ID:         primitive.NewObjectID(),
		EventType:  "user_registered",
		IPOrSource: c.IP(),
		Details:    fmt.Sprintf("Pelanggan %s (%s / +%s) berhasil terdaftar di sistem.", cleanName, cleanEmail, cleanPhone),
		Severity:   "info",
		Timestamp:  now,
	})

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Pendaftaran akun pemesan berhasil",
		"user":    user,
	})
}

// LoginUserHandler memvalidasi login akun pemesan menggunakan Email atau No. WhatsApp
func LoginUserHandler(c *fiber.Ctx) error {
	var req models.LoginUserRequest
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Identifier) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email atau Nomor WhatsApp wajib diisi untuk masuk",
		})
	}

	cleanId := strings.TrimSpace(req.Identifier)
	normalizedPhone := normalizePhone(cleanId)

	user, err := config.Store.GetUserByIdentifier(normalizedPhone)
	if err != nil || user == nil {
		user, err = config.Store.GetUserByIdentifier(cleanId)
	}

	if err != nil || user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Akun dengan Email atau Nomor WhatsApp tersebut belum terdaftar. Silakan buat akun terlebih dahulu.",
		})
	}

	user.LastLoginAt = time.Now()
	_ = config.Store.SaveUser(user)

	_ = config.Store.SaveSecurityLog(&models.SecurityLog{
		ID:         primitive.NewObjectID(),
		EventType:  "user_login_success",
		IPOrSource: c.IP(),
		Details:    fmt.Sprintf("Pelanggan %s (%s) berhasil masuk ke sistem.", user.Name, user.Email),
		Severity:   "info",
		Timestamp:  time.Now(),
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Selamat datang kembali, %s!", user.Name),
		"user":    user,
	})
}

// GetUserProfileHandler mengambil profil akun pengguna berdasarkan nomor WhatsApp
func GetUserProfileHandler(c *fiber.Ctx) error {
	phone := c.Params("phone")
	if phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Nomor WhatsApp wajib disertakan",
		})
	}

	cleanPhone := normalizePhone(phone)
	user, err := config.Store.GetUserByIdentifier(cleanPhone)
	if err != nil || user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Akun pengguna tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"user":    user,
	})
}

// UpdateUserProfileHandler memperbarui nama, kota, dan alamat pengiriman kargo
func UpdateUserProfileHandler(c *fiber.Ctx) error {
	phone := c.Params("phone")
	if phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Nomor WhatsApp wajib disertakan",
		})
	}

	var req models.UpdateUserProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format data pembaruan tidak valid",
		})
	}

	cleanPhone := normalizePhone(phone)
	cleanName := sanitizeInput(req.Name)
	cleanCity := sanitizeInput(req.City)
	cleanAddress := sanitizeInput(req.Address)

	if len(cleanName) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Nama lengkap minimal 2 karakter",
		})
	}

	updated, err := config.Store.UpdateUserProfile(cleanPhone, cleanName, cleanCity, cleanAddress)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Gagal memperbarui data profil akun",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profil akun dan alamat pengiriman kargo berhasil disimpan",
		"user":    updated,
	})
}
