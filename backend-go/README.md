# Backend Golang & MongoDB - Kayu Nusantara

Backend RESTful API dengan framework **Go Fiber v2** dan **Official MongoDB Go Driver**, dirancang khusus untuk memenuhi kebutuhan PRD:
- Pemesanan terstruktur Kayu Mentah & Custom Furniture
- Identifikasi Pelanggan Setia (Repeat Customer) via nomor WhatsApp
- Pembuatan pesan WhatsApp ter-encode otomatis ke nomor pemilik
- Snapshot Cloud Backup otomatis berkapasitas rendah (100% Free Tier MongoDB Atlas M0)

## 📁 Struktur Direktori
```
/backend-go
├── config/
│   └── db.go             # Koneksi resmi MongoDB Atlas (Pool teroptimasi Free Tier)
├── handlers/
│   ├── inquiry.go        # Pemrosesan inquiry, repeat customer check & WhatsApp URL
│   └── backup.go         # Otomasi snapshot cloud JSON/BSON
├── models/
│   └── models.go         # Skema BSON & JSON struct (Customer, Inquiry, WoodType, Backup)
├── go.mod
├── main.go               # Entry point server Fiber
└── README.md
```

## 🚀 Cara Menjalankan (Lokal / VPS / Cloud Run)

1. **Pastikan Go terpasang (Go 1.22+)**:
   ```bash
   go version
   ```

2. **Atur Environment Variables**:
   ```bash
   export MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/kayu_nusantara?retryWrites=true&w=majority"
   export OWNER_WHATSAPP="6281234567890"
   export PORT="8080"
   ```

3. **Install Dependencies & Jalankan**:
   ```bash
   cd backend-go
   go mod tidy
   go run main.go
   ```

## 🔒 Jaminan Free Tier
- Skema dokumen BSON dioptimasi ringkas (<1KB per pesanan).
- Kuota 512MB gratis MongoDB Atlas M0 mampu menampung lebih dari **500.000 pesanan**.
- Otomasi snapshot memangkas log lama agar tidak memakan storage cloud.
