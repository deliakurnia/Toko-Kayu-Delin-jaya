# Kayu Nusantara — Master System & Agent Directives

> **PERINGATAN SISTEM (MANDATORY & UNCONDITIONAL):**
> Dokumen ini memuat integrasi seluruh keahlian (**Impeccable, High-End Visual Design, UI/UX Pro Max, ThreeUI / Three.js 3D WebGL, Scroll-Craft, Motion Choreography, No-AI-Slop, Unslop, Accidental Data Loss Prevention, & Web Application Security**).
> Setiap instruksi, prompt, pembuatan fitur, penulisan kode, dan penyusunan copy teks **WAJIB** secara otomatis mematuhi seluruh standar di bawah ini tanpa pengecualian.

---

## 1. FRONTEND TASTE & AESTHETICS (IMPECCABLE & HIGH-END DESIGN)

### A. Anti-Generic / Zero AI Slop Rules (ABSOLUTE BANS)
1. **Dilarang keras memakai font generik:** Dilarang menggunakan font default AI seperti Inter, Roboto, Arial, Times New Roman, atau Helvetica. Gunakan tipografi berkarakter (Plus Jakarta Sans, Outfit, PP Editorial / Variable Serif untuk editorial, atau JetBrains Mono untuk metrik/kode).
2. **Dilarang Border Kiri/Kanan Berwarna:** Tidak boleh ada `border-l-4` atau `border-r-4` sebagai aksen kartu atau alert.
3. **Dilarang Teks Gradien Murahan:** Hindari `background-clip: text bg-gradient-to-r` pada heading teks biasa. Gunakan warna solid berbobot tinggi.
4. **Dilarang Template Metrik AI & Identical Card Grids:** Jangan menduplikasi 3 kartu berjejer dengan icon + heading + teks yang identik secara monoton. Gunakan layout asimetris (Bento Grid) yang kaya variasi ritme spasial.
5. **Dilarang Eyebrow / Kicker Berlebihan:** Jangan meletakkan teks uppercase berjarak (`TRACKING-WIDEST`) "01 · TENTANG KAMI", "02 · PRODUK" di setiap section tanpa alasan urutan nyata.
6. **Dilarang Ghost Cards:** Dilarang menggabungkan `border: 1px solid gray` dengan drop shadow buram besar (`box-shadow: 0 20px 25px rgba(0,0,0,0.1)`). Pilih salah satu: garis hairline presisi atau bayangan lembut ambient yang sangat terdifusi.
7. **Dilarang Over-Rounding:** Kartu dan kontainer maksimal `rounded-xl` atau `rounded-2xl` (12px–16px). Jangan gunakan 32px–40px pada kartu konten kecuali tombol pill utuh (`rounded-full`).

### B. Arsitektur Komponen "Double-Bezel" & Haptic Micro-Interactions
- **Nested Architecture (Doppelrand):** Elemen penting memiliki pembungkus luar (`ring-1 ring-black/5 dark:ring-white/10 p-1.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]`) dengan inti dalam (`rounded-[calc(1rem-0.25rem)] bg-white dark:bg-neutral-900 shadow-sm`).
- **Button-in-Button Architecture:** Tombol CTA primer memiliki wadah sirkular tersendiri untuk ikon panah/aksi (`w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform`).
- **Warna & Kontras:** Rasio kontras teks utama wajib ≥ 4.5:1 (WCAG AA). Hindari abu-abu pudar di atas latar terang. Neutral wajib diwarnai sedikit (*tinted*) dengan spektrum brand kayu (warm amber/cedar/espresso), bukan abu-abu mati standar.

