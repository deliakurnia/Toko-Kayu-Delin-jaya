# Product Requirement Document (PRD)
## Website Pengadaan & Custom Furniture Kayu

**Versi:** 1.0
**Tanggal:** 1 Agustus 2026
**Status:** Draft untuk Review

---

## 1. Ringkasan Eksekutif

Website ini adalah platform katalog dan pemesanan produk kayu (jati, eboni, sonokeling, gaharu) yang tidak hanya menjual kayu mentah/balok, tetapi juga menawarkan opsi custom menjadi furniture jadi (buffet, lemari, meja, hiasan, bangku, dll). Alih-alih checkout & payment gateway penuh, sistem ini berfungsi sebagai **lead generation & data collection tool**: pembeli mengisi form pemesanan (jenis kayu + jenis barang yang diinginkan + data diri), lalu diarahkan otomatis ke WhatsApp pemilik untuk kelanjutan negosiasi dan transaksi.

**Masalah inti yang diselesaikan:**
- Pemilik usaha kewalahan mencatat pesanan/data pelanggan secara manual.
- Tidak ada sistem terpusat untuk mengelola data pelanggan tetap (repeat customer).
- Proses komunikasi antara calon pembeli dan pemilik tidak terstruktur.

**Solusi:** Website katalog yang clean, modern, dan profesional dengan form pemesanan terstruktur yang otomatis menyimpan data ke database (Supabase) *dan* meneruskan ringkasan pesanan ke WhatsApp pemilik.

---

## 2. Latar Belakang & Masalah

| Masalah Saat Ini | Dampak |
|---|---|
| Pencatatan pesanan manual (buku/chat WA tanpa struktur) | Data pelanggan tercecer, sulit dilacak siapa pelanggan tetap |
| Tidak ada katalog visual jenis kayu & hasil jadi furniture | Calon pembeli kesulitan membayangkan produk sebelum bertanya |
| Semua komunikasi awal via chat manual | Pemilik overload menjawab pertanyaan repetitif (jenis kayu apa saja, harga kisaran, dll) |
| Tidak ada pembeda antara beli kayu mentah vs custom furniture | Miskomunikasi kebutuhan pembeli |

---

## 3. Tujuan Produk

1. Menyediakan katalog digital yang menampilkan jenis-jenis kayu beserta karakteristiknya (jati, eboni, sonokeling, gaharu).
2. Memungkinkan pembeli memilih: **beli kayu mentah** ATAU **custom furniture** (buffet, lemari, meja, hiasan, bangku, kategori lain).
3. Mengumpulkan data pembeli secara terstruktur ke database (Supabase) — termasuk histori untuk mendeteksi pelanggan langganan.
4. Mengarahkan pesanan yang sudah terisi lengkap ke WhatsApp pemilik secara otomatis (klik tombol → terbuka WA dengan pesan yang sudah terisi template).
5. Tampilan visual clean, flat, modern, profesional — tidak terkesan generik/"AI-made".

**Non-tujuan (di luar scope MVP):**
- Payment gateway / transaksi online langsung di website.
- Sistem tracking pengiriman.
- Live chat di dalam website (cukup redirect ke WhatsApp).

---

## 4. Target Pengguna

### Persona 1 — Calon Pembeli (Buyer)
- Individu atau UMKM furniture yang mencari kayu berkualitas atau ingin custom furniture.
- Butuh: transparansi jenis kayu, estimasi kebutuhan, cara pemesanan yang mudah tanpa harus chat panjang di awal.

### Persona 2 — Pembeli Langganan (Repeat Customer)
- Sudah pernah order sebelumnya, ingin proses lebih cepat.
- Butuh: sistem yang mengenali riwayat pesanan mereka (opsional login/nomor WA sebagai identifier).

### Persona 3 — Pemilik/Admin
- Mengelola data kayu, harga acuan, dan melihat rekap data pelanggan & pesanan masuk.
- Butuh: dashboard sederhana untuk melihat semua inquiry, tanpa perlu keahlian teknis tinggi.

---

## 5. Alur Pengguna (User Flow)

