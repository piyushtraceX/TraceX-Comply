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
        "github.com/gin-gonic/gin"
)

func main() {
        // Set default port if not provided
        port := os.Getenv("PORT")
        if port == "" {
                port = "8080"
        }

        // Create router
        router := gin.Default()

        // Configure CORS
        router.Use(cors.New(cors.Config{
                AllowOrigins:     []string{"*", "http://localhost:5000", "https://*.replit.app"},
                AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
                AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Set-Cookie", "Cookie"},
                ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
                AllowCredentials: true,
                MaxAge:           12 * time.Hour,
        }))

        // API routes
        api := router.Group("/api")
        {
                // Health check endpoint
                api.GET("/health", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{
                                "status": "ok",
                                "message": "Go API server is running",
                                "timestamp": time.Now().Format(time.RFC3339),
                                "version": "1.0.0",
                        })
                })
                
                // Auth routes
                auth := api.Group("/auth")
                {
                        auth.POST("/login", handleLogin)
                        auth.POST("/logout", handleLogout)
                        auth.GET("/me", handleGetCurrentUser)
                        auth.POST("/switch-tenant", handleSwitchTenant)
                }

                // User routes
                users := api.Group("/users")
                {
                        users.GET("", handleGetUsers)
                        users.GET("/:id", handleGetUser)
                        users.POST("", handleCreateUser)
                        users.PUT("/:id", handleUpdateUser)
                        users.DELETE("/:id", handleDeleteUser)
                }
                
                // Test endpoints for verifying Go API is working
                api.GET("/test", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{
                                "message": "Go API test endpoint is working",
                                "timestamp": time.Now().Format(time.RFC3339),
                        })
                })
                
                // Simple CORS preflight test
                api.OPTIONS("/test", func(c *gin.Context) {
                        c.Status(http.StatusOK)
                })
        }

        // Setup static file serving from client build directory
        staticDir := os.Getenv("STATIC_DIR")
        if staticDir == "" {
                // Default to the client build directory
                staticDir = "../client/dist"
        }
        
        // Get absolute path to static directory
        absStaticDir, err := filepath.Abs(staticDir)
        if err != nil {
                log.Printf("Warning: Could not resolve absolute path for static directory: %v", err)
                absStaticDir = staticDir
        }
        
        log.Printf("Serving static files from: %s", absStaticDir)
        
        // Serve static files
        router.Static("/assets", filepath.Join(absStaticDir, "assets"))
        router.Static("/src", filepath.Join(absStaticDir, "src"))  // For Vite dev
        router.Static("/node_modules", filepath.Join(absStaticDir, "node_modules"))  // For Vite dev
        router.Static("/@fs", filepath.Join(absStaticDir, "@fs"))  // For Vite dev
        router.Static("/locales", filepath.Join(absStaticDir, "locales"))
        router.StaticFile("/favicon.ico", filepath.Join(absStaticDir, "favicon.ico"))
        
        // Handle HTML5 history API for SPA routing
        router.NoRoute(func(c *gin.Context) {
                // Skip API routes
                if strings.HasPrefix(c.Request.URL.Path, "/api") {
                        c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
                        return
                }
                
                // For all other routes, serve the index.html file
                c.File(filepath.Join(absStaticDir, "index.html"))
        })
        
        // Start server
        serverAddr := fmt.Sprintf("0.0.0.0:%s", port)
        log.Printf("Server running on %s", serverAddr)
        if err := router.Run(serverAddr); err != nil {
                log.Fatalf("Failed to start server: %v", err)
        }
}

// Auth handlers
func handleLogin(c *gin.Context) {
        var credentials struct {
                Username string `json:"username" binding:"required"`
                Password string `json:"password" binding:"required"`
        }

        if err := c.ShouldBindJSON(&credentials); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
                return
        }

        // For demo purposes, accept any credentials
        // In production, validate against database
        user := gin.H{
                "id":       1,
                "username": credentials.Username,
                "name":     "Demo User",
                "email":    "demo@example.com",
        }

        c.JSON(http.StatusOK, gin.H{
                "user": user,
        })
}

func handleLogout(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func handleGetCurrentUser(c *gin.Context) {
        // In production, get user from session
        // For demo, return sample user
        user := gin.H{
                "id":       1,
                "username": "demouser",
                "name":     "Demo User",
                "email":    "demo@example.com",
        }
        
        c.JSON(http.StatusOK, gin.H{
                "user": user,
        })
}

func handleSwitchTenant(c *gin.Context) {
        var request struct {
                TenantID int `json:"tenantId" binding:"required"`
        }

        if err := c.ShouldBindJSON(&request); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
                return
        }

        tenant := gin.H{
                "id":          request.TenantID,
                "name":        fmt.Sprintf("Tenant %d", request.TenantID),
                "description": "Demo tenant",
        }

        c.JSON(http.StatusOK, gin.H{
                "tenant": tenant,
        })
}

// User handlers
func handleGetUsers(c *gin.Context) {
        users := []gin.H{
                {
                        "id":       1,
                        "username": "user1",
                        "name":     "User One",
                        "email":    "user1@example.com",
                },
                {
                        "id":       2,
                        "username": "user2",
                        "name":     "User Two",
                        "email":    "user2@example.com",
                },
        }

        c.JSON(http.StatusOK, gin.H{"users": users})
}

func handleGetUser(c *gin.Context) {
        id := c.Param("id")
        
        user := gin.H{
                "id":       id,
                "username": "demo",
                "name":     "Demo User",
                "email":    "demo@example.com",
        }

        c.JSON(http.StatusOK, gin.H{"user": user})
}

func handleCreateUser(c *gin.Context) {
        var user struct {
                Username string `json:"username" binding:"required"`
                Password string `json:"password" binding:"required"`
                Name     string `json:"name" binding:"required"`
                Email    string `json:"email" binding:"required"`
        }

        if err := c.ShouldBindJSON(&user); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
                return
        }

        // Return created user with ID
        c.JSON(http.StatusCreated, gin.H{
                "user": gin.H{
                        "id":       100,
                        "username": user.Username,
                        "name":     user.Name,
                        "email":    user.Email,
                },
        })
}

func handleUpdateUser(c *gin.Context) {
        id := c.Param("id")
        
        var updates struct {
                Name  string `json:"name"`
                Email string `json:"email"`
        }

        if err := c.ShouldBindJSON(&updates); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "user": gin.H{
                        "id":       id,
                        "username": "demo",
                        "name":     updates.Name,
                        "email":    updates.Email,
                },
        })
}

func handleDeleteUser(c *gin.Context) {
        id := c.Param("id")
        c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("User %s deleted successfully", id)})
}