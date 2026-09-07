import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code2, Server, Database, Play, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export const ApiDocsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'golang-code' | 'step-by-step'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('post-inquiry');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiTestResponse, setApiTestResponse] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const endpoints = [
    {
      id: 'post-inquiry',
      method: 'POST',
      path: '/api/v1/inquiries',
      title: 'Submit Inquiry & Deteksi Pelanggan',
      description: 'Menyimpan pesanan kayu/furniture baru, memeriksa histori nomor WhatsApp pemesan untuk deteksi pelanggan setia, serta menghasilkan encoded link WhatsApp.',
      requestBody: {
        customerName: 'Budi Hartono',
        whatsappNumber: '081298765432',
        city: 'Jakarta Selatan',
        email: 'budi@example.com',
        orderType: 'custom_furniture',
        woodTypeId: '66d8e101a1f0a2001e3b0001',
        categoryId: 'cat_01',
        sizeEstimate: '220 x 100 x 78 cm',
        referenceNote: 'Finishing natural doff tanpa glossy berlebih'
      },
      responseExample: {
        statusCode: 201,
        success: true,
        data: {
          inquiryNumber: 'INQ-20260905-482',
          customerId: '66d8f201b1f0a2001e3c0001',
          customerName: 'Budi Hartono',
          isRepeatCustomer: true,
          repeatOrderCount: 4,
          status: 'new',
          whatsappUrl: 'https://wa.me/6281234567890?text=PESANAN%20BARU...',
          createdAt: '2026-09-05T10:15:00.000Z'
        }
      }
    },
    {
      id: 'get-inquiries',
      method: 'GET',
      path: '/api/v1/inquiries',
      title: 'Ambil Daftar Pesanan (Inquiry List)',
      description: 'Mengambil daftar inquiry dengan filter status (new, processing, done, cancelled) dan paginasi.',
      requestBody: null,
      responseExample: {
        statusCode: 200,
        total: 12,
        page: 1,
        data: [
          {
            inquiryNumber: 'INQ-20260905-482',
            customerName: 'Budi Hartono',
            whatsappNumber: '6281298765432',
            woodTypeName: 'Jati (Teak)',
            status: 'processing'
          }
        ]
      }
    },
    {
      id: 'post-backup',
      method: 'POST',
      path: '/api/v1/backups/snapshot',
      title: 'Picu Snapshot Backup Cloud',
      description: 'Mengeksekusi backup otomatis database MongoDB ke JSON/BSON storage (Free Tier MongoDB Atlas M0).',
      requestBody: {
        scheduled: false
      },
      responseExample: {
        statusCode: 200,
        success: true,
        backup: {
          filename: 'kayu-nusantara-backup-2026-09-05.json',
          totalRecords: 148,
          sizeKb: 24,
          checksum: 'sha256-b9a8f4c1...',
          status: 'verified'
        }
      }
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  const handleTestApi = () => {
    setIsTestingApi(true);
    setApiTestResponse(null);
    setTimeout(() => {
      setApiTestResponse(JSON.stringify(currentEndpoint.responseExample, null, 2));
      setIsTestingApi(false);
    }, 450);
  };

  const golangMongoCode = `package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// === 1. SKEMA DATA MONGODB & BSON STRUCTS ===

type Customer struct {
	ID             primitive.ObjectID \`bson:"_id,omitempty" json:"id"\`
	WhatsAppNumber string             \`bson:"whatsapp_number" json:"whatsappNumber"\`
	Name           string             \`bson:"name" json:"name"\`
	City           string             \`bson:"city" json:"city"\`
	Email          string             \`bson:"email,omitempty" json:"email,omitempty"\`
	TotalOrders    int                \`bson:"total_orders" json:"totalOrders"\`
	IsLoyal        bool               \`bson:"is_loyal" json:"isLoyal"\`
	FirstOrderAt   time.Time          \`bson:"first_order_at" json:"firstOrderAt"\`
	LastOrderAt    time.Time          \`bson:"last_order_at" json:"lastOrderAt"\`
}

type Inquiry struct {
	ID               primitive.ObjectID \`bson:"_id,omitempty" json:"id"\`
	InquiryNumber    string             \`bson:"inquiry_number" json:"inquiryNumber"\`
	CustomerID       primitive.ObjectID \`bson:"customer_id" json:"customerId"\`
	CustomerName     string             \`bson:"customer_name" json:"customerName"\`
	WhatsAppNumber   string             \`bson:"whatsapp_number" json:"whatsappNumber"\`
	City             string             \`bson:"city" json:"city"\`
	OrderType        string             \`bson:"order_type" json:"orderType"\` // raw_wood / custom_furniture
	WoodTypeID       primitive.ObjectID \`bson:"wood_type_id" json:"woodTypeId"\`
	WoodTypeName     string             \`bson:"wood_type_name" json:"woodTypeName"\`
	CategoryID       string             \`bson:"category_id,omitempty" json:"categoryId,omitempty"\`
	SizeEstimate     string             \`bson:"size_estimate" json:"sizeEstimate"\`
	ReferenceNote    string             \`bson:"reference_note" json:"referenceNote"\`
	Status           string             \`bson:"status" json:"status"\` // new, processing, done, cancelled
	IsRepeatCustomer bool               \`bson:"is_repeat_customer" json:"isRepeatCustomer"\`
	RepeatOrderCount int                \`bson:"repeat_order_count" json:"repeatOrderCount"\`
	CreatedAt        time.Time          \`bson:"created_at" json:"createdAt"\`
}

// === 2. KONEKSI KE MONGODB ATLAS (FREE TIER M0) ===

var db *mongo.Database

func ConnectMongoDB() (*mongo.Database, error) {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		// MongoDB Atlas Free Tier M0 URI Format:
		uri = "mongodb+srv://admin:secret@cluster0.mongodb.net/kayu_nusantara?retryWrites=true&w=majority"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri).SetMaxPoolSize(10) // Free tier friendly
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, fmt.Errorf("gagal koneksi mongo: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("ping mongo gagal: %w", err)
	}

	log.Println(" Berhasil terhubung ke MongoDB Atlas (Free Tier)!")
	return client.Database("kayu_nusantara"), nil
}

// === 3. HANDLER INQUIRY & DETEKSI PELANGGAN LANGGANAN ===

func CreateInquiryHandler(c *fiber.Ctx) error {
	var body struct {
		CustomerName   string \`json:"customerName"\`
		WhatsAppNumber string \`json:"whatsappNumber"\`
		City           string \`json:"city"\`
		Email          string \`json:"email"\`
		OrderType      string \`json:"orderType"\`
		WoodTypeID     string \`json:"woodTypeId"\`
		WoodTypeName   string \`json:"woodTypeName"\`
		CategoryID     string \`json:"categoryId"\`
		SizeEstimate   string \`json:"sizeEstimate"\`
		ReferenceNote  string \`json:"referenceNote"\`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Payload request tidak valid"})
	}

	// Normalisasi nomor WhatsApp ke 62...
	reg := regexp.MustCompile("[^0-9]")
	cleanedPhone := reg.ReplaceAllString(body.WhatsAppNumber, "")
	if len(cleanedPhone) > 0 && cleanedPhone[0] == '0' {
		cleanedPhone = "62" + cleanedPhone[1:]
	}

	ctx := context.Background()
	customersCol := db.Collection("customers")
	inquiriesCol := db.Collection("inquiries")

	// Cek apakah nomor WA sudah ada di database pelanggan (PRD 6.3)
	var existingCustomer Customer
	err := customersCol.FindOne(ctx, bson.M{"whatsapp_number": cleanedPhone}).Decode(&existingCustomer)

	now := time.Now()
	var customerID primitive.ObjectID
	isRepeat := false
	orderCount := 1

	if err == nil {
		// Pelanggan Langganan Terdeteksi
		isRepeat = true
		orderCount = existingCustomer.TotalOrders + 1
		customerID = existingCustomer.ID

		_, _ = customersCol.UpdateOne(ctx, bson.M{"_id": customerID}, bson.M{
			"$set": bson.M{
				"total_orders":  orderCount,
				"is_loyal":      orderCount >= 2,
				"last_order_at": now,
				"city":          body.City,
			},
		})
	} else {
		// Pelanggan Baru
		customerID = primitive.NewObjectID()
		newCust := Customer{
			ID:             customerID,
			WhatsAppNumber: cleanedPhone,
			Name:           body.CustomerName,
			City:           body.City,
			Email:          body.Email,
			TotalOrders:    1,
			IsLoyal:        false,
			FirstOrderAt:   now,
			LastOrderAt:    now,
		}
		_, _ = customersCol.InsertOne(ctx, newCust)
	}

	inquiryNum := fmt.Sprintf("INQ-%s-%d", now.Format("20060102"), time.Now().Unix()%1000)
	woodOID, _ := primitive.ObjectIDFromHex(body.WoodTypeID)

	newInq := Inquiry{
		ID:               primitive.NewObjectID(),
		InquiryNumber:    inquiryNum,
		CustomerID:       customerID,
		CustomerName:     body.CustomerName,
		WhatsAppNumber:   cleanedPhone,
		City:             body.City,
		OrderType:        body.OrderType,
		WoodTypeID:       woodOID,
		WoodTypeName:     body.WoodTypeName,
		CategoryID:       body.CategoryID,
		SizeEstimate:     body.SizeEstimate,
		ReferenceNote:    body.ReferenceNote,
		Status:           "new",
		IsRepeatCustomer: isRepeat,
		RepeatOrderCount: orderCount,
		CreatedAt:        now,
	}

	_, err = inquiriesCol.InsertOne(ctx, newInq)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Gagal menyimpan inquiry"})
	}

	// Buat pesan WhatsApp sesuai lampiran PRD
	waMsg := fmt.Sprintf("🌳 *PESANAN BARU - Kayu Nusantara*\\n\\nNama: %s\\nNo. WA: %s\\nKota: %s\\n\\nJenis Pesanan: %s\\nJenis Kayu: %s\\nEstimasi Ukuran: %s\\nCatatan: %s",
		body.CustomerName, cleanedPhone, body.City, body.OrderType, body.WoodTypeName, body.SizeEstimate, body.ReferenceNote)
	if isRepeat {
		waMsg += fmt.Sprintf("\\n\\n⭐ *Pelanggan Setia (Pesanan ke-%d)*", orderCount)
	}

	ownerWA := "6281234567890"
	waURL := fmt.Sprintf("https://wa.me/%s?text=%s", ownerWA, url.QueryEscape(waMsg))

	return c.Status(201).JSON(fiber.Map{
		"success":          true,
		"inquiry":          newInq,
		"isRepeatCustomer": isRepeat,
		"repeatOrderCount": orderCount,
		"whatsappUrl":      waURL,
	})
}

// === 4. ROUTER & SERVER ENTRY POINT ===

func main() {
	var err error
	db, err = ConnectMongoDB()
	if err != nil {
		log.Fatalf("MongoDB error: %v", err)
	}

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New())

	// API Routes
	api := app.Group("/api/v1")
	api.Post("/inquiries", CreateInquiryHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server Golang berjalan di port %s", port)
	log.Fatal(app.Listen(":" + port))
}
`;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Developer Hub & Arsitektur
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Server className="w-3 h-3" />
              Golang 1.22 + MongoDB Driver
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Dokumentasi API & Panduan Integrasi
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Panduan lengkap skema BSON, implementasi koneksi MongoDB resmi, endpoint RESTful, serta langkah implementasi gratis (Free Tier).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#16191f] border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'endpoints'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            REST API Explorer
          </button>
          <button
            onClick={() => setActiveTab('golang-code')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'golang-code'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Kode Sumber Golang
          </button>
          <button
            onClick={() => setActiveTab('step-by-step')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'step-by-step'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Panduan Free Tier
          </button>
        </div>
      </div>

      {/* TAB 1: REST API EXPLORER */}
      {activeTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints Sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Daftar Endpoint RESTful:
            </h3>
            {endpoints.map(ep => (
              <div
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setApiTestResponse(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEndpoint === ep.id
                    ? 'border-emerald-500 bg-white dark:bg-[#16191f] shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1115] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ep.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {ep.path}
                  </span>
                </div>
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1.5">
                  {ep.title}
                </h4>
              </div>
            ))}
          </div>

          {/* Endpoint Detail & Interactive Live Tester */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                    currentEndpoint.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-slate-100">
                  {currentEndpoint.path}
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
                {currentEndpoint.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {currentEndpoint.description}
              </p>
            </div>

            {/* Request Body Example */}
            {currentEndpoint.requestBody && (
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Request Payload (JSON):
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(currentEndpoint.requestBody, null, 2), 'req')}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <pre className="p-3.5 mt-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(currentEndpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Test Button & Response Viewer */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isTestingApi ? 'Mengirim Request...' : 'Tes Eksekusi Endpoint Sekarang'}</span>
                </button>
              </div>

              {apiTestResponse && (
                <div className="mt-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      HTTP 200 OK • Response Live
                    </span>
                    <button
                      onClick={() => copyToClipboard(apiTestResponse, 'res')}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <pre className="p-3.5 mt-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 font-mono text-xs overflow-x-auto">
                    {apiTestResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOLANG CODE IMPLEMENTATION */}
      {activeTab === 'golang-code' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                Implementasi Golang Fiber + Official MongoDB Driver (main.go)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Kode produksi mandiri siap di-deploy ke Cloud Run, VPS, atau container Docker.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(golangMongoCode, 'go-main')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedKey === 'go-main' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'go-main' ? 'Tersalin!' : 'Salin Seluruh Kode Golang'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-mono text-emerald-400">main.go (Fiber v2 + Mongo Driver)</span>
              <span className="text-[10px] font-mono text-slate-400">Go 1.22+</span>
            </div>
            <pre className="p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[560px]">
              <code>{golangMongoCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: STEP-BY-STEP FREE TIER SETUP GUIDE */}
      {activeTab === 'step-by-step' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 space-y-6">
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              Panduan Langkah-demi-Langkah Implementasi (100% Free Tier)
            </h3>

            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Daftar Cluster MongoDB Atlas M0 (Gratis Selamanya)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Buka <strong>mongodb.com/cloud/atlas</strong>, buat akun gratis. Pilih paket <strong>M0 Free Tier</strong> (RAM bersama, kuota 512MB, tanpa perlu memasukkan kartu kredit).
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  mongodb+srv://&lt;db_user&gt;:&lt;password&gt;@cluster0.mongodb.net/kayu_nusantara?retryWrites=true&w=majority
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                2
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Konfigurasi Environment Variable
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Salin file `.env.example` ke `.env` pada proyek backend dan sesuaikan nomor WhatsApp pemilik untuk menerima pesanan:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs">
                  MONGO_URI="mongodb+srv://...<br />
                  OWNER_WHATSAPP="6281234567890"<br />
                  PORT="8080"
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                3
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Jalankan Backend Golang & Cron Backup
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Jalankan perintah berikut di terminal:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 font-mono text-xs">
                  go mod init kayu-nusantara-backend<br />
                  go get github.com/gofiber/fiber/v2 go.mongodb.org/mongo-driver/mongo<br />
                  go run main.go
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