### Flow Pembeli
```
Landing Page
   │
   ▼
Katalog Jenis Kayu (Jati / Eboni / Sonokeling / Gaharu)
   │
   ▼
Pilih Mode Pembelian
   ├─► Kayu Mentah (balok/lembar) → pilih ukuran/jumlah estimasi
   └─► Custom Furniture → pilih jenis barang (buffet/lemari/meja/hiasan/bangku/lainnya)
   │
   ▼
Form Data Diri (nama, no. WA, alamat/kota, catatan tambahan)
   │
   ▼
Ringkasan Pesanan (review sebelum kirim)
   │
   ▼
Klik "Kirim ke WhatsApp"
   │
   ├─► Data tersimpan ke Supabase
   └─► Redirect ke wa.me dengan pesan pre-filled
```

### Flow Admin (Sederhana, opsional untuk MVP lanjutan)
```
Login Admin
   │
   ▼
Dashboard: Daftar Inquiry Masuk (sortir by tanggal/status)
   │
   ▼
Lihat Detail Pelanggan → tandai status (Baru / Diproses / Selesai)
   │
   ▼
Lihat Data Pelanggan Langganan (filter by frekuensi order)
```

---

## 6. Ruang Lingkup Fitur (Functional Requirements)

### 6.1 Halaman Publik (Wajib – MVP)

| Halaman | Deskripsi |
|---|---|
| **Beranda (Home)** | Hero section, value proposition, showcase jenis kayu unggulan, showcase hasil furniture, CTA "Pesan Sekarang" |
| **Katalog Kayu** | Grid/list semua jenis kayu dengan foto, deskripsi singkat, karakteristik (kekerasan, warna, ketahanan, kegunaan umum) |
| **Detail Jenis Kayu** | Deskripsi lengkap, galeri foto, contoh hasil jadi dari kayu tersebut, tombol "Pesan Jenis Ini" |
| **Katalog Furniture/Kategori Barang** | Buffet, lemari, meja, hiasan, bangku, kategori custom lain — dengan contoh foto referensi |
| **Form Pemesanan** | Multi-step form (lihat detail di 6.2) |
| **Tentang Kami** | Profil usaha, kredibilitas (pengalaman, sumber kayu legal, dll) |
| **Kontak** | Alamat, jam operasional, tombol WA langsung, form kontak umum (opsional) |

### 6.2 Form Pemesanan (Fitur Inti)

**Step 1 — Pilih Jenis Produk**
- Radio/Card selector: "Beli Kayu Mentah" vs "Custom Furniture"

**Step 2A (jika Kayu Mentah)**
- Pilih jenis kayu (dropdown/card: Jati, Eboni, Sonokeling, Gaharu)
- Estimasi ukuran/jumlah (input bebas atau dropdown kategori: kecil/sedang/besar, atau input custom)
- Catatan tambahan (textarea, opsional)

**Step 2B (jika Custom Furniture)**
- Pilih jenis kayu
- Pilih jenis barang (dropdown/card: Buffet, Lemari, Meja, Bangku, Hiasan, Lainnya — dengan input teks jika "Lainnya")
- Referensi ukuran/desain (textarea + opsional upload foto referensi)
- Catatan tambahan (opsional)

**Step 3 — Data Diri**
- Nama lengkap (wajib)
- Nomor WhatsApp (wajib, dengan validasi format)
- Kota/alamat (wajib untuk estimasi pengiriman)
- Email (opsional)

**Step 4 — Ringkasan & Kirim**
- Tampilkan ringkasan semua data yang diinput
- Checkbox persetujuan (opsional: "Data saya boleh disimpan untuk mempermudah pemesanan berikutnya")
- Tombol **"Kirim Pesanan via WhatsApp"**

**Logic saat submit:**
1. Data disimpan ke tabel `inquiries` di Supabase.
2. Sistem generate teks pesan otomatis, contoh:
   ```
   Halo, saya [Nama] ingin memesan:
   - Jenis Kayu: Jati
   - Kebutuhan: Custom Meja Makan
   - Ukuran/Referensi: 180x90cm, referensi terlampir
   - Catatan: -
   - Kota: Depok

   Mohon info lebih lanjut. Terima kasih.
   ```
3. Redirect ke `https://wa.me/62XXXXXXXXXX?text=<encoded message>`

### 6.3 Deteksi Pelanggan Langganan
- Gunakan nomor WhatsApp sebagai *unique identifier* sederhana.
- Saat submit form, sistem cek apakah nomor tersebut sudah ada di tabel `customers`.
- Jika sudah ada → increment `total_orders`, tampilkan badge "Selamat datang kembali!" (opsional UX touch).
- Jika belum ada → buat record baru.

