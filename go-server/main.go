package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"go-server/handlers"
	"go-server/middleware"
	"go-server/models"
)

func main() {
	// Set up logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting Go server...")

	// Get database connection string
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Set connection pool parameters
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Successfully connected to database")

	// Initialize database schema
	err = models.InitializeSchema(db)
	if err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}
	log.Println("Database schema initialized")

	// Create default admin user if no users exist
	err = models.CreateDefaultAdminUserIfNotExists(db)
	if err != nil {
		log.Fatalf("Failed to create default admin user: %v", err)
	}

	// Set up Gin router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Add database to context
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Public routes (no authentication required)
		api.POST("/auth/login", handlers.Login(db))
		api.POST("/auth/register", handlers.Register(db))
		api.POST("/seed-demo-user", handlers.SeedDemoUser(db))

		// Protected routes (authentication required)
		protected := api.Group("")
		protected.Use(middleware.JWTAuth(db))
		{
			// Auth routes
			protected.GET("/auth/me", handlers.GetCurrentUser(db))
			protected.POST("/auth/logout", handlers.Logout)
			protected.POST("/auth/switch-tenant", handlers.SwitchTenant(db))

			// User routes
			protected.GET("/users", func(c *gin.Context) {
				// Get users based on query parameters
				c.JSON(200, gin.H{
					"message": "This endpoint will list users",
				})
			})

			protected.POST("/users", func(c *gin.Context) {
				// Create a new user
				c.JSON(200, gin.H{
					"message": "This endpoint will create a user",
				})
			})

			protected.GET("/users/:id", func(c *gin.Context) {
				// Get user by ID
				c.JSON(200, gin.H{
					"message": "This endpoint will get a user by ID",
				})
			})

			protected.PUT("/users/:id", func(c *gin.Context) {
				// Update user by ID
				c.JSON(200, gin.H{
					"message": "This endpoint will update a user by ID",
				})
			})

			protected.DELETE("/users/:id", func(c *gin.Context) {
				// Delete user by ID
				c.JSON(200, gin.H{
					"message": "This endpoint will delete a user by ID",
				})
			})

			// Role routes
			protected.GET("/roles", func(c *gin.Context) {
				// Get roles based on query parameters
				c.JSON(200, gin.H{
					"message": "This endpoint will list roles",
				})
			})

			// Tenant routes
			protected.GET("/tenants", func(c *gin.Context) {
				// Get tenants based on query parameters
				c.JSON(200, gin.H{
					"message": "This endpoint will list tenants",
				})
			})

			// Permission routes
			protected.GET("/permissions", func(c *gin.Context) {
				// Get permissions based on query parameters
				c.JSON(200, gin.H{
					"message": "This endpoint will list permissions",
				})
			})
		}
	}

	// Get port from environment or use default
	port := os.Getenv("GO_PORT")
	if port == "" {
		port = "8081"
	}

	// Start server
	serverAddr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Go server starting on %s", serverAddr)
	
	// Use a non-blocking way to start the server
	go func() {
		if err := router.Run(serverAddr); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Block forever
	select {}
}