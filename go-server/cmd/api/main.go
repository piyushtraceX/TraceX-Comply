package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/eudrcomply/api/internal/database"
	"github.com/eudrcomply/api/internal/server"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Define command line flags
	port := flag.Int("port", 5000, "API server port")
	env := flag.String("env", "development", "Environment (development|production)")
	dsn := flag.String("dsn", os.Getenv("DATABASE_URL"), "PostgreSQL DSN")
	
	flag.Parse()

	// Create a new application struct with dependencies
	cfg := server.Config{
		Port: *port,
		Env:  *env,
		DSN:  *dsn,
	}

	// Connect to the database
	db, err := database.ConnectDB(cfg.DSN)
	if err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}

	// Create a new server instance
	srv := server.New(cfg, db)

	// Start the server
	err = srv.Start()
	if err != nil {
		log.Fatal(fmt.Errorf("server failed to start: %w", err))
	}
}