### 6.4 Dashboard Admin (Fase 2 — bisa MVP+1)
- Login sederhana (Supabase Auth, email/password untuk pemilik).
- List semua inquiry (tabel dengan filter status, tanggal, jenis kayu).
- Detail per inquiry + update status (Baru/Diproses/Selesai/Batal).
- List pelanggan dengan jumlah order (untuk identifikasi langganan).
- Simple search/filter.

> Catatan: Untuk MVP awal, admin bisa memantau lewat Supabase Table Editor langsung tanpa dashboard custom — dashboard bisa dibangun di fase 2 setelah website utama berjalan.

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement |
|---|---|
| **Performa** | Landing page load < 2.5 detik (optimasi gambar wajib, gunakan next/image atau lazy loading) |
| **Responsif** | Mobile-first — mayoritas traffic pemesanan diperkirakan dari HP |
| **SEO** | Meta tag per halaman, structured data untuk produk, sitemap.xml |
| **Keamanan** | Row Level Security (RLS) di Supabase, validasi input di frontend & backend, rate limiting form submission (mencegah spam) |
| **Aksesibilitas** | Kontras warna sesuai WCAG AA, alt text untuk semua gambar produk |
| **Skalabilitas** | Struktur data mendukung penambahan jenis kayu/kategori baru tanpa perubahan kode besar |

---

## 8. Struktur Data (Supabase / PostgreSQL)

### Tabel: `wood_types`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | Jati, Eboni, Sonokeling, Gaharu |
| slug | text | untuk URL |
| description | text | |
| characteristics | jsonb | kekerasan, warna, ketahanan, dll |
| images | text[] | array URL gambar (Supabase Storage) |
| is_active | boolean | |
| created_at | timestamptz | |

### Tabel: `product_categories` (kategori furniture)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | Buffet, Lemari, Meja, Bangku, Hiasan, Lainnya |
| slug | text | |
| reference_images | text[] | contoh foto |
| is_active | boolean | |

### Tabel: `customers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| whatsapp_number | text (unique) | identifier utama |
| name | text | |
| city | text | |
| email | text (nullable) | |
| total_orders | int | default 0, increment tiap inquiry baru |
| first_order_at | timestamptz | |
| last_order_at | timestamptz | |

### Tabel: `inquiries` (pesanan/permintaan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| customer_id | uuid (FK → customers) | |
| order_type | text | 'raw_wood' / 'custom_furniture' |
| wood_type_id | uuid (FK → wood_types) | |
| category_id | uuid (FK → product_categories, nullable) | null jika raw_wood |
| size_estimate | text | |
| reference_note | text | |
| reference_image_url | text (nullable) | |
| status | text | 'new' / 'processing' / 'done' / 'cancelled' |
| created_at | timestamptz | |

### Tabel: `admin_users` (via Supabase Auth)
- Menggunakan Supabase Auth bawaan, tidak perlu tabel custom kecuali butuh role tambahan.

---

## 9. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database & Backend | Supabase (PostgreSQL, Auth, Storage) |
| Form Handling | React Hook Form + Zod (validasi) |
| Hosting | Vercel (rekomendasi, cocok dengan Next.js) |
| Image Storage | Supabase Storage (bucket untuk foto produk & referensi upload user) |

---

## 10. Panduan Desain (Design System)

### Prinsip Desain
Clean, flat, modern, profesional. Hindari elemen yang terasa generik/template AI: hindari gradient ungu-biru klise, hindari ikon 3D glossy default, hindari layout simetris kaku tanpa hierarki visual yang jelas.

### Arah Visual: "Warm Craftsmanship"
Karena produk adalah kayu premium (jati, eboni, sonokeling, gaharu), nuansa visual sebaiknya mencerminkan **kehangatan material alami + presisi profesional**, bukan tema tech/startup generik.

