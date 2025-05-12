package main

import (
        "fmt"
        "log"
        "net/http"
        "os"
        "path/filepath"
        "strings"

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

        // Initialize Casdoor SDK
        casdoorsdk.InitConfig(casdoorEndpoint, casdoorClientID, casdoorClientSecret, casdoorJwtSecret)
        
        log.Printf("Casdoor OAuth configured with endpoint: %s", casdoorEndpoint)
}

func main() {
        // Set up logging
        log.SetFlags(log.LstdFlags | log.Lshortfile)
        log.Println("Starting Go server...")

        // Initialize Casdoor for authentication
        initCasdoor()
        
        // Set up Gin router
        router := gin.Default()

        // Configure CORS
        config := cors.DefaultConfig()
        config.AllowOrigins = []string{"*"}
        config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
        config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
        config.AllowCredentials = true
        router.Use(cors.New(config))

        // Set up API routes
        api := router.Group("/api")
        {
                api.GET("/health", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{"status": "OK", "message": "Go server is running"})
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
                        
                        // Get application ID from client ID
                        clientID := os.Getenv("CASDOOR_CLIENT_ID")
                        
                        // Set default callback URL for local development
                        callbackURL := "http://localhost:5000/api/auth/callback"
                        if appURL := os.Getenv("APP_URL"); appURL != "" {
                                callbackURL = fmt.Sprintf("%s/api/auth/callback", appURL)
                        }
                        
                        // Generate the OAuth URL using Casdoor SDK
                        state := "complimate-eudr" // Should be randomized in production
                        scope := "read,profile"
                        authURL := casdoorsdk.GetSigninUrl(callbackURL, state, scope)
                        
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
                        c.SetCookie(
                                "casdoor_token",
                                token.AccessToken,
                                int(token.ExpiresIn), // Max age in seconds
                                "/",
                                "",
                                false, // Secure
                                true, // HTTP only
                        )
                        
                        // Redirect back to frontend
                        c.Redirect(http.StatusTemporaryRedirect, "/")
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