### C. ThreeUI & 3D WebGL Directives (`@designcodeio/threeui` & Three.js)
- **Aset & Komponen 3D:** Gunakan `@designcodeio/threeui` dan Three.js untuk visualisasi 3D premium (rotasi serat kayu, shader latar interaktif, kartu berkedalaman visual tinggi).
- **GPU-Safe & Memory Cleanup:** Setiap scene Three.js / WebGL canvas wajib memiliki dispose lifecycle saat unmount (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`) untuk mencegah memory leak.
- **Harmonisasi Estetika Kayu:** Pencahayaan 3D dan shader wajib disesuaikan dengan mood hangat alami kayu Nusantara (warm amber, golden oak, cedar, walnut), bukan neon atau cyberpunk dingin yang kontradiktif.

---

## 2. SCROLL & MOTION CHOREOGRAPHY (SCROLL-CRAFT & FLUID DYNAMICS)

1. **Fisika Pegas & Kurva Dinamis:** Dilarang menggunakan transisi `linear` atau `ease-in-out` bawaan. Gunakan custom cubic-bezier (misal: `cubic-bezier(0.32, 0.72, 0, 1)` atau `ease-out-quint`).
2. **GPU-Safe Animation:** Hanya animasikan properti `transform` dan `opacity`. Dilarang menggerakkan properti reflow seperti `top`, `left`, `width`, `height`, atau `padding`.
3. **Staggered Entry & Scroll Visibility:** Elemen saat masuk viewport masuk dengan transisi halus (`translate-y-8 opacity-0` -> `translate-y-0 opacity-100`).
4. **Aksesibilitas Wajib:** Seluruh animasi wajib memiliki fallback instan untuk pengguna reduced motion: `@media (prefers-reduced-motion: reduce)`.
5. **Backdrop Blur Terkendali:** `backdrop-blur` hanya boleh diterapkan pada elemen sticky/fixed (navbar, modal overlay). Jangan pasang blur pada kontainer yang di-scroll terus-menerus.

---

## 3. COPYWRITING & NO-AI-SLOP (UNSLOP DIRECTIVE)

1. **Daftar Kata Terlarang (Banned Buzzwords):**
   - *delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, transformative, elevate, embark, supercharge, harness, ever-evolving.*
2. **Hapus Retorika Palsu AI:**
   - Dilarang pola kontras biner: *"Bukan sekadar X, tapi Y"*, *"Ini bukan X, melainkan Y"*. Langsung katakan poin intinya.
   - Dilarang pembuka basa-basi: *"Faktanya adalah..."*, *"Perlu diingat bahwa..."*, *"Mari kita bedah..."*.
   - Dilarang colon reveal: *"Satu hal yang membuatnya unggul: kualitasnya"*. Ubah menjadi kalimat alami.
3. **Bahasa Manusia & Fakta Konkret:** Gunakan kalimat aktif, sebutkan angka, nama kayu asli, dimensi, mekanisme pengerjaan, dan keuntungan nyata bagi pembeli/pengrajin.

---

## 4. SECURITY & DATA INTEGRITY (SECURITY GUARDRAILS)

1. **Pencegahan Kehilangan Data (Accidental Data Loss Prevention):**
   - Dilarang melakukan operasi destructive (`DROP`, `TRUNCATE`, pembersihan storage tanpa izin, atau penimpaan file data mentah) tanpa konfirmasi eksplisit.
2. **Sanitasi Input & XSS Defense:**
   - Setiap data input pengguna (nama, nomor WA, catatan pesanan, ukuran kayu) wajib disanitasi sebelum disimpan ke state/database atau dirender ke DOM.
3. **Keamanan WhatsApp & Parameter URL:**
   - Pembuatan link `https://wa.me/...` wajib melalui `encodeURIComponent` agar karakter khusus tidak memicu injection atau URL malformed.
4. **Manajemen Rahasia (Secrets & Config):**
   - Dilarang keras menaruh API Key (Gemini API, MongoDB URI dengan password) langsung di kode frontend. Gunakan `.env` / variabel lingkungan.
5. **Role & Admin Guard:**
   - Bagian pemilik/admin (laporan keuangan, log inquiry, snapshot backup) wajib dilindungi dengan validasi session/passcode dan rate-limiting proteksi brute force.

---

## 5. FULL OUTPUT & VERIFICATION ENFORCEMENT

1. **No Truncation / No Placeholders:** Dilarang menulis komentar malas seperti `// TODO: tambahkan sisa kode di sini`, `/* ... */`, atau kode yang terputus. Seluruh implementasi harus lengkap, siap pakai, dan tidak ada potongan yang hilang.
2. **Verifikasi Sebelum Selesai:** Sebelum menyatakan pekerjaan selesai, jalankan linter/build checker (`npm run lint`, dll.) untuk memastikan tidak ada error kompilasi atau tipe TypeScript yang rusak.