**Palet Warna:**
| Warna | Hex | Penggunaan |
|---|---|---|
| Coklat Kayu Gelap (primer) | `#3E2723` | Header, aksen utama, teks penting |
| Krem/Off-white (background) | `#F5F1EA` | Latar utama, memberi kesan hangat natural |
| Coklat Kayu Terang | `#8D6E63` | Elemen sekunder, border, hover state |
| Hijau Tua Muted (aksen alami, opsional) | `#4A5D45` | Aksen kecil untuk badge/tag kategori |
| Hitam Lunak | `#1C1C1C` | Teks utama (bukan pure black) |
| Putih | `#FFFFFF` | Card background, ruang negatif |

> Alternatif: jika ingin kesan lebih premium/gelap (mengingat eboni & sonokeling identik dengan warna gelap), pertimbangkan dark mode sebagai tema utama: background `#1A1512`, dengan aksen emas muda `#C9A34E` — memberi kesan furniture mewah/butik.

**Tipografi:**
- Heading: font serif modern seperti **"Fraunces"** atau **"Playfair Display"** — memberi kesan craft & premium tanpa terlihat kuno.
- Body: font sans-serif clean seperti **"Inter"** atau **"General Sans"** — memastikan keterbacaan tinggi di form dan konten panjang.
- Hindari font default seperti Roboto/Open Sans polos yang terasa generik.

**Layout & Komponen:**
- Grid asimetris untuk showcase produk (bukan grid kotak-kotak seragam) agar terasa lebih editorial/curated.
- Foto produk kayu dengan crop natural (tekstur kayu close-up) sebagai elemen visual berulang di background section.
- Micro-interaction halus: hover scale ringan pada card, transisi smooth antar step form.
- White space cukup lega — jangan padat, ini brand premium bukan e-commerce diskon.
- Ikon: gunakan line-icon custom/monoline (bukan emoji atau ikon default library tanpa kustomisasi warna).

---

## 11. Metrik Keberhasilan (KPI)

| Metrik | Target Awal |
|---|---|
| Jumlah inquiry masuk per bulan | Baseline dari data manual sebelumnya, target naik 30% |
| Conversion rate (visitor → submit form) | ≥ 3–5% |
| Waktu rata-rata pengisian form | < 2 menit |
| % pelanggan langganan teridentifikasi otomatis | ≥ 80% dari repeat customer existing |
| Bounce rate halaman katalog | < 50% |

---

## 12. Roadmap

**Fase 1 — MVP (Prioritas Utama)**
- Halaman: Home, Katalog Kayu, Detail Kayu, Katalog Furniture, Form Pemesanan, Tentang, Kontak
- Integrasi Supabase (tabel `wood_types`, `product_categories`, `customers`, `inquiries`)
- Redirect otomatis ke WhatsApp dengan pesan pre-filled
- Deteksi pelanggan langganan by nomor WA

**Fase 2 — Peningkatan**
- Dashboard admin custom (di luar Supabase Table Editor)
- Upload foto referensi oleh pembeli
- Filter & pencarian katalog kayu/furniture

**Fase 3 — Pengembangan Lanjutan**
- Sistem notifikasi email otomatis ke admin saat ada inquiry baru
- Analytics dashboard (produk paling diminati, dll)
- Multi-admin dengan role berbeda

---

## 13. Asumsi & Risiko

| Asumsi/Risiko | Mitigasi |
|---|---|
| Nomor WhatsApp bisa duplikat/typo, mengganggu deteksi langganan | Validasi format nomor + normalisasi (hapus spasi, format +62) |
| User submit form berkali-kali (spam) | Rate limiting per IP/nomor, tambahkan captcha sederhana jika perlu |
| Ketergantungan pada WhatsApp Business pemilik aktif | Tambahkan fallback kontak (email/telepon) di halaman kontak |
| Foto produk kayu berkualitas rendah menurunkan kesan premium | Rekomendasi sesi foto profesional sebelum launch |

---

## 14. Lampiran — Contoh Struktur Pesan WhatsApp Otomatis

```
🌳 PESANAN BARU - [Nama Website]

Nama: {nama}
No. WA: {nomor_wa}
Kota: {kota}

Jenis Pesanan: {Kayu Mentah / Custom Furniture}
Jenis Kayu: {jenis_kayu}
Kategori Barang: {kategori_barang, jika custom}
Estimasi Ukuran: {size_estimate}
Catatan: {catatan}

Dikirim otomatis melalui website.
```

---

*Dokumen ini dapat disesuaikan lebih lanjut setelah diskusi kebutuhan teknis lebih detail dengan tim development.*
