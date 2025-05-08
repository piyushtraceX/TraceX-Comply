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
                port = "5000"  // Use port 5000 to match Replit's default
        }

        // Simple multiplexer
        mux := http.NewServeMux()

        // API routes
        mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
                cookie, hasCookie := r.Cookie("session")
                
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusOK)
                
                if !hasCookie || cookie == nil {
                        fmt.Fprintf(w, `{"status":"ok","authenticated":false,"message":"Go API server is running","timestamp":"%s","version":"1.0.0"}`, time.Now().Format(time.RFC3339))
                        return
                }
                
                // Include session info for debugging
                fmt.Fprintf(w, `{"status":"ok","authenticated":true,"sessionToken":"%s","cookieInfo":{"path":"%s","secure":%t,"httpOnly":%t,"sameSite":"%s"},"message":"Go API server is running with authentication","timestamp":"%s","version":"1.0.0"}`, 
                        cookie.Value, cookie.Path, cookie.Secure, cookie.HttpOnly, getSameSiteString(cookie.SameSite), time.Now().Format(time.RFC3339))
        })

        // Auth routes (both with /api/auth/* and legacy paths)
        // Original routes
        mux.HandleFunc("/api/auth/login", handleLogin)
        mux.HandleFunc("/api/auth/logout", handleLogout)
        mux.HandleFunc("/api/auth/me", handleGetCurrentUser)
        mux.HandleFunc("/api/auth/switch-tenant", handleSwitchTenant)
        
        // Legacy paths used by the client
        mux.HandleFunc("/api/login", handleLogin)
        mux.HandleFunc("/api/logout", handleLogout)
        mux.HandleFunc("/api/user", handleGetCurrentUser)

        // Test endpoint
        mux.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusOK)
                fmt.Fprintf(w, `{"message":"Go API test endpoint is working","timestamp":"%s"}`, time.Now().Format(time.RFC3339))
        })

        // Set up static file serving
        staticDir := os.Getenv("STATIC_DIR")
        if staticDir == "" {
                // When in development mode, use the Vite dev server files
                if os.Getenv("NODE_ENV") == "development" {
                        staticDir = "../client/dist"
                } else {
                        // In production use compiled client files
                        staticDir = "../client/dist"
                }
        }
        log.Printf("Using static directory: %s", staticDir)

        // Create a file server to serve static assets
        fileServer := http.FileServer(http.Dir(staticDir))
        
        // Handle different static file patterns
        // 1. Handle source files for Vite dev server
        mux.Handle("/src/", fileServer)
        mux.Handle("/node_modules/", fileServer)
        mux.Handle("/@fs/", fileServer)
        mux.Handle("/@vite/", fileServer)
        mux.Handle("/@react-refresh", fileServer)
        
        // 2. Handle static assets in both dev and prod
        mux.Handle("/assets/", fileServer)
        mux.Handle("/locales/", fileServer)
        
        // 3. Handle specific files
        mux.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
                http.ServeFile(w, r, filepath.Join(staticDir, "favicon.ico"))
        })

        // Specific Vite dev server endpoints
        mux.HandleFunc("/@vite/client", func(w http.ResponseWriter, r *http.Request) {
                // In development mode, proxy this to the Vite dev server
                http.Redirect(w, r, "https://8d9e1fd6-0f97-43eb-adcd-2f98ad7d8288-00-3o9u7z9m8zzsa.worf.replit.dev/@vite/client", http.StatusTemporaryRedirect)
        })
        
        mux.HandleFunc("/@react-refresh", func(w http.ResponseWriter, r *http.Request) {
                // In development mode, proxy this to the Vite dev server
                http.Redirect(w, r, "https://8d9e1fd6-0f97-43eb-adcd-2f98ad7d8288-00-3o9u7z9m8zzsa.worf.replit.dev/@react-refresh", http.StatusTemporaryRedirect)
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

                // In development, proxy to the Vite dev server for source files
                if os.Getenv("NODE_ENV") == "development" && (
                        strings.HasPrefix(r.URL.Path, "/src/") ||
                        strings.HasPrefix(r.URL.Path, "/node_modules/") ||
                        strings.HasPrefix(r.URL.Path, "/@fs/") ||
                        strings.HasPrefix(r.URL.Path, "/@vite/") ||
                        strings.HasPrefix(r.URL.Path, "/@react-refresh") ||
                        r.URL.Path == "/main.tsx") {
                        targetURL := fmt.Sprintf("https://8d9e1fd6-0f97-43eb-adcd-2f98ad7d8288-00-3o9u7z9m8zzsa.worf.replit.dev%s", r.URL.Path)
                        http.Redirect(w, r, targetURL, http.StatusTemporaryRedirect)
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
                // Set CORS headers - allow any origin in development
                origin := r.Header.Get("Origin")
                
                // Always allow any origin in development
                if origin != "" {
                        w.Header().Set("Access-Control-Allow-Origin", origin)
                } else {
                        // For APIs, we need to be explicit about the allowed origins when credentials are used
                        w.Header().Set("Access-Control-Allow-Origin", "https://8d9e1fd6-0f97-43eb-adcd-2f98ad7d8288-00-3o9u7z9m8zzsa.worf.replit.dev")
                }
                
                // Set very permissive CORS headers for development
                w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
                w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With, Set-Cookie, Cookie")
                w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Set-Cookie")
                w.Header().Set("Access-Control-Allow-Credentials", "true")
                w.Header().Set("Access-Control-Max-Age", "3600")

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
        // Log the request details for debugging
        log.Printf("Login request from: %s, Method: %s", r.RemoteAddr, r.Method)
        
        if r.Method != "POST" {
                w.WriteHeader(http.StatusMethodNotAllowed)
                return
        }
        
        // Set CORS headers specifically for the login endpoint
        origin := r.Header.Get("Origin")
        if origin != "" {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                w.Header().Set("Access-Control-Allow-Credentials", "true")
        }
        
        // Add cache control headers to prevent caching
        w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
        w.Header().Set("Pragma", "no-cache")
        w.Header().Set("Expires", "0")
        
        // Log cookie settings for debugging
        cookie := &http.Cookie{
                Name:     "session",
                Value:    "auth-session-" + time.Now().Format("20060102150405"), // Add timestamp to make it unique
                Path:     "/",
                MaxAge:   3600 * 24, // 1 day
                HttpOnly: true,
                Secure:   false, // Disable secure for development
                SameSite: http.SameSiteNoneMode, // Allow cross-site cookies in development
        }
        
        log.Printf("Setting cookie - Name: %s, Value: %s, Path: %s, Secure: %t, HttpOnly: %t, SameSite: %s", 
                cookie.Name, cookie.Value, cookie.Path, cookie.Secure, cookie.HttpOnly, getSameSiteString(cookie.SameSite))
        
        http.SetCookie(w, cookie)
        
        // Return user data
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        
        // Include the auth token in the response body as well for client-side storage
        fmt.Fprintf(w, `{"user":{"id":1,"username":"demouser","name":"Demo User","email":"demo@example.com","isSuperAdmin":true},"auth":{"token":"%s","expiresIn":86400}}`, cookie.Value)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
        if r.Method != "POST" {
                w.WriteHeader(http.StatusMethodNotAllowed)
                return
        }

        // Clear the session cookie
        http.SetCookie(w, &http.Cookie{
                Name:     "session",
                Value:    "",
                Path:     "/",
                MaxAge:   -1, // Delete the cookie
                HttpOnly: true,
                Secure:   false, // Disable secure for development
                SameSite: http.SameSiteNoneMode, // Allow cross-site cookies in development
        })

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        fmt.Fprint(w, `{"message":"Logged out successfully"}`)
}

func handleGetCurrentUser(w http.ResponseWriter, r *http.Request) {
        // Log the request details for debugging
        log.Printf("GetCurrentUser request from: %s, Method: %s", r.RemoteAddr, r.Method)
        
        if r.Method != "GET" {
                w.WriteHeader(http.StatusMethodNotAllowed)
                return
        }
        
        // Set CORS headers specifically for this endpoint
        origin := r.Header.Get("Origin")
        if origin != "" {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                w.Header().Set("Access-Control-Allow-Credentials", "true")
        }
        
        // Log all request headers for debugging
        log.Printf("Request headers:")
        for name, values := range r.Header {
                log.Printf("  %s: %v", name, values)
        }
        
        // Check for an Authorization header or cookie
        authHeader, hasAuth := r.Header["Authorization"]
        cookie, hasCookie := r.Cookie("session")
        
        log.Printf("Auth check - HasAuthHeader: %t, HasCookie: %t", hasAuth, hasCookie)
        
        // First check cookie-based authentication
        var isAuthenticated bool = false
        
        if hasCookie && cookie != nil {
                log.Printf("Session cookie - Name: %s, Value: %s, Path: %s, Secure: %t, HttpOnly: %t, SameSite: %s",
                        cookie.Name, cookie.Value, cookie.Path, cookie.Secure, cookie.HttpOnly, getSameSiteString(cookie.SameSite))
                
                // Validate cookie value (would be more complex in a real app)
                if strings.HasPrefix(cookie.Value, "auth-session") || cookie.Value == "dummy-session-token" {
                        log.Printf("Authentication successful via cookie")
                        isAuthenticated = true
                }
        }
        
        // Then check token-based authentication if cookie failed
        if !isAuthenticated && hasAuth {
                log.Printf("Attempting token-based authentication")
                log.Printf("Auth header: %v", authHeader)
                
                authToken := authHeader[0]
                if strings.HasPrefix(authToken, "Bearer ") {
                        token := strings.TrimPrefix(authToken, "Bearer ")
                        log.Printf("Extracted token: %s", token)
                        
                        // Validate token (would be more complex in a real app)
                        if strings.HasPrefix(token, "auth-session") {
                                log.Printf("Authentication successful via token")
                                isAuthenticated = true
                        }
                }
        }
        
        // If no valid authentication is present, return 401
        if !isAuthenticated {
                log.Printf("Authentication failed - returning 401")
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusUnauthorized)
                fmt.Fprint(w, `{"error":"Not authenticated"}`)
                return
        }

        // Add cache control headers
        w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
        w.Header().Set("Pragma", "no-cache")
        
        // Return mock user data (this would be fetched from database in a real app)
        log.Printf("Authentication successful - returning user data")
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        fmt.Fprint(w, `{"user":{"id":1,"username":"demouser","name":"Demo User","email":"demo@example.com","isSuperAdmin":true}}`)
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

// Helper function to convert SameSite mode to string
func getSameSiteString(sameSite http.SameSite) string {
        switch sameSite {
        case http.SameSiteDefaultMode:
                return "Default"
        case http.SameSiteNoneMode:
                return "None"
        case http.SameSiteLaxMode:
                return "Lax"
        case http.SameSiteStrictMode:
                return "Strict"
        default:
                return "Unknown"
        }
}