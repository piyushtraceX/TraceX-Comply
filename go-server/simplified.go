package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
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

	// Log configuration
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Printf("Starting simplified Go API server on port %s", port)

	// Create router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":    "ok",
				"message":   "Go API server is running",
				"timestamp": time.Now().Format(time.RFC3339),
				"version":   "1.0.0",
			})
		})

		// Test endpoint for verifying Go API is working
		api.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message":   "Go API test endpoint is working",
				"timestamp": time.Now().Format(time.RFC3339),
			})
		})

		// Simple authentication endpoint
		api.POST("/auth/login", func(c *gin.Context) {
			var credentials struct {
				Username string `json:"username" binding:"required"`
				Password string `json:"password" binding:"required"`
			}

			if err := c.ShouldBindJSON(&credentials); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
				return
			}

			// For demo purposes, accept any credentials
			user := gin.H{
				"id":       1,
				"username": credentials.Username,
				"name":     "Demo User",
				"email":    "demo@example.com",
			}

			c.JSON(http.StatusOK, gin.H{
				"user": user,
			})
		})

		// Get current user endpoint
		api.GET("/auth/me", func(c *gin.Context) {
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
		})
	}

	// Start server
	serverAddr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Server running on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}