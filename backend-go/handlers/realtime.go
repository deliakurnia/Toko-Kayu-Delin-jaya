package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

// SSEMessage merepresentasikan paket pesan event real-time
type SSEMessage struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
	Time  time.Time   `json:"time"`
}

// SSEBroker mengelola koneksi client streaming text/event-stream
type SSEBroker struct {
	mu      sync.RWMutex
	clients map[chan SSEMessage]bool
}

// GlobalBroker adalah instance singleton broker real-time SSE aplikasi
var GlobalBroker = NewSSEBroker()

// NewSSEBroker membuat broker baru yang aman dari konkurensi (thread-safe)
func NewSSEBroker() *SSEBroker {
	return &SSEBroker{
		clients: make(map[chan SSEMessage]bool),
	}
}

// AddClient mendaftarkan koneksi streaming baru
func (b *SSEBroker) AddClient() chan SSEMessage {
	b.mu.Lock()
	defer b.mu.Unlock()
	ch := make(chan SSEMessage, 32)
	b.clients[ch] = true
	log.Printf("📡 [SSE Broker] Klien baru terhubung. Total subscriber aktif: %d", len(b.clients))
	return ch
}

// RemoveClient mencabut koneksi streaming
func (b *SSEBroker) RemoveClient(ch chan SSEMessage) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if _, ok := b.clients[ch]; ok {
		delete(b.clients, ch)
		close(ch)
		log.Printf("🔌 [SSE Broker] Klien terputus. Total subscriber aktif: %d", len(b.clients))
	}
}

// Broadcast mengirimkan event ke seluruh client yang aktif seketika
func (b *SSEBroker) Broadcast(event string, data interface{}) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	msg := SSEMessage{
		Event: event,
		Data:  data,
		Time:  time.Now(),
	}

	for ch := range b.clients {
		select {
		case ch <- msg:
		default:
			// Client buffer penuh, skip agar tidak memblokir antrean server
		}
	}
	log.Printf("⚡ [SSE Broadcast] Event '%s' disiarkan ke %d subscriber", event, len(b.clients))
}

// RealtimeStreamHandler menangani endpoint streaming GET /api/v1/realtime/stream
func RealtimeStreamHandler(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")
	c.Set("Access-Control-Allow-Origin", "*")

	clientChan := GlobalBroker.AddClient()

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		defer GlobalBroker.RemoveClient(clientChan)

		// 1. Kirim handshake event selamat datang
		connectMsg, _ := json.Marshal(map[string]interface{}{
			"status":    "connected",
			"stream":    "kayu-nusantara-inventory-stream",
			"timestamp": time.Now(),
		})
		if _, err := fmt.Fprintf(w, "event: CONNECTED\ndata: %s\n\n", connectMsg); err != nil {
			return
		}
		if err := w.Flush(); err != nil {
			return
		}

		// 2. Heartbeat interval untuk menjaga saluran TCP tetap hidup melintasi proxy/firewall
		heartbeatTicker := time.NewTicker(15 * time.Second)
		defer heartbeatTicker.Stop()

		for {
			select {
			case <-heartbeatTicker.C:
				if _, err := fmt.Fprintf(w, ": ping\n\n"); err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}

			case msg, ok := <-clientChan:
				if !ok {
					return
				}
				dataBytes, err := json.Marshal(msg.Data)
				if err != nil {
					continue
				}
				if _, err := fmt.Fprintf(w, "event: %s\ndata: %s\n\n", msg.Event, string(dataBytes)); err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			}
		}
	})

	return nil
}
