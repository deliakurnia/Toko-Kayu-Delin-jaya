package handlers

import (
	"crypto/rand"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
)

// GetWoodsHandler mengembalikan seluruh katalog jenis kayu aktif dengan akselerasi In-Memory RAM Cache
func GetWoodsHandler(c *fiber.Ctx) error {
	// 1. Coba ambil dari RAM cache ultra-cepat terlebih dahulu (< 0.5 milidetik, 0 DB read)
	if cachedWoods, ok := config.GetCachedWoods(); ok {
		c.Set("X-Cache-Lookup", "HIT-RAM")
		return c.JSON(fiber.Map{
			"success":       true,
			"total":         len(cachedWoods),
			"storageEngine": config.Store.EngineName,
			"cacheSource":   "In-Memory RAM (High-Concurrency Accelerated)",
			"data":          cachedWoods,
		})
	}

	// 2. Cache miss: baca dari basis data dan simpan ke RAM cache untuk pengunjung berikutnya
	woods, err := config.Store.GetWoods()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memuat katalog kayu"})
	}

	config.SetCachedWoods(woods)
	c.Set("X-Cache-Lookup", "MISS-POPULATED")

	return c.JSON(fiber.Map{
		"success":       true,
		"total":         len(woods),
		"storageEngine": config.Store.EngineName,
		"cacheSource":   "Database (Fresh Sync)",
		"data":          woods,
	})
}

// CreateWoodHandler mendaftarkan spesimen kayu baru dan menyiarkan via SSE
func CreateWoodHandler(c *fiber.Ctx) error {
	var w models.WoodType
	if err := c.BodyParser(&w); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data spesimen kayu tidak valid"})
	}

	w.Name = strings.TrimSpace(w.Name)
	w.BotanicalName = strings.TrimSpace(w.BotanicalName)
	w.Origin = strings.TrimSpace(w.Origin)
	w.PriceRangeEstimate = strings.TrimSpace(w.PriceRangeEstimate)

	if w.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama spesimen kayu wajib diisi"})
	}

	createdWood, err := config.Store.CreateWood(&w)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan spesimen kayu baru"})
	}

	// Invalidate RAM cache agar seluruh pengunjung seketika melihat spesimen baru
	config.InvalidateWoodsCache()

	// Siarkan penambahan kayu baru ke seluruh klien via SSE
	GlobalBroker.Broadcast("WOOD_CREATED", createdWood)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Spesimen kayu baru berhasil diterbitkan dan disiarkan secara real-time",
		"data":    createdWood,
	})
}

// UpdateWoodHandler memperbarui informasi kayu atau estimasi harga acuan
func UpdateWoodHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID kayu wajib diisi"})
	}

	var w models.WoodType
	if err := c.BodyParser(&w); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data kayu tidak valid"})
	}

	if err := config.Store.UpdateWood(id, &w); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui data kayu"})
	}

	config.InvalidateWoodsCache()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data kayu berhasil diperbarui",
	})
}

// UpdateWoodStockHandler memperbarui ketersediaan stok kayu dan menyiarkan via SSE
func UpdateWoodStockHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID kayu wajib diisi"})
	}

	var req models.WoodStockUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data stok tidak valid"})
	}

	updatedWood, err := config.Store.UpdateWoodStock(id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui stok kayu"})
	}

	if updatedWood == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Kayu dengan ID tersebut tidak ditemukan"})
	}

	// Invalidate RAM cache
	config.InvalidateWoodsCache()

	// Siarkan update seketika ke seluruh tab browser pembeli/klien
	GlobalBroker.Broadcast("WOOD_STOCK_UPDATED", updatedWood)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status stok kayu berhasil disinkronkan secara real-time",
		"data":    updatedWood,
	})
}

// UploadWoodImageHandler menangani upload dan replace foto spesimen kayu secara aman
func UploadWoodImageHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID kayu wajib disertakan"})
	}

	// 1. Terima berkas multipart
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Berkas gambar 'image' tidak ditemukan dalam form"})
	}

	// 2. Batasi ukuran maksimal 5 MB
	const maxFileSize = 5 << 20 // 5 MB
	if fileHeader.Size > maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Ukuran berkas melebihi batas maksimal 5 MB",
		})
	}

	// 3. Validasi ekstensi yang diizinkan
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	allowedExts := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".webp": "image/webp",
	}

	if _, ok := allowedExts[ext]; !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format berkas tidak didukung. Harap gunakan .jpg, .jpeg, .png, atau .webp",
		})
	}

	// 4. Pastikan direktori tujuan tersedia
	uploadDir := filepath.Join("uploads", "woods")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mempersiapkan direktori penyimpanan"})
	}

	// 5. Buat nama berkas unik yang diobfuskasi
	randBytes := make([]byte, 4)
	_, _ = rand.Read(randBytes)
	safeFilename := fmt.Sprintf("wood_%s_%d_%x%s", id, time.Now().Unix(), randBytes, ext)
	destinationPath := filepath.Join(uploadDir, safeFilename)

	// 6. Simpan berkas ke disk
	if err := c.SaveFile(fileHeader, destinationPath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan berkas gambar"})
	}

	// Mode replace vs append (default: replace)
	action := c.FormValue("action", "replace")
	isReplace := action != "append"

	// 7. Update database
	publicUrl := "/uploads/woods/" + safeFilename
	updatedWood, oldPhotoPath, err := config.Store.UpdateWoodImages(id, publicUrl, isReplace)
	if err != nil {
		_ = os.Remove(destinationPath)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui data foto di basis data"})
	}

	if updatedWood == nil {
		_ = os.Remove(destinationPath)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Kayu dengan ID tersebut tidak ditemukan"})
	}

	// 8. Hapus foto lama jika merupakan file lokal yang di-replace
	if oldPhotoPath != "" {
		_ = os.Remove(oldPhotoPath)
	}

	// 9. Invalidate RAM cache agar foto baru segera terkirim ke semua pengguna
	config.InvalidateWoodsCache()

	// 10. Siarkan perubahan foto via Server-Sent Events (SSE)
	GlobalBroker.Broadcast("WOOD_STOCK_UPDATED", updatedWood)
	GlobalBroker.Broadcast("WOOD_IMAGE_UPDATED", updatedWood)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Foto spesimen kayu berhasil diunggah dan disiarkan secara real-time",
		"data":    updatedWood,
		"url":     publicUrl,
	})
}

// GetCategoriesHandler mengembalikan daftar kategori custom furniture
func GetCategoriesHandler(c *fiber.Ctx) error {
	categories, err := config.Store.GetCategories()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memuat kategori furniture"})
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"total":         len(categories),
		"storageEngine": config.Store.EngineName,
		"data":          categories,
	})
}
