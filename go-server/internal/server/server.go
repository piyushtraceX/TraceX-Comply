package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/eudrcomply/api/internal/handlers"
	"github.com/eudrcomply/api/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Config holds application configuration
type Config struct {
	Port int
	Env  string
	DSN  string
}

// Server represents the API server
type Server struct {
	config Config
	router *gin.Engine
	db     *gorm.DB
	logger *log.Logger
}

// New creates a new server instance
func New(cfg Config, db *gorm.DB) *Server {
	// Initialize logger
	logger := log.New(os.Stdout, "", log.LstdFlags)

	// Set Gin mode based on environment
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create a new router
	router := gin.New()

	// Create a new server
	srv := &Server{
		config: cfg,
		router: router,
		db:     db,
		logger: logger,
	}

	// Initialize routes
	srv.setupRoutes()

	return srv
}

// setupRoutes configures all the routes for our application
func (s *Server) setupRoutes() {
	// Recovery middleware
	s.router.Use(gin.Recovery())
	
	// Logger middleware
	s.router.Use(gin.Logger())
	
	// CORS middleware
	s.router.Use(middleware.Cors())

	// Static files for the frontend
	s.router.Static("/assets", "./client/dist/assets")
	s.router.StaticFile("/", "./client/dist/index.html")

	// Create API group
	api := s.router.Group("/api")
	
	// Health check endpoint
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"env":    s.config.Env,
		})
	})

	// Auth routes
	auth := api.Group("/auth")
	{
		h := handlers.NewAuthHandler(s.db)
		auth.POST("/login", h.Login)
		auth.POST("/logout", middleware.AuthRequired(), h.Logout)
		auth.GET("/me", middleware.AuthRequired(), h.GetCurrentUser)
		auth.POST("/switch-tenant", middleware.AuthRequired(), h.SwitchTenant)
	}

	// User routes
	users := api.Group("/users")
	users.Use(middleware.AuthRequired())
	{
		h := handlers.NewUserHandler(s.db)
		users.GET("/", h.List)
		users.POST("/", h.Create)
		users.GET("/:id", h.Get)
		users.PUT("/:id", h.Update)
		users.DELETE("/:id", h.Delete)
		users.POST("/:id/roles", h.AssignRole)
		users.DELETE("/:id/roles/:roleId", h.RemoveRole)
	}

	// Handle 404 routes
	s.router.NoRoute(func(c *gin.Context) {
		// For API routes, return JSON
		if c.Request.URL.Path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "API endpoint not found",
			})
			return
		}
		
		// For everything else, return the frontend app to handle routing
		c.File("./client/dist/index.html")
	})
}

// Start starts the server
func (s *Server) Start() error {
	// Create an HTTP server with proper shutdown
	srv := &http.Server{
		Addr:         ":" + strconv.Itoa(s.config.Port),
		Handler:      s.router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Start the server in a goroutine
	go func() {
		s.logger.Printf("Starting server in %s mode on port %d\n", s.config.Env, s.config.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Fatalf("Server error: %s", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	s.logger.Println("Shutting down server...")

	// Create a context with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Shutdown the server
	if err := srv.Shutdown(ctx); err != nil {
		s.logger.Fatalf("Server forced to shutdown: %s", err)
		return err
	}

	s.logger.Println("Server exiting")
	return nil
}