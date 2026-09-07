import { ProductCategory } from '../types';

export const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat_01',
    name: 'Meja (Table & Desk)',
    slug: 'meja',
    description: 'Meja makan solid slab natural edge (live edge), meja kerja eksekutif, hingga coffee table minimalis dengan sambungan tradisional dowel/mortise & tenon tanpa paku.',
    referenceImages: [
      'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: '200 x 90 x 78 cm (Custom Sesuai Ruangan)',
    estimatedCraftTime: '14 - 21 Hari Kerja',
    isActive: true
  },
  {
    id: 'cat_02',
    name: 'Buffet & Credenza',
    slug: 'buffet',
    description: 'Cabinet buffet ruang tamu dan ruang keluarga dengan pintu geser kayu masif bertekstur, laci soft-closing, serta finishing natural doff atau satin elegan.',
    referenceImages: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: '180 x 45 x 85 cm',
    estimatedCraftTime: '18 - 25 Hari Kerja',
    isActive: true
  },
  {
    id: 'cat_03',
    name: 'Lemari (Wardrobe & Display)',
    slug: 'lemari',
    description: 'Lemari pakaian 2-4 pintu kayu jati/sonokeling solid, lemari pajangan kaca berbingkai kayu presisi tinggi, dan lemari buku perpustakaan pribadi.',
    referenceImages: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: '160 x 60 x 210 cm',
    estimatedCraftTime: '21 - 30 Hari Kerja',
    isActive: true
  },
  {
    id: 'cat_04',
    name: 'Bangku & Kursi (Bench & Seating)',
    slug: 'bangku',
    description: 'Bangku taman kayu utuh, kursi makan ergonomis dengan dudukan lekuk natural, dan lounge chair santai dengan proporsi arsitektural.',
    referenceImages: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: '150 x 40 x 45 cm',
    estimatedCraftTime: '10 - 14 Hari Kerja',
    isActive: true
  },
  {
    id: 'cat_05',
    name: 'Hiasan & Dekorasi (Art Decor)',
    slug: 'hiasan',
    description: 'Panel dinding akustik kayu berukir modern, patung kayu artistik, vas kayu bubut, hingga ornamen display eksklusif dari kayu gaharu & eboni pilihan.',
    referenceImages: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: 'Custom / Sesuai Sketsa',
    estimatedCraftTime: '7 - 14 Hari Kerja',
    isActive: true
  },
  {
    id: 'cat_06',
    name: 'Lainnya (Custom Khusus)',
    slug: 'lainnya',
    description: 'Proyek arsitektural kustom seperti tangga melayang kayu masif, ceiling panel kayu, pintu gebyok kontemporer, atau furniture spesifikasi arsitek.',
    referenceImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    typicalDimensions: 'Sesuai BoQ / Gambar Kerja',
    estimatedCraftTime: 'Fleksibel Sesuai Skala',
    isActive: true
  }
];
