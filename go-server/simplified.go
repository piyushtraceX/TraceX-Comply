package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	// Set default port if not provided
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Simple multiplexer
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","message":"Go API server is running","timestamp":"%s","version":"1.0.0"}`, time.Now().Format(time.RFC3339))
	})

	// Auth routes
	mux.HandleFunc("/api/auth/login", handleLogin)
	mux.HandleFunc("/api/auth/logout", handleLogout)
	mux.HandleFunc("/api/auth/me", handleGetCurrentUser)
	mux.HandleFunc("/api/auth/switch-tenant", handleSwitchTenant)

	// Test endpoint
	mux.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"message":"Go API test endpoint is working","timestamp":"%s"}`, time.Now().Format(time.RFC3339))
	})

	// Set up static file serving
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "../client/dist"
	}

	// Serve static files
	fileServer := http.FileServer(http.Dir(staticDir))
	mux.Handle("/assets/", fileServer)
	mux.Handle("/src/", fileServer)
	mux.Handle("/node_modules/", fileServer)
	mux.Handle("/@fs/", fileServer)
	mux.Handle("/locales/", fileServer)
	mux.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(staticDir, "favicon.ico"))
	})

	// Handle SPA routes - serve index.html for any unmatched route
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Skip API routes which are handled separately
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprintf(w, `{"error":"API endpoint not found"}`)
			return
		}

		// For known static assets, return 404 if not found
		if strings.HasPrefix(r.URL.Path, "/assets/") ||
			strings.HasPrefix(r.URL.Path, "/src/") ||
			strings.HasPrefix(r.URL.Path, "/node_modules/") ||
			strings.HasPrefix(r.URL.Path, "/@fs/") ||
			strings.HasPrefix(r.URL.Path, "/locales/") {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		// Otherwise serve index.html for client-side routing
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})

	// Set up middleware for CORS
	handler := corsMiddleware(mux)

	// Start server
	serverAddr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Server running on %s", serverAddr)
	log.Printf("Serving static files from: %s", staticDir)
	if err := http.ListenAndServe(serverAddr, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, Set-Cookie, Cookie")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Set-Cookie")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Pass request to the next handler
		next.ServeHTTP(w, r)
	})
}

// Auth handlers
func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// In a real app, you would parse the request body and validate credentials
	// For demo, accept any credentials
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"user":{"id":1,"username":"demouser","name":"Demo User","email":"demo@example.com"}}`)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"message":"Logged out successfully"}`)
}

func handleGetCurrentUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"user":{"id":1,"username":"demouser","name":"Demo User","email":"demo@example.com"}}`)
}

func handleSwitchTenant(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// In a real app, you would parse the request body to get tenantId
	// For demo, return a fixed tenant
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"tenant":{"id":1,"name":"Tenant 1","description":"Demo tenant"}}`)
}