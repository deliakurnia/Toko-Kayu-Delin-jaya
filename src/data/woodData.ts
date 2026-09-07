import { WoodType } from '../types';

export const INITIAL_WOODS: WoodType[] = [
  {
    id: '66d8e101a1f0a2001e3b0001',
    name: 'Jati (Teak)',
    botanicalName: 'Tectona grandis',
    slug: 'jati',
    description: 'Raja kayu nusantara yang tersohor di seluruh dunia. Mengandung minyak alami (teak oil) tinggi yang menjadikannya tahan terhadap rayap, jamur, serta cuaca ekstrem selama puluhan tahun tanpa pelapukan.',
    characteristics: {
      kekerasan: '1.155 lbf (Janka Scale - Keras & Ulet)',
      warna: 'Cokelat keemasan dengan serat lurus hingga berombak eksotis',
      ketahanan: 'Kelas Awet I / Kelas Kuat II (Anti Rayap & Anti Air)',
      kadarAir: '10% - 12% (Kiln-Dried Oven Suhu Rendah)',
      massaJenis: '670 - 750 kg/m³',
      kegunaan: ['Meja Solid Slab', 'Kusen & Pintu Utama', 'Lantai Kayu Parquet', 'Furniture Outdoor & Indoor']
    },
    images: [
      'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
    ],
    priceRangeEstimate: 'Rp 22.000.000 - Rp 45.000.000 / m³ (Grade A Perhutani)',
    origin: 'Blora & Cepu, Jawa Tengah (Legal SVLK)',
    textureColorHex: '#B27638',
    roughness: 0.42,
    metalness: 0.08,
    isActive: true,
    stockStatus: 'ready',
    stockVolumeM3: 18.5,
    stockSlabsCount: 12,
    restockEstimate: 'Siap Kirim (Gudang Jepara)',
    lastStockUpdate: '2026-09-07T08:00:00.000Z',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: '66d8e101a1f0a2001e3b0002',
    name: 'Eboni (Macassar Ebony)',
    botanicalName: 'Diospyros celebica',
    slug: 'eboni',
    description: 'Kayu langka berharga tinggi endemik Sulawesi. Memiliki corak warna hitam legam pekat yang berpadu dengan guratan merah-kecokelatan yang sangat kontras dan dramatis. Densitasnya sangat padat hingga dapat tenggelam di dalam air.',
    characteristics: {
      kekerasan: '3.220 lbf (Janka Scale - Ekstra Keras)',
      warna: 'Hitam pekat dengan semburat garis merah-tembaga keemasan',
      ketahanan: 'Kelas Awet I / Kelas Kuat I (Maksimal)',
      kadarAir: '8% - 11% (Seasoning Lambat Khusus)',
      massaJenis: '1.050 - 1.200 kg/m³ (Tenggelam dalam air)',
      kegunaan: ['Koleksi Karya Seni', 'Buffet & Credenza Sultan', 'Handle Pisau/Instrumen Musik', 'Panel Dekorasi Luxury']
    },
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80'
    ],
    priceRangeEstimate: 'Rp 75.000.000 - Rp 140.000.000 / m³ (Sertifikasi Khusus)',
    origin: 'Sulawesi Tengah & Sulawesi Selatan',
    textureColorHex: '#1E1815',
    roughness: 0.25,
    metalness: 0.15,
    isActive: true,
    stockStatus: 'low_stock',
    stockVolumeM3: 3.2,
    stockSlabsCount: 3,
    restockEstimate: 'Sisa 3 Slab Utuh (Sulawesi)',
    lastStockUpdate: '2026-09-07T08:00:00.000Z',
    createdAt: '2026-08-01T08:30:00.000Z'
  },
  {
    id: '66d8e101a1f0a2001e3b0003',
    name: 'Sonokeling (Rosewood)',
    botanicalName: 'Dalbergia latifolia',
    slug: 'sonokeling',
    description: 'Kayu mewah dengan nuansa warna ungu tua kecokelatan yang anggun dan beraroma harum alami mawar. Tekstur seratnya sangat halus, mudah dipoles mengkilap, dan memiliki nilai prestise tinggi dalam industri mebel ekspor.',
    characteristics: {
      kekerasan: '1.780 lbf (Janka Scale - Sangat Keras)',
      warna: 'Cokelat kehitaman hingga ungu gelap dengan guratan alami',
      ketahanan: 'Kelas Awet I / Kelas Kuat II (Tahan Serangga Bubuk)',
      kadarAir: '10% - 12% (Oven Terstandar)',
      massaJenis: '850 - 900 kg/m³',
      kegunaan: ['Meja Makan Minimalis Modern', 'Gitar & Instrumen Akustik', 'Lemari Pakaian Elegan', 'Kerajinan Ukir Halus']
    },
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    priceRangeEstimate: 'Rp 38.000.000 - Rp 65.000.000 / m³',
    origin: 'Jawa Timur & Nusa Tenggara',
    textureColorHex: '#3D251E',
    roughness: 0.35,
    metalness: 0.1,
    isActive: true,
    stockStatus: 'ready',
    stockVolumeM3: 9.0,
    stockSlabsCount: 8,
    restockEstimate: 'Siap Kirim (Gudang Blora)',
    lastStockUpdate: '2026-09-07T08:00:00.000Z',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: '66d8e101a1f0a2001e3b0004',
    name: 'Gaharu (Agarwood)',
    botanicalName: 'Aquilaria malaccensis',
    slug: 'gaharu',
    description: 'Dikenal sebagai "Kayu Para Dewa" dengan nilai komoditas tertinggi. Gaharu terbentuk dari pembentukan gubal resin aromatik alami yang mengeluarkan aroma wangi sakral saat terkena panas. Sering dipesan untuk interior khusus, dupa eksklusif, dan dekorasi prestise.',
    characteristics: {
      kekerasan: '850 - 1.100 lbf (Bervariasi tergantung kadar resin)',
      warna: 'Cokelat kemerahan pekat hingga kehitaman resinous',
      ketahanan: 'Kelas Awet II (Aroma alami mengusir serangga)',
      kadarAir: '8% - 10% (Perawatan Natural Suhu Ruang)',
      massaJenis: '750 - 980 kg/m³ (Gubal Super)',
      kegunaan: ['Hiasan Patung / Ornamen Ritual', 'Bahan Dupa Mewah', 'Panel Aksesoris Ruang Meditasi', 'Souvenir Koleksi VVIP']
    },
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef8?auto=format&fit=crop&w=1200&q=80'
    ],
    priceRangeEstimate: 'Rp 45.000.000 - Rp 150.000.000 / kg-m³ (Tergantung Kualitas Gubal)',
    origin: 'Kalimantan Timur & Papua',
    textureColorHex: '#523424',
    roughness: 0.5,
    metalness: 0.05,
    isActive: true,
    stockStatus: 'pre_order',
    stockVolumeM3: 1.5,
    stockSlabsCount: 2,
    restockEstimate: 'Proses Oven Kiln-Dry (2–3 Minggu)',
    lastStockUpdate: '2026-09-07T08:00:00.000Z',
    createdAt: '2026-08-01T09:30:00.000Z'
  }
];
