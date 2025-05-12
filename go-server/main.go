package main

import (
        "fmt"
        "log"
        "net/http"
        "os"
        "path/filepath"
        "strings"
        "time"

        "github.com/gin-contrib/cors"
        "github.com/gin-contrib/static"
        "github.com/gin-gonic/gin"
        "github.com/casdoor/casdoor-go-sdk/casdoorsdk"

        // No need to import local auth package anymore
)

// initCasdoor initializes the Casdoor SDK
func initCasdoor() {
        // Set up Casdoor provider with enterprise hosted Casdoor
        casdoorEndpoint := os.Getenv("CASDOOR_ENDPOINT")
        casdoorClientID := os.Getenv("CASDOOR_CLIENT_ID")
        casdoorClientSecret := os.Getenv("CASDOOR_CLIENT_SECRET")
        casdoorJwtSecret := os.Getenv("CASDOOR_JWT_SECRET")

        // Use default enterprise Casdoor endpoint if not set
        if casdoorEndpoint == "" {
                casdoorEndpoint = "https://tracextech.casdoor.com"
        }

        // Check if required credentials are available
        if casdoorClientID == "" || casdoorClientSecret == "" {
                log.Println("Warning: Casdoor client ID or secret not set. OAuth login will not work properly.")
                return
        }

        // Default JWT secret if not provided
        if casdoorJwtSecret == "" {
                casdoorJwtSecret = "jwt-secret-for-tracextech-casdoor"
        }

        // Additional required parameters for SDK initialization
        // Organization and Application names from Client ID (format: organization/application)
        orgName := "tracextech"     // Default organization name
        appName := "eudr-complimate" // Default application name
        
        if parts := strings.Split(casdoorClientID, "/"); len(parts) == 2 {
                orgName = parts[0]
                appName = parts[1]
        }

        // Initialize Casdoor SDK with all required parameters
        casdoorsdk.InitConfig(casdoorEndpoint, casdoorClientID, casdoorClientSecret, casdoorJwtSecret, orgName, appName)
        
        log.Printf("Casdoor OAuth configured with endpoint: %s for organization: %s and application: %s", casdoorEndpoint, orgName, appName)
}

