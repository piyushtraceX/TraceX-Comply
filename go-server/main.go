package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/markbates/goth/gothic"

	"eudr-comply/go-server/auth"
	"eudr-comply/go-server/handlers"
	"eudr-comply/go-server/middleware"
	"eudr-comply/go-server/routes"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Set up database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to PostgreSQL
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	// Test the connection
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	log.Println("Connected to PostgreSQL database")

	// Initialize auth providers
	auth.InitAuth()

	// Initialize Gin router
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

	// Setup Gothic session middleware
	router.Use(func(c *gin.Context) {
		gothic.GetProviderName = func(*http.Request) (string, error) {
			return "casdoor", nil
		}
		c.Next()
	})

	// Health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "version": "1.0.0"})
	})

	// Register auth routes
	auth.RegisterRoutes(router, db)

	// Register API routes
	apiGroup := router.Group("/api")
	{
		// Apply JWT auth middleware to protected routes
		apiGroup.Use(middleware.JWTAuthMiddleware())

		// Register user routes
		routes.RegisterUserRoutes(apiGroup, db)
		routes.RegisterRoleRoutes(apiGroup, db)
		routes.RegisterTenantRoutes(apiGroup, db)
		routes.RegisterPermissionRoutes(apiGroup, db)
	}

	// Define port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("EUDR Comply Go server running on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}