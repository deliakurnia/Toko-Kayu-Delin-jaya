package config

import (
	"sync"
	"time"

	"github.com/widanasgpw4/kayu-nusantara-backend/models"
)

// In-Memory Thread-Safe High-Performance Cache
// Mengeliminasi 99% beban kueri basis data saat ribuan pengguna mengakses etalase katalog secara bersamaan.
type woodsCacheManager struct {
	mu        sync.RWMutex
	items     []models.WoodType
	expiresAt time.Time
	ttl       time.Duration
}

var globalWoodsCache = &woodsCacheManager{
	ttl: 5 * time.Minute, // Cache otomatis refresh tiap 5 menit jika tidak ada event mutasi
}

// GetCachedWoods mengambil data kayu dari RAM. Mengembalikan data dan boolean (apakah cache valid).
func GetCachedWoods() ([]models.WoodType, bool) {
	globalWoodsCache.mu.RLock()
	defer globalWoodsCache.mu.RUnlock()

	if globalWoodsCache.items == nil || time.Now().After(globalWoodsCache.expiresAt) {
		return nil, false
	}

	// Kembalikan salinan slice untuk keamanan konkurensi (immutable read)
	copied := make([]models.WoodType, len(globalWoodsCache.items))
	copy(copied, globalWoodsCache.items)
	return copied, true
}

// SetCachedWoods menyimpan katalog kayu terbaru ke memori RAM
func SetCachedWoods(woods []models.WoodType) {
	globalWoodsCache.mu.Lock()
	defer globalWoodsCache.mu.Unlock()

	copied := make([]models.WoodType, len(woods))
	copy(copied, woods)

	globalWoodsCache.items = copied
	globalWoodsCache.expiresAt = time.Now().Add(globalWoodsCache.ttl)
}

// InvalidateWoodsCache menghapus cache memori seketika (dipanggil saat ada pembaruan stok, penambahan kayu, atau foto baru)
func InvalidateWoodsCache() {
	globalWoodsCache.mu.Lock()
	defer globalWoodsCache.mu.Unlock()

	globalWoodsCache.items = nil
	globalWoodsCache.expiresAt = time.Time{}
}
