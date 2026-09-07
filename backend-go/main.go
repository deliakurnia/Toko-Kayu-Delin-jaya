package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/widanasgpw4/kayu-nusantara-backend/config"
	"github.com/widanasgpw4/kayu-nusantara-backend/handlers"
	"github.com/widanasgpw4/kayu-nusantara-backend/models"
)

func loadEnvFile(path string) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return
	}
	lines := strings.Split(string(bytes), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
	}
}

func main() {
	// 0. Muat berkas .env jika ada
	loadEnvFile(".env")

	// 1. Inisialisasi Engine Penyimpanan Ganda (MongoDB Atlas M0 Free Tier / Local Fallback)
	store, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("❌ Kegagalan inisialisasi basis data: %v", err)
	}
	log.Printf(" Engine Basis Data Aktif: [%s] (Cloud Live: %v)", store.EngineName, store.IsCloudLive)

	// 2. Setup Fiber Server dengan Optimasi Konkurensi Tinggi
	app := fiber.New(fiber.Config{
		AppName:      "Kayu Nusantara High-Concurrency API v1.3",
		ServerHeader: "Fiber/KayuNusantara",
		Concurrency:  256 * 1024, // 256k concurrent connection capacity
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"error":   err.Error(),
			})
		},
	})

	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// Rate Limiter Global: Mencegah banjir trafik / DoS (120 req/menit per IP)
	// Pengecualian: SSE stream real-time (/realtime/stream), health check, dan aset statis
	app.Use(limiter.New(limiter.Config{
		Max:        120,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Trafik akses sedang sangat padat. Batas laju peramban tercapai (HTTP 429). Harap tunggu sejenak demi kestabilan layanan.",
			})
		},
		Next: func(c *fiber.Ctx) bool {
			path := c.Path()
			return strings.HasPrefix(path, "/api/v1/realtime") || path == "/api/v1/health" || strings.HasPrefix(path, "/uploads")
		},
	}))

	// Layani direktori upload berkas statis (foto spesimen kayu aktual)
	_ = os.MkdirAll("./uploads/woods", 0755)
	app.Static("/uploads", "./uploads")

	// 3. Routing Endpoint API v1
	api := app.Group("/api/v1")

	// Rate Limiter Khusus Formulir Pemesanan (Anti-Spam & Anti-Bot: Maks 15 order / 3 menit per IP)
	orderLimiter := limiter.New(limiter.Config{
		Max:        15,
		Expiration: 3 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Batas pembuatan pesanan tercapai (Anti-Spam Protection). Harap tunggu 3 menit sebelum mengirim pesanan berikutnya.",
			})
		},
	})

	// Inquiries (Pemesanan Kayu & Custom Furniture)
	api.Post("/inquiries", orderLimiter, handlers.CreateInquiryHandler)
	api.Get("/inquiries", handlers.GetInquiriesHandler)
	api.Patch("/inquiries/:id/status", handlers.UpdateInquiryStatusHandler)
	api.Post("/inquiries/:id/quotation", handlers.SaveQuotationHandler)
	api.Post("/inquiries/:id/payment-intent", handlers.SavePaymentIntentHandler)
	api.Post("/inquiries/:id/verify-payment", handlers.VerifyPaymentHandler)
	api.Post("/inquiries/:id/milestones", handlers.AddMilestoneHandler)
	api.Post("/inquiries/:id/svlk", handlers.UpdateSVLKHandler)
	api.Post("/inquiries/:id/shipment", handlers.UpdateShipmentHandler)

	// Payment Webhook (Midtrans Sandbox / Production)
	api.Post("/payments/midtrans-webhook", handlers.MidtransWebhookHandler)

	// Financial & Stock Ledgers (Buku Kas & Mutasi Stok)
	api.Get("/ledgers", handlers.GetLedgersHandler)

	// Customers (Data Pelanggan & Repeat Customer Detection)
	api.Get("/customers", handlers.GetCustomersHandler)
	api.Get("/customers/:phone", handlers.GetCustomerByPhoneHandler)

	// Catalog (Katalog Kayu & Kategori Furniture)
	api.Get("/woods", handlers.GetWoodsHandler)
	api.Post("/woods", handlers.CreateWoodHandler)
	api.Put("/woods/:id", handlers.UpdateWoodHandler)
	api.Patch("/woods/:id/stock", handlers.UpdateWoodStockHandler)
	api.Post("/woods/:id/upload-image", handlers.UploadWoodImageHandler)
	api.Get("/categories", handlers.GetCategoriesHandler)

	// Real-Time SSE Stream (Inventaris Stok Kayu & Broadcast)
	api.Get("/realtime/stream", handlers.RealtimeStreamHandler)

	// Order Reports (Laporan Kendala Pelanggan)
	api.Post("/reports", handlers.CreateReportHandler)
	api.Get("/reports", handlers.GetReportsHandler)
	api.Patch("/reports/:id", handlers.UpdateReportStatusHandler)

	// Backups & Security Audit Logs
	api.Post("/backups/snapshot", handlers.TriggerBackupSnapshotHandler)
	api.Get("/backups", handlers.GetBackupsHandler)
	api.Get("/security/logs", handlers.GetSecurityLogsHandler)

	// User Authentication & Profile (Akun Pemesan Pelanggan)
	api.Post("/auth/user/register", handlers.RegisterUserHandler)
	api.Post("/auth/user/login", handlers.LoginUserHandler)
	api.Get("/user/profile/:phone", handlers.GetUserProfileHandler)
	api.Put("/user/profile/:phone", handlers.UpdateUserProfileHandler)
	api.Get("/user/inquiries/:phone", handlers.GetUserInquiriesHandler)

	// Owner Auth Passcode Check
	api.Post("/auth/verify", handlers.VerifyPasscodeHandler)

	// Health Check Terperinci
	api.Get("/health", func(c *fiber.Ctx) error {
		inqCount, custCount, _ := config.Store.GetMetrics()
		uptime := time.Since(config.StartTime).Round(time.Second).String()

		health := models.SystemHealth{
			Status:        "online",
			App:           "Kayu Nusantara Production API",
			Version:       "1.2.0",
			Engine:        config.Store.EngineName,
			IsCloudLive:   config.Store.IsCloudLive,
			DatabaseName:  config.Store.DatabaseName,
			TotalInquiry:  inqCount,
			TotalCustomer: custCount,
			Uptime:        uptime,
			Timestamp:     time.Now(),
		}
		return c.JSON(health)
	})

	// 4. Jalankan Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	banner := fmt.Sprintf(`
╔══════════════════════════════════════════════════════════════════╗
║  🌳 KAYU NUSANTARA — GOLANG BACKEND MICROSERVICE                 ║
║  📡 Server berjalan di http://0.0.0.0:%-5s                      ║
║  💾 Database: %-49s  ║
║  🛡️ Status Cloud Live: %-41v ║
╚══════════════════════════════════════════════════════════════════╝
`, port, config.Store.EngineName, config.Store.IsCloudLive)
	fmt.Println(banner)

	log.Fatal(app.Listen(":" + port))
}
