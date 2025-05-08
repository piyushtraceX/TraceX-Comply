package main

import (
	"log"
	"os"
	"strconv"

	"github.com/eudrcomply/api/internal/database"
	"github.com/eudrcomply/api/internal/server"
)

func main() {
	// Set up logging
	logger := log.New(os.Stdout, "", log.LstdFlags)

	// Get environment variables or use defaults
	port := getEnvAsInt("PORT", 8080)
	env := getEnv("ENV", "development")
	dsn := getEnv("DATABASE_URL", "")

	// Check for required environment variables
	if dsn == "" {
		logger.Fatal("DATABASE_URL must be set")
	}

	// Create server config
	cfg := server.Config{
		Port: port,
		Env:  env,
		DSN:  dsn,
	}

	// Connect to database
	db, err := database.ConnectDB(dsn)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %s", err)
	}

	// Create and start server
	srv := server.New(cfg, db)
	err = srv.Start()
	if err != nil {
		logger.Fatalf("Server error: %s", err)
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvAsInt gets an environment variable as an integer or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}