func main() {
        // Set up logging
        log.SetFlags(log.LstdFlags | log.Lshortfile)
        log.Println("Starting Go server...")

        // Initialize Casdoor for authentication
        initCasdoor()
        
        // Set up Gin router
        router := gin.Default()

        // Configure CORS - Allow all origins in development mode
        router.Use(cors.New(cors.Config{
                AllowOrigins:     []string{"*"},
                AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
                AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
                AllowCredentials: true,
                MaxAge:           12 * time.Hour,
        }))

        // Add a root health check endpoint for direct server testing
        router.GET("/health", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                        "status": "OK", 
                        "message": "Go server root health check",
                        "server": "Go",
                        "timestamp": time.Now().Format(time.RFC3339),
                })
        })
        
        // Set up API routes
        api := router.Group("/api")
        {
                // Debug middleware to log all API requests
                api.Use(func(c *gin.Context) {
                        log.Printf("API Request: %s %s from %s", c.Request.Method, c.Request.URL.Path, c.ClientIP())
                        c.Next()
                })
                api.GET("/health", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{
                                "status": "OK", 
                                "message": "Go server is running",
                                "server": "Go",
                                "timestamp": time.Now().Format(time.RFC3339),
                        })
                })

                // For now, let's implement simple mock auth endpoints
                // This avoids database complexity while still providing Casdoor integration
                
                // Mock login endpoint
                api.POST("/auth/login", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{
                                "user": gin.H{
                                        "id":          1,
                                        "username":    "demo",
                                        "email":       "demo@example.com",
                                        "displayName": "Demo User",
                                        "tenantId":    1,
                                        "isActive":    true,
                                        "isSuperAdmin": true,
                                },
                                "token": "mock-jwt-token-123456",
                        })
                })

                // Mock get current user endpoint
                api.GET("/auth/me", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{
                                "user": gin.H{
                                        "id":          1,
                                        "username":    "demo",
                                        "email":       "demo@example.com",
                                        "displayName": "Demo User",
                                        "tenantId":    1,
                                        "isActive":    true,
                                        "isSuperAdmin": true,
                                },
                        })
                })

                // Mock logout endpoint
                api.POST("/auth/logout", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
                })

                // Casdoor OAuth route - redirects to Casdoor login
                api.GET("/auth/casdoor", func(c *gin.Context) {
                        casdoorEndpoint := os.Getenv("CASDOOR_ENDPOINT")
                        if casdoorEndpoint == "" {
                                casdoorEndpoint = "https://tracextech.casdoor.com"
                        }
                        
                        // Set base URL for callbacks, considering various environments
                        baseURL := "http://localhost:5000" // Express server is our public-facing endpoint
                        
                        // Get requested Host (might be from Express or direct to Go)
                        requestHost := c.Request.Host
                        
                        // Check for Replit or production environment
                        if strings.Contains(requestHost, "replit.dev") || strings.Contains(requestHost, ".app") {
                                // In Replit, our callback must go to the Express server which is publicly accessible
                                protocol := "https"
                                
                                // Try to get X-Forwarded-Host which would be the public-facing hostname
                                forwardedHost := c.Request.Header.Get("X-Forwarded-Host")
                                if forwardedHost != "" {
                                        requestHost = forwardedHost
                                }
                                
                                baseURL = fmt.Sprintf("%s://%s", protocol, requestHost)
                                log.Printf("Replit environment detected, using base URL: %s", baseURL)
                        }
                        
                        // Construct final callback URL with the /api/auth/callback path
                        // The Express server will proxy this to the Go server
                        callbackURL := fmt.Sprintf("%s/api/auth/callback", baseURL)
                        log.Printf("Using callback URL: %s (base: %s)", callbackURL, baseURL)
                        
                        log.Printf("Using Casdoor callback URL: %s", callbackURL)
                        
                        // Generate the OAuth URL using Casdoor SDK
                        // Note: The SDK function only takes callbackURL parameter in this version
                        authURL := casdoorsdk.GetSigninUrl(callbackURL)
                        
                        log.Printf("Redirecting to Casdoor URL: %s", authURL)
                        c.Redirect(http.StatusTemporaryRedirect, authURL)
                })

                // Casdoor callback handler
                api.GET("/auth/callback", func(c *gin.Context) {
                        code := c.Query("code")
                        state := c.Query("state")
                        
                        if code == "" {
                                c.JSON(http.StatusBadRequest, gin.H{"error": "No authorization code provided"})
                                return
                        }
                        
                        log.Printf("Received callback with code: %s and state: %s", code, state)
                        
                        // Exchange authorization code for token
                        token, err := casdoorsdk.GetOAuthToken(code, state)
                        if err != nil {
                                log.Printf("Error getting token: %v", err)
                                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get access token"})
                                return
                        }
                        
                        // Get user info from Casdoor
                        claims, err := casdoorsdk.ParseJwtToken(token.AccessToken)
                        if err != nil {
                                log.Printf("Error parsing JWT: %v", err)
                                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user token"})
                                return
                        }
                        
                        log.Printf("User authenticated: %s", claims.Name)
                        
                        // Create a cookie with the access token
                        // token.ExpiresIn isn't available, use a fixed expiration time
                        expiresInSeconds := 3600 // 1 hour
                        
                        c.SetCookie(
                                "casdoor_token",
                                token.AccessToken,
                                expiresInSeconds,
                                "/",
                                c.Request.Host, // Set the domain to the request host
                                false, // Secure should be true in production
                                true, // HTTP only
                        )
                        
                        // Also create a session cookie
                        c.SetCookie(
                                "session",
                                token.AccessToken,
                                expiresInSeconds,
                                "/",
                                c.Request.Host, // Set the domain to the request host
                                false, // Secure should be true in production
                                false, // Allow JavaScript access
                        )
                        
                        // For the redirect back to the app after successful authentication,
                        // we need to determine the base URL of our Express server (the frontend entry point)
                        var baseURL string
                        var dashboardPath = "/dashboard" // Specific route to redirect to
                        
                        // Determine if we're in Replit environment
                        host := c.Request.Host
                        if strings.Contains(host, "replit.dev") || strings.Contains(host, ".app") {
                                // For Replit, construct full URL with https
                                protocol := "https"
                                baseURL = fmt.Sprintf("%s://%s", protocol, host)
                        } else {
                                // Local development - use the Express server
                                baseURL = "http://localhost:5000"
                        }
                        
                        // Construct the dashboard redirect URL
                        redirectTo := baseURL + dashboardPath
                        
                        log.Printf("Authentication successful, redirecting to dashboard: %s", redirectTo)
                        c.Redirect(http.StatusTemporaryRedirect, redirectTo)
                })
        }

        // Set the path to the React app build directory
        reactBuildDir := "../client/dist"
        
        // Check if the directory exists
        if _, err := os.Stat(reactBuildDir); os.IsNotExist(err) {
                log.Printf("React build directory not found at: %s", reactBuildDir)
                log.Println("Using default static content...")
                
                // Fallback to serving a simple HTML message
                router.GET("/", func(c *gin.Context) {
                        c.Data(http.StatusOK, "text/html", []byte(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                                <title>Complimate EUDR</title>
                                <style>
                                        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                                        h1 { color: #2563eb; }
                                        p { margin: 20px 0; }
                                </style>
                        </head>
                        <body>
                                <h1>Go Server is Running</h1>
                                <p>The React frontend has not been built yet. Please run:</p>
                                <pre>cd client && npm run build</pre>
                                <p>Then restart this server.</p>
                        </body>
                        </html>
                        `))
                })
        } else {
                // Serve static files from React build
                router.Use(static.Serve("/", static.LocalFile(reactBuildDir, true)))

                // Handle React router paths - send all unmatched routes to index.html
                router.NoRoute(func(c *gin.Context) {
                        // Check if the path appears to be an API call
                        if strings.HasPrefix(c.Request.URL.Path, "/api/") {
                                c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
                                return
                        }

                        // For all other routes, serve the React app
                        indexPath := filepath.Join(reactBuildDir, "index.html")
                        c.File(indexPath)
                })
        }

        // Get port from environment variable or use default
        port := os.Getenv("GO_PORT")
        if port == "" {
                port = "8081" // Default port
        }

        // Start server
        addr := fmt.Sprintf("0.0.0.0:%s", port)
        log.Printf("Starting server on %s...", addr)
        if err := router.Run(addr); err != nil {
                log.Fatalf("Failed to start server: %v", err)
        }
}
