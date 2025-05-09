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

        "eudr-comply/go-server/handlers"
        "eudr-comply/go-server/middleware"
        "eudr-comply/go-server/models"
        "eudr-comply/go-server/routes"
)

func main() {
        // Load .env file if it exists
        err := godotenv.Load()
        if err != nil {
                log.Println("No .env file found, using environment variables")
        }

        // Set up database connection
        dbURL := os.Getenv("DATABASE_URL")
        if dbURL == "" {
                log.Fatal("DATABASE_URL is required")
        }

        // Connect to database
        db, err := sql.Open("postgres", dbURL)
        if err != nil {
                log.Fatalf("Error connecting to database: %v", err)
        }
        defer db.Close()

        // Test database connection
        err = db.Ping()
        if err != nil {
                log.Fatalf("Error connecting to database: %v", err)
        }
        
        // Make sure we have the schema
        err = models.InitializeSchema(db)
        if err != nil {
                log.Fatalf("Error initializing schema: %v", err)
        }

        // Create default admin user if it doesn't exist
        err = models.CreateDefaultAdminUserIfNotExists(db)
        if err != nil {
                log.Fatalf("Error creating default admin user: %v", err)
        }

        // Set up Gin
        r := gin.Default()

        // Set up CORS middleware
        r.Use(cors.New(cors.Config{
                AllowOrigins:     []string{"*"},
                AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
                AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
                ExposeHeaders:    []string{"Content-Length"},
                AllowCredentials: true,
                MaxAge:           12 * time.Hour,
        }))

        // Set up middleware that doesn't require authentication
        r.Use(middleware.Logger())

        // Health check endpoint
        r.GET("/health", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                        "status": "ok",
                        "time":   time.Now().Format(time.RFC3339),
                })
        })

        // API routes that don't require authentication
        api := r.Group("/api")
        {
                api.POST("/auth/login", handlers.Login(db))
                api.POST("/auth/register", handlers.Register(db))
                api.POST("/auth/seed-demo-user", handlers.SeedDemoUser(db))
                
                // Routes that require authentication
                authRequired := api.Group("/")
                authRequired.Use(middleware.AuthRequired())
                
                // Register all routes
                routes.RegisterAllRoutes(authRequired, db)
        }

        // Get port from environment
        port := os.Getenv("PORT")
        if port == "" {
                port = "8080"
        }

        // Start server
        log.Printf("Starting server on port %s", port)
        if err := r.Run(":" + port); err != nil {
                log.Fatalf("Error starting server: %v", err)
        }
}