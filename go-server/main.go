package main

import (
        "fmt"
        "log"
        "net/http"
        "net/url"
        "os"
        "path/filepath"
        "strings"
        "time"

        "github.com/gin-contrib/cors"
        "github.com/gin-contrib/static"
        "github.com/gin-gonic/gin"
        "github.com/casdoor/casdoor-go-sdk/casdoorsdk"
        jwt "github.com/golang-jwt/jwt/v4"
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
        
        // Dump important environment variables for debugging
        log.Println("==== ENVIRONMENT VARIABLES ====")
        log.Printf("REPLIT_DOMAINS = '%s'", os.Getenv("REPLIT_DOMAINS"))
        log.Printf("REPL_ID = '%s'", os.Getenv("REPL_ID"))
        log.Printf("REPL_SLUG = '%s'", os.Getenv("REPL_SLUG"))
        log.Printf("REPL_OWNER = '%s'", os.Getenv("REPL_OWNER"))
        log.Printf("GO_PORT = '%s'", os.Getenv("GO_PORT"))
        log.Println("====== BUILD VERSION 02 ======")
        log.Println("Changes: Manual URL construction with URL escape fix")
        log.Println("===============================")
        log.Println("===============================")

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
                
                // Login endpoint
                api.POST("auth/login", func(c *gin.Context) {
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

                // User info endpoint
                api.GET("auth/me", func(c *gin.Context) {
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

                // Logout endpoint
                api.POST("auth/logout", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
                })

                // Casdoor OAuth route - redirects to Casdoor login
                api.GET("auth/casdoor", func(c *gin.Context) {
                        // Debug: Dump all headers to help with debugging
                        log.Printf("==== CASDOOR REQUEST HEADERS ====")
                        for name, values := range c.Request.Header {
                            for _, value := range values {
                                log.Printf("  %s: %s", name, value)
                            }
                        }
                        log.Printf("=================================")
                        
                        // Debug REPLIT_DOMAINS environment variable again
                        replitDomains := os.Getenv("REPLIT_DOMAINS") 
                        log.Printf("CASDOOR HANDLER: REPLIT_DOMAINS env = '%s'", replitDomains)
                        
                        casdoorEndpoint := os.Getenv("CASDOOR_ENDPOINT")
                        if casdoorEndpoint == "" {
                                casdoorEndpoint = "https://tracextech.casdoor.com"
                        }
                        
                        // Determine callback URL based on environment
                        var baseURL string
                        
                        // First, check for environment variables (most reliable)
                        replitDomainsEnv := os.Getenv("REPLIT_DOMAINS")
                        log.Printf("DEBUG: REPLIT_DOMAINS env var = '%s'", replitDomainsEnv)
                        
                        if replitDomainsEnv != "" {
                            baseURL = fmt.Sprintf("https://%s", replitDomainsEnv)
                            log.Printf("Using Replit Domains from environment variable: %s", baseURL)
                        } else {
                            // Fall back to headers if environment variables aren't available
                            // Get requested Host and headers
                            host := c.Request.Host
                            forwardedHost := c.GetHeader("X-Forwarded-Host")
                            forwardedProto := c.GetHeader("X-Forwarded-Proto")
                            
                            // Check for custom headers from Express
                            replitDomain := c.GetHeader("X-Replit-Domain")
                            replitDomainsFromHeader := c.GetHeader("X-Replit-Domains-Env")
                            
                            // Log all headers for debugging
                            log.Printf("Host headers: Host=%s, X-Forwarded-Host=%s, X-Forwarded-Proto=%s", 
                                host, forwardedHost, forwardedProto)
                            log.Printf("Custom headers: X-Replit-Domain=%s, X-Replit-Domains-Env=%s", 
                                replitDomain, replitDomainsFromHeader)
                            
                            // If Express passed the env var as a header, use it
                            if replitDomainsFromHeader != "" {
                                // Override the env var with what Express sent us
                                replitDomainsEnv = replitDomainsFromHeader
                                log.Printf("IMPORTANT: Got REPLIT_DOMAINS from Express header: %s", replitDomainsFromHeader)
                            }
                            
                            // If Express sent us a domain, use it
                            if replitDomain != "" {
                                baseURL = replitDomain
                                log.Printf("Using domain from Express header: %s", baseURL)
                            } else if strings.Contains(host, "replit") || strings.Contains(host, ".app") || 
                               strings.Contains(host, "repl.co") {
                                // We're in Replit environment
                                // Default to https in Replit environment
                                protocol := "https"
                                if forwardedProto != "" {
                                    protocol = forwardedProto
                                }
                                
                                // Determine the hostname for callback
                                if forwardedHost != "" {
                                    host = forwardedHost
                                }
                                
                                baseURL = fmt.Sprintf("%s://%s", protocol, host)
                                log.Printf("Replit environment detected, using base URL: %s", baseURL)
                            } else {
                                // Local development - Express server is the entry point
                                baseURL = "http://localhost:5000"
                                log.Printf("Local development environment detected, using base URL: %s", baseURL)
                            }
                        }
                        
                        // Get current host from request for better domain detection
                        currentHost := c.Request.Host
                        forwardedHostHeader := c.GetHeader("X-Forwarded-Host")
                        currentReplitDomain := c.GetHeader("X-Replit-Domain")
                        
                        // Determine if we're in a Replit environment for better callback URL handling
                        isReplit := strings.Contains(currentHost, "replit") || 
                                   strings.Contains(currentHost, ".app") || 
                                   strings.Contains(currentHost, ".repl.co")
                        
                        // Check custom headers as well
                        replitDomainsFromHeader := c.GetHeader("X-Replit-Domains-Env")
                        if replitDomainsFromHeader != "" {
                            isReplit = true
                            // If Express passed the env var via header, use it
                            replitDomainsEnv = replitDomainsFromHeader
                            log.Printf("IMPORTANT: Got REPLIT_DOMAINS from Express header: %s", replitDomainsFromHeader)
                        }
                                   
                        var callbackURL string
                        
                        // IMPORTANT: Fixed callback URL construction
                        // Force Replit domain in Replit environment, regardless of other settings
                        replitDomainsEnv = os.Getenv("REPLIT_DOMAINS")
                        if replitDomainsEnv != "" && replitDomainsEnv != "undefined" {
                            // We're 100% in a Replit environment - use REPLIT_DOMAINS env var
                            log.Printf("REPLIT ENVIRONMENT CONFIRMED via REPLIT_DOMAINS env var")
                            callbackURL = fmt.Sprintf("https://%s/api/auth/callback", replitDomainsEnv)
                            log.Printf("Using REPLIT_DOMAINS env var for callback URL: %s", callbackURL)
                        } else if isReplit {
                            log.Printf("REPLIT ENVIRONMENT DETECTED but missing REPLIT_DOMAINS")
                            
                            // Try different sources for the domain name, in order of reliability
                            var domain string
                            
                            if replitDomainsFromHeader != "" {
                                // First choice: header from Express
                                domain = replitDomainsFromHeader
                                log.Printf("Using domain from X-Replit-Domains-Env header: %s", domain)
                            } else if currentReplitDomain != "" {
                                // Second choice: header from Express
                                domain = strings.TrimPrefix(currentReplitDomain, "https://")
                                domain = strings.TrimPrefix(domain, "http://")
                                log.Printf("Using domain from X-Replit-Domain header: %s", domain)
                            } else if forwardedHostHeader != "" {
                                // Third choice: X-Forwarded-Host header
                                domain = forwardedHostHeader
                                log.Printf("Using domain from X-Forwarded-Host: %s", domain)
                            } else {
                                // Last resort: the host header
                                domain = currentHost
                                log.Printf("Using domain from Host header: %s", domain)
                            }
                            
                            // Construct the callback URL with the Replit domain
                            callbackURL = fmt.Sprintf("https://%s/api/auth/callback", domain)
                            log.Printf("REPLIT environment: Using callback URL: %s", callbackURL)
                        } else {
                            // Local development - just use the baseURL
                            callbackURL = fmt.Sprintf("%s/api/auth/callback", baseURL)
                            log.Printf("LOCAL environment: Using callback URL: %s", callbackURL)
                        }
                        
                        log.Printf("Final callback URL: %s (base: %s)", callbackURL, baseURL)
                        
                        // IMPORTANT: Force a final emergency check (all previous steps didn't work)
                        // This is our last line of defense for the callback URL
                        replit_domains_env := os.Getenv("REPLIT_DOMAINS")
                        log.Printf("FINAL CHECK: REPLIT_DOMAINS = '%s'", replit_domains_env)
                        
                        if replit_domains_env != "" && replit_domains_env != "undefined" && 
                           !strings.Contains(callbackURL, replit_domains_env) {
                            // Emergency override - the callbackURL is wrong, fix it!
                            originalCallbackURL := callbackURL
                            callbackURL = fmt.Sprintf("https://%s/api/auth/callback", replit_domains_env)
                            log.Printf("EMERGENCY OVERRIDE: Changing callback URL from '%s' to '%s'", 
                                originalCallbackURL, callbackURL)
                        }
                        
                        // If we're in Replit, ensure we are NEVER using localhost in the callback URL
                        if isReplit && strings.Contains(callbackURL, "localhost") {
                            log.Printf("FATAL ERROR: Still using localhost in Replit environment!")
                            if replit_domains_env != "" && replit_domains_env != "undefined" {
                                originalCallbackURL := callbackURL
                                callbackURL = fmt.Sprintf("https://%s/api/auth/callback", replit_domains_env)
                                log.Printf("LAST RESORT FIX: Changing localhost URL '%s' to '%s'", 
                                    originalCallbackURL, callbackURL)
                            }
                        }
                        
                        // Last chance logging
                        log.Printf("FINAL CALLBACK URL: %s", callbackURL)

                        // DEBUGGING: Print full authURL construction process
                        sdk_function_url := casdoorsdk.GetSigninUrl(callbackURL)
                        
                        // Manually construct and print the URL for comparison
                        // Using net/url to properly encode the callback URL
                        escapedCallback := url.QueryEscape(callbackURL)
                        log.Printf("ESCAPED CALLBACK URL: %s", escapedCallback)
                        
                        // Hardcode the Casdoor URL with our application parameters
                        manual_auth_url := fmt.Sprintf(
                            "https://tracextech.casdoor.com/login/oauth/authorize?client_id=d85be9c2468eae1dbf58&response_type=code&redirect_uri=%s&scope=read&state=eudr-complimate", 
                            escapedCallback)
                        
                        log.Printf("SDK URL: %s", sdk_function_url)
                        log.Printf("MANUAL URL: %s", manual_auth_url)
                        
                        // Check if SDK URL contains the proper callback URL
                        var authURL string
                        if !strings.Contains(sdk_function_url, url.QueryEscape(callbackURL)) {
                            log.Printf("WARNING: SDK URL does not contain the proper callback URL! Using manual URL instead.")
                            authURL = manual_auth_url
                        } else {
                            authURL = sdk_function_url
                        }
                        
                        log.Printf("Redirecting to Casdoor URL: %s", authURL)
                        c.Redirect(http.StatusTemporaryRedirect, authURL)
                })

                // Casdoor callback handler
                api.GET("auth/callback", func(c *gin.Context) {
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
                        // we need to determine the base URL of our frontend entry point
                        var baseURL string
                        var dashboardPath = "/dashboard" // Specific route to redirect to
                        
                        // Determine the proper base URL based on environment
                        // First check for REPLIT_DOMAINS environment variable (most reliable)
                        replitDomainsEnv := os.Getenv("REPLIT_DOMAINS")
                        if replitDomainsEnv != "" {
                            baseURL = fmt.Sprintf("https://%s", replitDomainsEnv)
                            log.Printf("Using Replit Domains from environment variable for redirect: %s", baseURL)
                        } else {
                            // Fall back to headers
                            host := c.Request.Host
                            
                            // Get the X-Forwarded-Host when available
                            forwardedHost := c.GetHeader("X-Forwarded-Host")
                            
                            // Check for custom header from Express
                            replitDomain := c.GetHeader("X-Replit-Domain")
                            forwardedProto := c.GetHeader("X-Forwarded-Proto")
                            
                            // Log all headers for debugging
                            log.Printf("Host headers: Host=%s, X-Forwarded-Host=%s, X-Forwarded-Proto=%s", 
                                host, forwardedHost, forwardedProto)
                            log.Printf("Custom header X-Replit-Domain=%s", replitDomain)
                            
                            // Try to get the domain that was used for the original auth request
                            // First check if the domain was saved in a cookie
                            originalDomain, _ := c.Cookie("original_domain")
                            if originalDomain != "" {
                                baseURL = originalDomain
                                log.Printf("Using original domain from cookie: %s", baseURL)
                            } else if replitDomain != "" {
                                // If Express sent us a domain, use it (second most reliable)
                                baseURL = replitDomain
                                log.Printf("Using domain from Express header: %s", baseURL)
                            } else if strings.Contains(host, "replit") || strings.Contains(host, ".app") || 
                               strings.Contains(host, "repl.co") {
                                // Default to https in Replit environment
                                protocol := "https"
                                if forwardedProto != "" {
                                    protocol = forwardedProto
                                }
                                
                                // Determine the hostname for callback
                                if forwardedHost != "" {
                                    host = forwardedHost
                                }
                                
                                baseURL = fmt.Sprintf("%s://%s", protocol, host)
                                log.Printf("Replit environment detected, using base URL: %s", baseURL)
                            } else {
                                // Local development - Express server is the entry point
                                baseURL = "http://localhost:5000"
                                log.Printf("Local environment detected, using base URL: %s", baseURL)
                            }
                        }
                        
                        log.Printf("Using base URL for dashboard redirect: %s", baseURL)
                        
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
