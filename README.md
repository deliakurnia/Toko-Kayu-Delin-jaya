# 🌲 Toko Kayu Delin Jaya — Platform Pengadaan Material Kayu & Custom Furniture

> **"Kayu untuk Setiap Kebutuhan Anda"**  
> Platform digital modern pengadaan material kayu solid nusantara (Jati, Merbau, Ulin, Kamper, Eboni, Sonokeling) dan jasa pembuatan custom furniture dengan legalitas SVLK resmi, visualisasi 3D interaktif, integrasi pembayaran digital Midtrans, notifikasi otomatis WhatsApp, serta backend Go berkinerja tinggi.

---

## ✨ Fitur Utama

- **🪵 Katalog Spesimen & Material Kayu**: Informasi komprehensif tingkat kekerasan (Janka), kelas kuat, kelas awet, densitas, peruntukan (indoor/outdoor), dan status stok real-time.
- **🎨 3D Interactive Wood Studio**: Visualisasi 3D material kayu secara interaktif berbasis Three.js/ThreeUI dengan kontrol pencahayaan, tekstur, dan rotasi 360 derajat.
- **📐 Kalkulator Estimasi & Custom Furniture**: Perhitungan instan volume kubikasi ($m^3$) dan estimasi biaya material sesuai dimensi panjang, lebar, dan tebal.
- **🛡️ Sertifikasi & Verifikasi SVLK**: Pengecekan keabsahan dokumen legalitas kayu dari Kementerian Lingkungan Hidup dan Kehutanan (KLHK).
- **💳 Integrasi Pembayaran Digital (Midtrans)**: Mendukung DP (Down Payment) bertahap dan pelunasan melalui QRIS, Virtual Account (BCA, Mandiri, BNI, BRI), dan kartu kredit/debit.
- **📲 Pemesanan Otomatis WhatsApp**: Routing otomatis pesanan ke WhatsApp resmi Toko Kayu Delin Jaya (`+62 858-9191-7286`) dengan format terenkripsi aman.
- **🔒 Pemisahan Persona & Privasi Ketat**:
  - **Pelanggan**: Mengakses katalog, menyimpan favorit/wishlist, riwayat belanja pribadi, pelacakan status pesanan, dan notifikasi personal.
  - **Pemilik (Owner)**: Atelier manajemen stok kayu, verifikasi transaksi pembayaran Midtrans/manual, input material baru beserta upload foto tekstur, dan backup cloud. Notifikasi owner terisolasi sepenuhnya dari pelanggan.

---

## 🛠️ Arsitektur & Teknologi

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Three.js / @designcodeio/threeui
- **State & Local Persistence**: IndexedDB / LocalStorage dengan sinkronisasi reaktif

### Backend
- **Framework**: Go Fiber v2 (High-Concurrency Architecture)
- **Database**: MongoDB Atlas M0 Free Tier (Dual Engine with In-Memory / File Fallback)
- **Payment Gateway**: Midtrans Snap & Webhook Handler

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
- **Node.js**: v18.0.0 atau lebih baru
- **Go**: v1.21 atau lebih baru (untuk backend)
- **Git**: Terpasang di sistem

### 2. Konfigurasi Frontend
```bash
# Salin template environment
cp .env.example .env.local

# Install dependensi
npm install

# Jalankan server pengembangan frontend (Port 3000)
npm run dev
```

### 3. Konfigurasi Backend (Golang)
```bash
cd backend-go

# Salin template environment
cp .env.example .env

# Isi kredensial pada .env (MongoDB URI, WhatsApp Owner, Midtrans Keys)
# Jalankan server backend Go (Port 8080)
go run main.go
```

---

## 🔐 Keamanan & Kerahasiaan (Security & Privacy)

- Berkas `.env`, `.env.local`, dan kredensial sensitif lainnya **TIDAK PERNAH** di-commit ke repositori git (sudah diatur dalam `.gitignore`).
- Seluruh endpoint input pengguna dilindungi sanitasi XSS.
- Link WhatsApp dienkripsi menggunakan `encodeURIComponent` untuk mencegah manipulasi parameter URL.

---

## 📞 Kontak & Layanan

- **Nama Usaha**: Toko Kayu Delin Jaya
- **WhatsApp**: [+62 858-9191-7286](https://wa.me/6285891917286)
- **Alamat**: Jl. Pengadaan Kayu Nusantara, Indonesia
